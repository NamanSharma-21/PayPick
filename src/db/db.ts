import Dexie, { Table } from 'dexie';
import { PaymentApp, Review } from '../types';
import { calculateScore } from '../utils/scoring';
import { defaultApps, defaultReviews } from '../seed_data/default_data';

class PaymentAppDB extends Dexie {
    apps!: Table<PaymentApp>;
    reviews!: Table<Review>;

    constructor() {
        super('PaymentAppDB');
        this.version(1).stores({
            apps: 'id, country, cached_score',
            reviews: '++id, app_id, timestamp'
        });
    }
}

export const db = new PaymentAppDB();

// Helper to recompute score for a single app and update DB
export const recomputeScoresForApp = async (appId: string, preference: 'lowest-fee' | 'fastest' | 'best-rated') => {
    return db.transaction('rw', db.apps, db.reviews, async () => {
        const app = await db.apps.get(appId);
        if (!app) return;

        const reviews = await db.reviews.where('app_id').equals(appId).toArray();
        const newScore = calculateScore({ app, reviews, selectedPreference: preference });

        await db.apps.update(appId, { cached_score: newScore });
    });
};

// Helper to recompute all (used when changing filters or bulk import)
export const recomputeAllScores = async (preference: 'lowest-fee' | 'fastest' | 'best-rated') => {
    const apps = await db.apps.toArray();
    // Process sequentially to avoid locking issues in strict environments, though parallel is usually fine in Dexie
    for (const app of apps) {
        await recomputeScoresForApp(app.id, preference);
    }
};

// Seed DB if empty
export const seedDatabaseIfEmpty = async () => {
    const appsCount = await db.apps.count();
    if (appsCount === 0) {
        const appsToSeed = defaultApps.map(app => ({
            ...app,
            cached_score: 0
        })) as PaymentApp[];
        await db.apps.bulkPut(appsToSeed);
        await db.reviews.bulkAdd(defaultReviews);
        await recomputeAllScores('lowest-fee');
        console.log('Database auto-seeded successfully!');
    }
};

// Reset DB
export const resetDatabase = async () => {
    await db.delete();
    await db.open();
    await seedDatabaseIfEmpty();
};