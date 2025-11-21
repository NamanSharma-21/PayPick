export interface PaymentApp {
    id: string;
    name: string;
    country: string;
    features: string;
    base_rating: number;
    base_count: number;
    logo_url: string;
    // Computed field for UI speed
    cached_score: number;
}

export interface Review {
    id?: number; // Auto-increment in Dexie
    app_id: string;
    rating: number;
    text: string;
    timestamp: number; // UTC Epoch in Seconds
}

export interface ScoringParams {
    app: PaymentApp;
    reviews: Review[];
    selectedPreference: 'lowest-fee' | 'fastest' | 'best-rated';
}