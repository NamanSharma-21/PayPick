import { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { db, recomputeAllScores, resetDatabase } from '../db/db';
import { Download, RefreshCw, Trash2, Play, Pause } from 'lucide-react';

interface AdminPanelProps {
    currentPreference: 'lowest-fee' | 'fastest' | 'best-rated';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentPreference }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [simulating, setSimulating] = useState(false);
    const simulationInterval = useRef<number | null>(null);

    const handleAppsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const apps = (results.data as any[]).map(row => ({
                    ...row,
                    base_rating: parseFloat(row.base_rating),
                    base_count: parseInt(row.base_count),
                    cached_score: 0
                }));
                await db.apps.bulkPut(apps);
                await recomputeAllScores(currentPreference);
                alert(`Imported ${apps.length} apps.`);
            }
        });
    };

    const handleReviewsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const reviews = (results.data as any[]).map(row => ({
                    ...row,
                    rating: parseInt(row.rating),
                    timestamp: parseInt(row.timestamp)
                }));
                await db.reviews.bulkAdd(reviews);
                await recomputeAllScores(currentPreference);
                alert(`Imported ${reviews.length} reviews.`);
            }
        });
    };

    const exportData = async () => {
        const apps = await db.apps.toArray();
        const reviews = await db.reviews.toArray();

        const appsCsv = Papa.unparse(apps);
        const reviewsCsv = Papa.unparse(reviews);

        downloadBlob(appsCsv, 'apps_export.csv');
        downloadBlob(reviewsCsv, 'reviews_export.csv');
    };

    const downloadBlob = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Simulation Logic
    useEffect(() => {
        if (simulating) {
            simulationInterval.current = window.setInterval(async () => {
                const apps = await db.apps.toArray();
                if (apps.length === 0) return;

                const randomApp = apps[Math.floor(Math.random() * apps.length)];
                const randomRating = Math.floor(Math.random() * 5) + 1;

                await db.reviews.add({
                    app_id: randomApp.id,
                    rating: randomRating,
                    text: 'Simulated live review',
                    timestamp: Math.floor(Date.now() / 1000)
                });

                // Only recompute for this app to test granular updates
                // Note: In real usage we might need to update currentPreference dynamically if passed from parent
                // but here we use the prop.
                // We need to access the latest db state.

                // To ensure the UI reflects this, we trigger a recompute
                // We need to import recomputeScoresForApp inside effect or outside
                const { recomputeScoresForApp } = await import('../db/db');
                await recomputeScoresForApp(randomApp.id, currentPreference);

                console.log(`Simulated review for ${randomApp.name}: ${randomRating} stars`);
            }, 2000); // Every 2 seconds
        } else {
            if (simulationInterval.current) clearInterval(simulationInterval.current);
        }

        return () => {
            if (simulationInterval.current) clearInterval(simulationInterval.current);
        };
    }, [simulating, currentPreference]);

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4 bg-slate-900 hover:bg-indigo-650 text-slate-300 hover:text-white p-3.5 rounded-full shadow-xl border border-slate-800 hover:border-indigo-500 transition-all duration-300 hover:scale-105 z-40">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin-[spin_10s_linear_infinite]">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 bg-slate-900 border border-slate-805 p-6 rounded-2xl shadow-2xl w-80 z-50 text-slate-200 backdrop-blur-md bg-opacity-95">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-100">Admin Console</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-200 transition-colors"><XIcon /></button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Import Apps (CSV)</label>
                    <input type="file" accept=".csv" onChange={handleAppsUpload} className="text-xs w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 file:bg-indigo-600 file:hover:bg-indigo-700 file:border-none file:text-white file:text-[10px] file:font-bold file:px-2.5 file:py-1 file:rounded-md file:cursor-pointer file:mr-2" />
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Import Reviews (CSV)</label>
                    <input type="file" accept=".csv" onChange={handleReviewsUpload} className="text-xs w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 file:bg-indigo-600 file:hover:bg-indigo-700 file:border-none file:text-white file:text-[10px] file:font-bold file:px-2.5 file:py-1 file:rounded-md file:cursor-pointer file:mr-2" />
                </div>

                <div className="flex gap-2 pt-1">
                    <button onClick={exportData} className="flex-1 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750 text-xs py-2 rounded-xl flex justify-center items-center gap-1.5 transition-colors font-semibold">
                        <Download size={12} /> Export
                    </button>
                    <button onClick={() => recomputeAllScores(currentPreference)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 rounded-xl flex justify-center items-center gap-1.5 transition-colors font-semibold shadow-lg shadow-indigo-600/20 border border-indigo-500">
                        <RefreshCw size={12} /> Rescore
                    </button>
                </div>

                <button
                    onClick={() => setSimulating(!simulating)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex justify-center items-center gap-2 border transition-all ${simulating ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50' : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border-slate-750'}`}
                >
                    {simulating ? <><Pause size={12} /> Simulating (Live)</> : <><Play size={12} /> Simulate Incoming</>}
                </button>

                <button onClick={() => { if (confirm('Clear DB?')) resetDatabase(); }} className="w-full bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-900/30 text-xs py-2 rounded-xl flex justify-center items-center gap-1.5 transition-colors font-semibold">
                    <Trash2 size={12} /> Clear Database
                </button>
            </div>
        </div>
    );
};

const XIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);