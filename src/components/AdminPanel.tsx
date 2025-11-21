import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { db, recomputeAllScores, resetDatabase } from '../db/db';
import { PaymentApp, Review } from '../types';
import { Download, Upload, RefreshCw, Trash2, Play, Pause } from 'lucide-react';

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
            <button onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg opacity-50 hover:opacity-100 z-40">
                ⚙️
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 bg-white p-6 rounded-xl shadow-2xl border border-gray-200 w-80 z-50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Admin Console</h3>
                <button onClick={() => setIsOpen(false)}><XIcon /></button>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-semibold mb-1">Import Apps (CSV)</label>
                    <input type="file" accept=".csv" onChange={handleAppsUpload} className="text-xs w-full" />
                </div>
                <div>
                    <label className="block text-xs font-semibold mb-1">Import Reviews (CSV)</label>
                    <input type="file" accept=".csv" onChange={handleReviewsUpload} className="text-xs w-full" />
                </div>

                <div className="flex gap-2 pt-2">
                    <button onClick={exportData} className="flex-1 bg-blue-50 text-blue-600 text-xs py-2 rounded flex justify-center items-center gap-1">
                        <Download size={12} /> Export
                    </button>
                    <button onClick={() => recomputeAllScores(currentPreference)} className="flex-1 bg-blue-50 text-blue-600 text-xs py-2 rounded flex justify-center items-center gap-1">
                        <RefreshCw size={12} /> Rescore
                    </button>
                </div>

                <button
                    onClick={() => setSimulating(!simulating)}
                    className={`w-full py-2 rounded text-xs font-bold flex justify-center items-center gap-2 ${simulating ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                >
                    {simulating ? <><Pause size={12} /> Simulating (Live)</> : <><Play size={12} /> Simulate Incoming</>}
                </button>

                <button onClick={() => { if (confirm('Clear DB?')) resetDatabase(); }} className="w-full bg-red-50 text-red-600 text-xs py-2 rounded flex justify-center items-center gap-1">
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