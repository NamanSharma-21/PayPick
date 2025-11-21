import React from 'react';
import { PaymentApp } from '../types';

interface AppCardProps {
    app: PaymentApp;
    rank: number;
    onClick: () => void;
}

export const AppCard: React.FC<AppCardProps> = ({ app, rank, onClick }) => {
    // Visual helper for score color
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-blue-500';
        if (score >= 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                #{rank}
            </div>

            <div className="flex items-start justify-between mb-4 pt-2">
                <div className="flex items-center space-x-4">
                    <img
                        src={app.logo_url || 'https://placehold.co/64x64?text=App'}
                        alt={app.name}
                        className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                    />
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">{app.name}</h3>
                        <p className="text-sm text-gray-500">{app.country}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{app.cached_score}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">PayScore</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                    className={`h-2.5 rounded-full ${getScoreColor(app.cached_score)}`}
                    style={{ width: `${app.cached_score}%` }}
                ></div>
            </div>

            <div className="flex flex-wrap gap-2">
                {app.features.split(',').map((f, i) => (
                    <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-800">
                        {f.trim()}
                    </span>
                ))}
            </div>
        </div>
    );
};