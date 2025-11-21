import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, recomputeAllScores } from './db/db';
import { AppCard } from './components/AppCard';
import { ReviewModal } from './components/ReviewModal';
import { AdminPanel } from './components/AdminPanel';
import { PaymentApp } from './types';
import { Wallet, Globe, Zap, Star, TrendingDown } from 'lucide-react';

function App() {
    const [country, setCountry] = useState('US');
    const [preference, setPreference] = useState<'lowest-fee' | 'fastest' | 'best-rated'>('lowest-fee');
    const [selectedApp, setSelectedApp] = useState<PaymentApp | null>(null);

    // Live Query for Apps (Reactive to DB changes)
    const apps = useLiveQuery(async () => {
        let collection = db.apps.toCollection();
        // Client-side filtering to support complex sorts if needed, 
        // but Dexie sort requires index. We sort in JS for MVP flexibility.
        const all = await collection.toArray();
        return all
            .filter(a => a.country === country)
            .sort((a, b) => b.cached_score - a.cached_score);
    }, [country]);

    // Recompute scores when preference changes
    useEffect(() => {
        recomputeAllScores(preference);
    }, [preference]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white">
                            <Wallet size={24} />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900">PayPick</h1>
                    </div>
                    <div className="text-xs text-gray-500 hidden sm:block">Frontend-Only MVP</div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Country Select */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Globe size={16} /> Your Location
                            </label>
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="US">United States</option>
                                <option value="UK">United Kingdom</option>
                                <option value="IN">India</option>
                                <option value="EU">Europe</option>
                            </select>
                        </div>

                        {/* Preference Select */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">What matters most?</label>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setPreference('lowest-fee')}
                                    className={`flex-1 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all flex justify-center items-center gap-1
                    ${preference === 'lowest-fee' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    <TrendingDown size={16} /> Lowest Fees
                                </button>
                                <button
                                    onClick={() => setPreference('fastest')}
                                    className={`flex-1 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all flex justify-center items-center gap-1
                    ${preference === 'fastest' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    <Zap size={16} /> Fastest
                                </button>
                                <button
                                    onClick={() => setPreference('best-rated')}
                                    className={`flex-1 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all flex justify-center items-center gap-1
                    ${preference === 'best-rated' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                                >
                                    <Star size={16} /> Rated
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end mb-2">
                        <h2 className="text-lg font-bold text-gray-800">Top Recommendations</h2>
                        <span className="text-sm text-gray-500">{apps?.length || 0} apps found</span>
                    </div>

                    {!apps || apps.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">No apps loaded. Use the Admin gear (bottom right) to Seed Data.</p>
                        </div>
                    ) : (
                        apps.map((app, index) => (
                            <AppCard
                                key={app.id}
                                app={app}
                                rank={index + 1}
                                onClick={() => setSelectedApp(app)}
                            />
                        ))
                    )}
                </div>
            </main>

            {/* Modals */}
            {selectedApp && (
                <ReviewModal
                    app={selectedApp}
                    preference={preference}
                    onClose={() => setSelectedApp(null)}
                />
            )}

            <AdminPanel currentPreference={preference} />
        </div>
    );
}

export default App;