import { describe, it, expect } from 'vitest';
import { calculateScore } from './scoring';
import { PaymentApp, Review } from '../types';

const mockApp: PaymentApp = {
    id: 'test-app',
    name: 'Test App',
    country: 'US',
    features: 'Low fees, Instant',
    base_rating: 4.0,
    base_count: 100,
    logo_url: '',
    cached_score: 0,
    fixed_fee: 0,
    percent_fee: 0,
    avg_speed_mins: 15,
    supported_destinations: ['US'],
    exchange_rate_markup: 0,
    has_nfc: true,
    has_qr_code: true,
    has_debit_card: true,
    has_crypto: true
};

describe('Scoring Algorithm', () => {
    it('Case 1: No reviews, base rating only', () => {
        // Rating Score = 4.0. Norm = (3/4)*100 = 75.
        // Sentiment defaults to 50. Velocity 0.
        // Preference Score ('best-rated') = ratingNorm = 75.
        // Final = 0.45*75 + 0.30*50 + 0 + 0.10*75 = 33.75 + 15 + 7.5 = 56.25
        const score = calculateScore({ app: mockApp, reviews: [], selectedPreference: 'best-rated' });
        expect(score).toBe(56.25);
    });

    it('Case 2: Lowest fee preference', () => {
        // Fee is 0%, so preference score is 100.
        // Final = 0.45*75 + 0.30*50 + 0 + 0.10*100 = 48.75 + 10 = 58.75
        const score = calculateScore({ app: mockApp, reviews: [], selectedPreference: 'lowest-fee' });
        expect(score).toBe(58.75);
    });

    it('Case 3: High velocity recent reviews', () => {
        const now = Date.now() / 1000;
        const reviews: Review[] = Array(50).fill(null).map(() => ({
            app_id: 'test-app', rating: 4, text: '', timestamp: now
        }));
        // Velocity = min(100, 50*2) = 100.
        // Sentiment: Rating 4 -> (4-3)/2 = 0.5. Norm = (1.5/2)*100 = 75.
        // Rating Score approx 4.0 (Base 4.0, Reviews 4.0). Norm 75.
        // Final = 0.45*75 + 0.30*75 + 0.15*100 + 0.10*75 = 33.75 + 22.5 + 15 + 7.5 = 78.75
        const score = calculateScore({ app: mockApp, reviews, selectedPreference: 'best-rated' });
        expect(score).toBe(78.75);
    });

    it('Case 4: Recent negative spike', () => {
        const now = Date.now() / 1000;
        const reviews: Review[] = Array(10).fill(null).map(() => ({
            app_id: 'test-app', rating: 1, text: '', timestamp: now
        }));
        // Sentiment: Rating 1 -> (1-3)/2 = -1. Norm = 0.
        // Velocity: 20.
        // Rating Score: (4*100 + 1*10) / 110 = 410/110 = 3.727. Norm = (2.727/4)*100 = 68.18
        // Final = 0.45*68.18 + 0.30*0 + 0.15*20 + 0.10*68.18 = 30.68 + 0 + 3 + 6.82 = 40.5
        const score = calculateScore({ app: mockApp, reviews, selectedPreference: 'best-rated' });
        expect(score).toBeCloseTo(40.5, 1);
    });

    it('Case 5: Old reviews only (no velocity, neutral sentiment)', () => {
        const oldTime = (Date.now() / 1000) - (10 * 24 * 3600); // 10 days ago
        const reviews: Review[] = [{ app_id: 'test-app', rating: 5, text: '', timestamp: oldTime }];
        // Velocity = 0. Sentiment default 50.
        // Rating slightly pulled up.
        const score = calculateScore({ app: mockApp, reviews, selectedPreference: 'best-rated' });
        expect(score).toBeGreaterThan(56.25); // Slightly higher due to improved total rating
    });

    it('Case 6: Perfect storm (Features + High Rating + High Sentiment + High Velocity)', () => {
        const now = Date.now() / 1000;
        const reviews: Review[] = Array(50).fill(null).map(() => ({
            app_id: 'test-app', rating: 5, text: '', timestamp: now
        }));
        const score = calculateScore({ app: mockApp, reviews, selectedPreference: 'lowest-fee' });
        expect(score).toBeGreaterThan(90);
    });
});