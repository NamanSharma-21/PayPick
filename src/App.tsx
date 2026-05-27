import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, recomputeAllScores } from './db/db';
import { AppCard } from './components/AppCard';
import { ReviewModal } from './components/ReviewModal';
import { AdminPanel } from './components/AdminPanel';
import { PaymentApp } from './types';
import { Wallet, Globe, Zap, Star, TrendingDown, Sparkles } from 'lucide-react';

function App() {
    const [country, setCountry] = useState('US');
    const [preference, setPreference] = useState<'lowest-fee' | 'fastest' | 'best-rated'>('lowest-fee');
    const [selectedApp, setSelectedApp] = useState<PaymentApp | null>(null);

    // Live Query for Apps (Reactive to DB changes)
    const apps = useLiveQuery(async () => {
        let collection = db.apps.toCollection();
        const all = await collection.toArray();
        return all
            .filter(a => a.country === country)
            .sort((a, b) => b.cached_score - a.cached_score);
    }, [country]);

    // Seed database if empty on load
    useEffect(() => {
        const initDB = async () => {
            const { seedDatabaseIfEmpty } = await import('./db/db');
            await seedDatabaseIfEmpty();
        };
        initDB();
    }, []);

    // Recompute scores when preference changes
    useEffect(() => {
        recomputeAllScores(preference);
    }, [preference]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-12">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Header */}
            <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-900 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-gradient-to-tr from-indigo-500 to-violet-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                            <Wallet size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">PayPick</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/50 px-2.5 py-1 rounded-full border border-indigo-900/30">
                            <Sparkles size={10} /> Premium MVP
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 relative">
                {/* Hero / Welcome */}
                <div className="mb-8 text-center sm:text-left">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight">
                        Find the Perfect Payment App
                    </h2>
                    <p className="mt-2 text-sm text-slate-400 max-w-xl">
                        Instantly score and rank payment apps based on fees, transfer speed, and recent customer reviews in your region.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 mb-10 shadow-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Country Select */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                                <Globe size={14} className="text-indigo-400" /> Your Location
                            </label>
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full p-3 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                            >
                                <option value="US">🇺🇸 United States</option>
                                <option value="UK">🇬🇧 United Kingdom</option>
                                <option value="IN">🇮🇳 India</option>
                                <option value="EU">🇪🇺 Europe</option>
                            </select>
                        </div>

                        {/* Preference Select */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                                What matters most?
                            </label>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setPreference('lowest-fee')}
                                    className={`flex-1 py-3 px-3 rounded-xl border text-xs font-semibold transition-all flex justify-center items-center gap-1.5
                    ${preference === 'lowest-fee' ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/50 hover:text-slate-200'}`}
                                >
                                    <TrendingDown size={14} /> Lowest Fees
                                </button>
                                <button
                                    onClick={() => setPreference('fastest')}
                                    className={`flex-1 py-3 px-3 rounded-xl border text-xs font-semibold transition-all flex justify-center items-center gap-1.5
                    ${preference === 'fastest' ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/50 hover:text-slate-200'}`}
                                >
                                    <Zap size={14} /> Fastest
                                </button>
                                <button
                                    onClick={() => setPreference('best-rated')}
                                    className={`flex-1 py-3 px-3 rounded-xl border text-xs font-semibold transition-all flex justify-center items-center gap-1.5
                    ${preference === 'best-rated' ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/50 hover:text-slate-200'}`}
                                >
                                    <Star size={14} /> Top Rated
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-slate-100">Top Recommendations</h2>
                            <p className="text-xs text-slate-400 mt-1">Smart ranking based on your current preferences</p>
                        </div>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 border border-slate-850 text-slate-400">
                            {apps?.length || 0} apps found
                        </span>
                    </div>

                    {!apps || apps.length === 0 ? (
                        <div className="text-center py-16 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
                            <p className="text-slate-400 text-sm">No apps loaded. Use the Admin Console (bottom right gear) to seed data.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                            {apps.map((app, index) => (
                                <AppCard
                                    key={app.id}
                                    app={app}
                                    rank={index + 1}
                                    onClick={() => setSelectedApp(app)}
                                />
                            ))}
                        </div>
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