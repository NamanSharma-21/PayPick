import { PaymentApp, Review } from '../types';

export const defaultApps: Omit<PaymentApp, 'cached_score'>[] = [
    {
        id: 'app_1',
        name: 'Venmo',
        country: 'US',
        features: 'social,instant,free',
        base_rating: 4.2,
        base_count: 1500,
        logo_url: 'https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?w=128&h=128&fit=crop&auto=format' // Premium image
    },
    {
        id: 'app_2',
        name: 'CashApp',
        country: 'US',
        features: 'bitcoin,fast,simple',
        base_rating: 4.1,
        base_count: 1200,
        logo_url: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=128&h=128&fit=crop&auto=format'
    },
    {
        id: 'app_3',
        name: 'Zelle',
        country: 'US',
        features: 'instant,bank-integrated,no-fee',
        base_rating: 3.8,
        base_count: 5000,
        logo_url: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=128&h=128&fit=crop&auto=format'
    },
    {
        id: 'app_4',
        name: 'Wise',
        country: 'UK',
        features: 'low fee,international,transparent',
        base_rating: 4.8,
        base_count: 800,
        logo_url: 'https://images.unsplash.com/photo-1601597111158-2fceff270190?w=128&h=128&fit=crop&auto=format'
    },
    {
        id: 'app_5',
        name: 'Revolut',
        country: 'UK',
        features: 'travel,crypto,fast',
        base_rating: 4.6,
        base_count: 1100,
        logo_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&h=128&fit=crop&auto=format'
    },
    {
        id: 'app_6',
        name: 'Paytm',
        country: 'IN',
        features: 'wallet,bill-pay,fast',
        base_rating: 4.0,
        base_count: 9000,
        logo_url: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=128&h=128&fit=crop&auto=format'
    },
    {
        id: 'app_7',
        name: 'PhonePe',
        country: 'IN',
        features: 'upi,fast,secure',
        base_rating: 4.5,
        base_count: 8500,
        logo_url: 'https://images.unsplash.com/photo-1559526324-59e2b1324543?w=128&h=128&fit=crop&auto=format'
    },
    {
        id: 'app_8',
        name: 'PayPal',
        country: 'US',
        features: 'secure,global,slow',
        base_rating: 3.5,
        base_count: 10000,
        logo_url: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=128&h=128&fit=crop&auto=format'
    }
];

export const defaultReviews: Review[] = [
    {
        app_id: 'app_4',
        rating: 5,
        text: 'Amazing for travel',
        timestamp: 1696118400
    },
    {
        app_id: 'app_4',
        rating: 5,
        text: 'Best rates found',
        timestamp: 1696204800
    },
    {
        app_id: 'app_1',
        rating: 2,
        text: 'App crashed twice',
        timestamp: 1696204800
    },
    {
        app_id: 'app_3',
        rating: 4,
        text: 'Works with my bank',
        timestamp: 1696291200
    }
];
