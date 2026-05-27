import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db/db';
import { calculateScore } from './utils/scoring';
import { AppCard } from './components/AppCard';
import { ReviewModal } from './components/ReviewModal';
import { AdminPanel } from './components/AdminPanel';
import { PaymentApp } from './types';
import { Wallet, Globe, Zap, Star, TrendingDown, Sparkles, CreditCard, QrCode, Smartphone, Coins } from 'lucide-react';

function App() {
    const [country, setCountry] = useState('US');
    const [destinationCountry, setDestinationCountry] = useState('US');
    const [transferAmount, setTransferAmount] = useState<number>(100);
    const [preference, setPreference] = useState<'lowest-fee' | 'fastest' | 'best-rated'>('lowest-fee');
    const [selectedApp, setSelectedApp] = useState<PaymentApp | null>(null);
    const [capabilities, setCapabilities] = useState({
        nfc: false,
        qr: false,
        card: false,
        crypto: false
    });

    // Live Query for Apps (Fully dynamic in-memory calculations for instant UI feedback)
    const apps = useLiveQuery(async () => {
        const allApps = await db.apps.toArray();
        const scoredApps = await Promise.all(
            allApps.map(async (app) => {
                const reviews = await db.reviews.where('app_id').equals(app.id).toArray();
                const score = calculateScore({
                    app,
                    reviews,
                    selectedPreference: preference,
                    transferAmount,
                    destinationCountry
                });
                return {
                    ...app,
                    cached_score: score
                };
            })
        );

        return scoredApps
            .filter((app) => {
                // Corridor matching
                const matchesSource = app.country === country;
                
                // If destination is different from source (International), check supported destinations
                const isInternational = destinationCountry !== country;
                const matchesDestination = !isInternational || app.supported_destinations.includes(destinationCountry);

                // Capability matching
                const matchesNfc = !capabilities.nfc || app.has_nfc;
                const matchesQr = !capabilities.qr || app.has_qr_code;
                const matchesCard = !capabilities.card || app.has_debit_card;
                const matchesCrypto = !capabilities.crypto || app.has_crypto;

                return matchesSource && matchesDestination && matchesNfc && matchesQr && matchesCard && matchesCrypto;
            })
            .sort((a, b) => b.cached_score - a.cached_score);
    }, [country, destinationCountry, transferAmount, preference, capabilities]);

    // Seed database if empty on load
    useEffect(() => {
        const initDB = async () => {
            const { seedDatabaseIfEmpty } = await import('./db/db');
            await seedDatabaseIfEmpty();
        };
        initDB();
    }, []);

    const toggleCapability = (key: 'nfc' | 'qr' | 'card' | 'crypto') => {
        setCapabilities(prev => ({ ...prev, [key]: !prev[key] }));
    };

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

                {/* Main Filter Panel */}
                <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-800/80 p-6 mb-10 shadow-xl space-y-6">
                    {/* Row 1: Amount & Corridor */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Transfer Amount */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                                Send Amount
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-3.5 text-slate-450 font-bold text-sm">$</span>
                                <input
                                    type="number"
                                    min="1"
                                    value={transferAmount}
                                    onChange={(e) => setTransferAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                                    className="w-full pl-7 pr-3 py-3 bg-slate-950 border border-slate-800 text-slate-250 font-bold rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                                    placeholder="Enter amount"
                                />
                            </div>
                        </div>

                        {/* Location Select (Source) */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                                <Globe size={14} className="text-indigo-400" /> Source Location
                            </label>
                            <select
                                value={country}
                                onChange={(e) => {
                                    setCountry(e.target.value);
                                    if (destinationCountry === country) {
                                        setDestinationCountry(e.target.value);
                                    }
                                }}
                                className="w-full p-3.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                            >
                                <option value="US">🇺🇸 United States</option>
                                <option value="UK">🇬🇧 United Kingdom</option>
                                <option value="IN">🇮🇳 India</option>
                                <option value="EU">🇪🇺 Europe</option>
                            </select>
                        </div>

                        {/* Destination Country */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                                <Globe size={14} className="text-violet-400" /> Destination Location
                            </label>
                            <select
                                value={destinationCountry}
                                onChange={(e) => setDestinationCountry(e.target.value)}
                                className="w-full p-3.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                            >
                                <option value="US">🇺🇸 United States</option>
                                <option value="UK">🇬🇧 United Kingdom</option>
                                <option value="IN">🇮🇳 India</option>
                                <option value="EU">🇪🇺 Europe</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 2: Optimization Criteria & Capabilities Checklist */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-800/50">
                        {/* Optimization Goals */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                                Optimization Criteria
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

                        {/* Capabilities Checklist */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                                Must-Have Capabilities
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => toggleCapability('nfc')}
                                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-start gap-2
                    ${capabilities.nfc ? 'bg-violet-950/40 text-violet-300 border-violet-850 shadow-md' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/50'}`}
                                >
                                    <Smartphone size={13} /> NFC / Tap Pay
                                </button>
                                <button
                                    onClick={() => toggleCapability('qr')}
                                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-start gap-2
                    ${capabilities.qr ? 'bg-violet-950/40 text-violet-300 border-violet-850 shadow-md' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/50'}`}
                                >
                                    <QrCode size={13} /> QR Code / UPI
                                </button>
                                <button
                                    onClick={() => toggleCapability('card')}
                                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-start gap-2
                    ${capabilities.card ? 'bg-violet-950/40 text-violet-300 border-violet-850 shadow-md' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/50'}`}
                                >
                                    <CreditCard size={13} /> Debit Card
                                </button>
                                <button
                                    onClick={() => toggleCapability('crypto')}
                                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-start gap-2
                    ${capabilities.crypto ? 'bg-violet-950/40 text-violet-300 border-violet-850 shadow-md' : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/50'}`}
                                >
                                    <Coins size={13} /> Cryptocurrency
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Corridor Status Badge */}
                {country !== destinationCountry && (
                    <div className="mb-6 p-4 rounded-2xl bg-indigo-950/20 border border-indigo-900/30 flex items-center gap-3 text-sm text-indigo-300 animate-pulse">
                        <Sparkles size={16} />
                        <span>Comparing international transfer rates from <strong>{country}</strong> to <strong>{destinationCountry}</strong>. Custom exchange rate markups applied.</span>
                    </div>
                )}

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
                            <p className="text-slate-400 text-sm">No apps loaded or matched. Try adjusting your capability filters or seed default data in the Admin Console.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                            {apps.map((app, index) => (
                                <AppCard
                                    key={app.id}
                                    app={app}
                                    rank={index + 1}
                                    onClick={() => setSelectedApp(app)}
                                    transferAmount={transferAmount}
                                    destinationCountry={destinationCountry}
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