import React from 'react';
import { PaymentApp } from '../types';
import { Award, ChevronRight, CheckCircle2, AlertTriangle, Clock, CircleDollarSign } from 'lucide-react';

interface AppCardProps {
    app: PaymentApp;
    rank: number;
    onClick: () => void;
    transferAmount?: number;
    destinationCountry?: string;
}

export const AppCard: React.FC<AppCardProps> = ({ 
    app, 
    rank, 
    onClick, 
    transferAmount = 100, 
    destinationCountry 
}) => {
    // 1. Calculate precise fees
    const isInternational = destinationCountry && destinationCountry !== app.country;
    const markup = isInternational ? app.exchange_rate_markup : 0;
    const calculatedFee = app.fixed_fee + (transferAmount * (app.percent_fee / 100)) + (transferAmount * (markup / 100));
    
    // 2. Format speed
    const formatSpeed = (mins: number) => {
        if (mins <= 2) return 'Instant (under 2m)';
        if (mins <= 15) return 'Within 15 mins';
        if (mins <= 60) return 'Within 1 hour';
        if (mins <= 1440) return 'Same day (under 24h)';
        return `${Math.round(mins / 1440)} days`;
    };

    // 3. Dynamic Pros and Cons
    const pros: string[] = [];
    const cons: string[] = [];

    // Pros generation rules
    if (app.base_rating >= 4.4) pros.push('Top rated by users');
    if (app.avg_speed_mins <= 5) pros.push('Near-instant speed');
    if (calculatedFee === 0) pros.push('100% Free Transfer');
    else if ((calculatedFee / transferAmount) < 0.005) pros.push('Ultra-low fees (<0.5%)');
    
    if (app.has_debit_card) pros.push('Offers debit card');
    if (app.has_crypto) pros.push('Crypto supported');

    // Cons generation rules
    if (app.avg_speed_mins >= 120) cons.push('Slow delivery speed');
    if ((calculatedFee / transferAmount) >= 0.02) cons.push('High transfer fees');
    if (app.base_rating < 3.8) cons.push('Lower user rating');
    if (isInternational && !app.supported_destinations.includes(destinationCountry)) cons.push('Unsupported corridor');

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

            {/* Core Info Row */}
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
                            Origin: {app.country}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200">{app.cached_score}</div>
                    <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">PayScore</div>
                </div>
            </div>

            {/* Real-time Calculator Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5 p-3 rounded-xl bg-slate-950/40 border border-slate-850/60">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-indigo-950/40 rounded-lg text-indigo-400 border border-indigo-900/30">
                        <CircleDollarSign size={14} />
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Est. Fee</div>
                        <div className="text-xs font-bold text-slate-200">
                            {calculatedFee === 0 ? 'Free' : `$${calculatedFee.toFixed(2)}`}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-violet-950/40 rounded-lg text-violet-400 border border-violet-900/30">
                        <Clock size={14} />
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Arrival Speed</div>
                        <div className="text-xs font-bold text-slate-200">
                            {formatSpeed(app.avg_speed_mins)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 mb-5 overflow-hidden">
                <div
                    className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(app.cached_score)} transition-all duration-500`}
                    style={{ width: `${app.cached_score}%` }}
                ></div>
            </div>

            {/* Pros and Cons Highlights */}
            {(pros.length > 0 || cons.length > 0) && (
                <div className="space-y-2 mb-5 pt-3 border-t border-slate-800/40 text-xs">
                    {/* Pros */}
                    {pros.slice(0, 2).map((pro, index) => (
                        <div key={index} className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle2 size={12} className="flex-shrink-0" />
                            <span>{pro}</span>
                        </div>
                    ))}
                    {/* Cons */}
                    {cons.slice(0, 1).map((con, index) => (
                        <div key={index} className="flex items-center gap-2 text-rose-450">
                            <AlertTriangle size={12} className="flex-shrink-0" />
                            <span>{con}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer Features */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-800/40">
                <div className="flex flex-wrap gap-1.5 max-w-[85%]">
                    {app.has_nfc && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 text-slate-400 border border-slate-800">
                            NFC
                        </span>
                    )}
                    {app.has_qr_code && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 text-slate-400 border border-slate-800">
                            QR/UPI
                        </span>
                    )}
                    {app.has_debit_card && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 text-slate-400 border border-slate-800">
                            CARD
                        </span>
                    )}
                    {app.has_crypto && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 text-slate-400 border border-slate-800">
                            CRYPTO
                        </span>
                    )}
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300">
                    <ChevronRight size={16} />
                </div>
            </div>
        </div>
    );
};