import React, { useState } from 'react';
import { PaymentApp, Review } from '../types';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, recomputeScoresForApp } from '../db/db';
import { X, Star, Send } from 'lucide-react';

interface ReviewModalProps {
    app: PaymentApp;
    preference: 'lowest-fee' | 'fastest' | 'best-rated';
    onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ app, preference, onClose }) => {
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');

    // Fetch recent reviews
    const reviews = useLiveQuery(async () => {
        return await db.reviews
            .where('app_id')
            .equals(app.id)
            .reverse()
            .limit(20)
            .toArray();
    }, [app.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const timestamp = Math.floor(Date.now() / 1000);

        await db.reviews.add({
            app_id: app.id,
            rating,
            text,
            timestamp
        });

        // Immediate Recompute
        await recomputeScoresForApp(app.id, preference);

        setText('');
        setRating(5);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-2xl font-bold">{app.name}</h2>
                        <p className="text-sm text-gray-500">Base Rating: {app.base_rating} ({app.base_count} ratings)</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Review Form */}
                    <form onSubmit={handleSubmit} className="mb-8 bg-indigo-50 p-4 rounded-xl">
                        <h3 className="font-semibold mb-3">Write a Review</h3>
                        <div className="flex space-x-2 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`${rating >= star ? 'text-yellow-400' : 'text-gray-300'} transition-colors`}
                                >
                                    <Star fill={rating >= star ? "currentColor" : "none"} />
                                </button>
                            ))}
                        </div>
                        <textarea
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 mb-3"
                            placeholder="Share your experience..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={2}
                        />
                        <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700">
                            <Send size={16} /> Submit Review
                        </button>
                    </form>

                    {/* Review List */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">Recent Reviews</h3>
                        {!reviews || reviews.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No reviews yet. Be the first!</p>
                        ) : (
                            reviews.map((r) => (
                                <div key={r.id} className="border-b pb-3 last:border-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} fill={i < r.rating ? "currentColor" : "none"} className={i < r.rating ? "" : "text-gray-200"} />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-400">{new Date(r.timestamp * 1000).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-gray-700 text-sm">{r.text}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};