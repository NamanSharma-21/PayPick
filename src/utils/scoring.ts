import { ScoringParams } from '../types';

export const calculateScore = ({ app, reviews, selectedPreference, transferAmount = 100, destinationCountry }: ScoringParams): number => {
    // 1. Rating Score
    const reviewCount = reviews.length;
    let avgReviewRating = 0;

    if (reviewCount > 0) {
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        avgReviewRating = sum / reviewCount;
    }

    // rating_score = (base_rating * base_count + avg_review_rating * review_count) / (base_count + review_count)
    const totalCount = app.base_count + reviewCount;
    const ratingScore = totalCount === 0 ? 0 :
        ((app.base_rating * app.base_count) + (avgReviewRating * reviewCount)) / totalCount;

    // rating_norm = (rating_score - 1) / 4 * 100  // maps 1–5 -> 0–100
    const ratingNorm = Math.max(0, ((ratingScore - 1) / 4) * 100);

    // 2. Sentiment (Recent Window = 7 days)
    const now = Date.now() / 1000; // Current time in seconds
    const sevenDaysSeconds = 7 * 24 * 3600;
    const recentReviews = reviews.filter(r => r.timestamp >= (now - sevenDaysSeconds));

    let sentimentNorm = 50; // Default if no recent reviews

    if (recentReviews.length > 0) {
        // recent_sentiment = average((rating - 3)/2) -> maps 1..5 to -1..1
        const sentimentSum = recentReviews.reduce((acc, r) => acc + ((r.rating - 3) / 2), 0);
        const avgSentiment = sentimentSum / recentReviews.length;

        // sentiment_norm = (recent_sentiment + 1) / 2 * 100
        sentimentNorm = ((avgSentiment + 1) / 2) * 100;
    }

    // 3. Velocity
    // velocity = min(100, recent_reviews.length * 2)
    const velocity = Math.min(100, recentReviews.length * 2);

    // 4. Dynamic Preference & Calculator Match
    let preferenceScore = 0;

    if (selectedPreference === 'lowest-fee') {
        // Calculate total fees (fixed + percentage + markup markup)
        const isInternational = destinationCountry && destinationCountry !== app.country;
        const markup = isInternational ? app.exchange_rate_markup : 0;
        
        const totalFee = app.fixed_fee + (transferAmount * (app.percent_fee / 100)) + (transferAmount * (markup / 100));
        const feePercent = transferAmount > 0 ? (totalFee / transferAmount) * 100 : 0;
        
        // 0% fee -> 100 points, 10% fee or more -> 0 points
        preferenceScore = Math.max(0, 100 - feePercent * 10);
    } else if (selectedPreference === 'fastest') {
        // 0-2 mins -> 100 points, 24h (1440 mins) or more -> 0 points
        preferenceScore = Math.max(0, 100 - (app.avg_speed_mins / 14.4));
    } else {
        // 'best-rated': maps to total rating norm directly
        preferenceScore = ratingNorm;
    }

    // 5. Final Score
    // final_score = 0.45*rating_norm + 0.30*sentiment_norm + 0.15*velocity + 0.10*preferenceScore
    const finalScore = (0.45 * ratingNorm) + (0.30 * sentimentNorm) + (0.15 * velocity) + (0.10 * preferenceScore);

    return Number(finalScore.toFixed(2));
};