# PayScore Recommender System Formula

This document outlines the mathematical formula and normalization techniques used to compute an app's overall recommendation score (**PayScore**).

---

## Overall Recommendation Score Formula

The **PayScore** is a weighted rating between **0 and 100**, calculated using four primary variables:

$$\text{PayScore} = 0.45 \times \text{RatingNorm} + 0.30 \times \text{SentimentNorm} + 0.15 \times \text{Velocity} + 0.10 \times \text{PreferenceScore}$$

---

## 1. Rating Normalization ($\text{RatingNorm}$)
Combines historical base ratings from app stores with local review entries.

### Step A: Bayesian-Style Average Rating
$$\text{RatingScore} = \frac{(\text{BaseRating} \times \text{BaseCount}) + (\text{AvgReviewRating} \times \text{ReviewCount})}{\text{BaseCount} + \text{ReviewCount}}$$

### Step B: Normalize Range (1.0 - 5.0 ➔ 0 - 100)
$$\text{RatingNorm} = \max\left(0, \frac{\text{RatingScore} - 1}{4} \times 100\right)$$

---

## 2. Recent Sentiment ($\text{SentimentNorm}$)
Analyzes review trends within the **recent 7-day window**. 

### Step A: Convert Ratings to Sentiment Range (-1.0 to +1.0)
For each review in the last 7 days:
$$\text{Sentiment} = \frac{\text{Rating} - 3}{2}$$
*(A 5-star rating yields +1.0, 3-star yields 0.0, and 1-star yields -1.0)*

### Step B: Calculate Average Sentiment
$$\text{AvgSentiment} = \frac{\sum \text{Sentiment}}{\text{RecentReviewsCount}}$$

### Step C: Normalize Range (-1.0 - +1.0 ➔ 0 - 100)
$$\text{SentimentNorm} = \frac{\text{AvgSentiment} + 1}{2} \times 100$$
*(Defaults to **50** if no reviews are registered in the recent 7-day window)*

---

## 3. Review Velocity ($\text{Velocity}$)
Indicates current user engagement trends. High velocity suggests heavy usage/changes in service quality.
$$\text{Velocity} = \min(100, \text{RecentReviewsCount} \times 2)$$

---

## 4. Preference & Calculator Score ($\text{PreferenceScore}$)
Adjusts reactively depending on the user's selected **Optimization Criteria**.

### A. Lowest Fees Preference
Computes the percentage cost of the transaction:
$$\text{TotalFee} = \text{FixedFee} + \left(\text{TransferAmount} \times \frac{\text{PercentFee}}{100}\right) + \left(\text{TransferAmount} \times \frac{\text{MarkupPercent}}{100}\right)$$

$$\text{FeePercent} = \frac{\text{TotalFee}}{\text{TransferAmount}} \times 100$$

$$\text{PreferenceScore} = \max(0, 100 - \text{FeePercent} \times 10)$$
*(A 0% fee earns 100 points; fees above 10% reduce this component score to 0)*

### B. Fastest Speed Preference
Normalizes transfer arrival times:
$$\text{PreferenceScore} = \max\left(0, 100 - \frac{\text{AvgSpeedMinutes}}{14.4}\right)$$
*(Instant transfers (0-2m) earn ~100 points; speeds of 24h (1440m) or slower drop to 0)*

### C. Top Rated Preference
Directly mirrors the rating quality:
$$\text{PreferenceScore} = \text{RatingNorm}$$
