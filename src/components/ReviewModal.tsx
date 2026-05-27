import { useState } from 'react';
import { PaymentApp } from '../types';
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-indigo-500/10">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-100">{app.name}</h2>
                        <p className="text-xs text-slate-400 mt-1">Base Rating: {app.base_rating} ({app.base_count} ratings)</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Review Form */}
                    <form onSubmit={handleSubmit} className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80">
                        <h3 className="text-sm font-bold text-slate-300 mb-3.5 uppercase tracking-wider">Write a Review</h3>
                        <div className="flex space-x-2 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`${rating >= star ? 'text-yellow-400 hover:scale-110' : 'text-slate-700 hover:text-slate-500'} transition-all`}
                                >
                                    <Star size={22} fill={rating >= star ? "currentColor" : "none"} />
                                </button>
                            ))}
                        </div>
                        <textarea
                            className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder-slate-500 mb-4 outline-none transition-colors"
                            placeholder="Share your experience with this payment app..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={3}
                        />
                        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all">
                            <Send size={14} /> Submit Review
                        </button>
                    </form>

                    {/* Review List */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Recent Reviews</h3>
                        {!reviews || reviews.length === 0 ? (
                            <p className="text-slate-500 text-center py-6 text-sm">No reviews yet. Be the first to leave one!</p>
                        ) : (
                            <div className="space-y-3">
                                {reviews.map((r) => (
                                    <div key={r.id} className="bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={11} fill={i < r.rating ? "currentColor" : "none"} className={i < r.rating ? "" : "text-slate-800"} />
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-medium text-slate-500">{new Date(r.timestamp * 1000).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-slate-300 text-sm leading-relaxed">{r.text}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};