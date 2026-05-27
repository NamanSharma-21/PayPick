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
    // Calculator & Corridor Props
    fixed_fee: number;
    percent_fee: number;
    avg_speed_mins: number;
    supported_destinations: string[];
    exchange_rate_markup: number; // Percent markup on base rate
    // Capabilities
    has_nfc: boolean;
    has_qr_code: boolean;
    has_debit_card: boolean;
    has_crypto: boolean;
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
    transferAmount?: number;
    destinationCountry?: string;
}