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
    cached_score: 0
};

describe('Scoring Algorithm', () => {
    it('Case 1: No reviews, base rating only', () => {
        // Score should rely on base stats. Sentiment defaults to 50. Velocity 0. Feature match 0.
        // Rating Score = 4.0. Norm = (3/4)*100 = 75.
        // Final = 0.45*75 + 0.30*50 + 0 + 0 = 33.75 + 15 = 48.75
        const score = calculateScore({ app: mockApp, reviews: [], selectedPreference: 'best-rated' });
        expect(score).toBe(48.75);
    });

    it('Case 2: Feature match true', () => {
        // Same as above but feature match = 100.
        // Final = 48.75 + 0.10*100 = 58.75
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
        // Final = 0.45*75 + 0.30*75 + 0.15*100 + 0 = 33.75 + 22.5 + 15 = 71.25
        const score = calculateScore({ app: mockApp, reviews, selectedPreference: 'best-rated' });
        expect(score).toBe(71.25);
    });

    it('Case 4: Recent negative spike', () => {
        const now = Date.now() / 1000;
        const reviews: Review[] = Array(10).fill(null).map(() => ({
            app_id: 'test-app', rating: 1, text: '', timestamp: now
        }));
        // Sentiment: Rating 1 -> (1-3)/2 = -1. Norm = 0.
        // Velocity: 20.
        // Rating Score: (4*100 + 1*10) / 110 = 410/110 = 3.727. Norm = (2.727/4)*100 = 68.18
        // Final = 0.45*68.18 + 0.30*0 + 0.15*20 + 0 = 30.68 + 0 + 3 = 33.68
        const score = calculateScore({ app: mockApp, reviews, selectedPreference: 'best-rated' });
        expect(score).toBeCloseTo(33.68, 1);
    });

    it('Case 5: Old reviews only (no velocity, neutral sentiment)', () => {
        const oldTime = (Date.now() / 1000) - (10 * 24 * 3600); // 10 days ago
        const reviews: Review[] = [{ app_id: 'test-app', rating: 5, text: '', timestamp: oldTime }];
        // Velocity = 0. Sentiment default 50.
        // Rating slightly pulled up.
        const score = calculateScore({ app: mockApp, reviews, selectedPreference: 'best-rated' });
        expect(score).toBeGreaterThan(48.75); // Slightly higher due to improved total rating
    });

    it('Case 6: Perfect storm (Features + High Rating + High Sentiment + High Velocity)', () => {
        const now = Date.now() / 1000;
        const reviews: Review[] = Array(50).fill(null).map(() => ({
            app_id: 'test-app', rating: 5, text: '', timestamp: now
        }));
        // Rating: ~4.3. Norm ~83.
        // Sentiment: 1. Norm 100.
        // Velocity: 100.
        // Feat: 100.
        // Final approx: 0.45*83 + 30 + 15 + 10 = 37.35 + 55 = 92.35
        const score = calculateScore({ app: mockApp, reviews, selectedPreference: 'lowest-fee' });
        expect(score).toBeGreaterThan(90);
    });
});