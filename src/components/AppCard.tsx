import React from 'react';
import { PaymentApp } from '../types';
import { Award, ChevronRight } from 'lucide-react';

interface AppCardProps {
    app: PaymentApp;
    rank: number;
    onClick: () => void;
}

export const AppCard: React.FC<AppCardProps> = ({ app, rank, onClick }) => {
    // Visual helper for score gradient
    const getScoreGradient = (score: number) => {
        if (score >= 80) return 'from-emerald-500 to-teal-400 shadow-emerald-500/20';
        if (score >= 60) return 'from-indigo-500 to-violet-500 shadow-indigo-500/20';
        if (score >= 40) return 'from-amber-500 to-orange-400 shadow-amber-500/20';
        return 'from-rose-500 to-red-500 shadow-rose-500/20';
    };

    return (
        <div
            onClick={onClick}
            className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(99,102,241,0.12)] cursor-pointer relative overflow-hidden group"
        >
            {/* Rank badge */}
            <div className="absolute top-0 left-0 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold px-4 py-1.5 rounded-br-2xl shadow-lg flex items-center gap-1">
                {rank === 1 ? <Award size={12} className="text-yellow-300 animate-pulse" /> : null}
                Rank #{rank}
            </div>

            <div className="flex items-start justify-between mb-5 pt-3">
                <div className="flex items-center space-x-4">
                    <img
                        src={app.logo_url || 'https://placehold.co/64x64/1e293b/f8fafc?text=' + encodeURIComponent(app.name)}
                        alt={app.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-700 bg-slate-800 shadow-inner group-hover:scale-105 transition-transform duration-300"
                    />
                    <div>
                        <h3 className="text-xl font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">{app.name}</h3>
                        <p className="text-xs text-slate-400 tracking-wide font-medium flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            {app.country}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200">{app.cached_score}</div>
                    <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">PayScore</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 mb-5 overflow-hidden">
                <div
                    className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(app.cached_score)} transition-all duration-500`}
                    style={{ width: `${app.cached_score}%` }}
                ></div>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex flex-wrap gap-1.5 max-w-[85%]">
                    {app.features.split(',').map((f, i) => (
                        <span key={i} className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-950/30 text-indigo-300 border border-indigo-900/30">
                            {f.trim()}
                        </span>
                    ))}
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300">
                    <ChevronRight size={16} />
                </div>
            </div>
        </div>
    );
};