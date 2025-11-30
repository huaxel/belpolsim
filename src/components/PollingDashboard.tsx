import { Users } from 'lucide-react';
import { CONSTITUENCIES } from '../constants';
import type { GameState } from '../types';

interface PollingDashboardProps {
    gameState: GameState;
}

export const PollingDashboard = ({ gameState }: PollingDashboardProps) => {
    const c = CONSTITUENCIES[gameState.selectedConstituency];

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold mb-3 flex items-center"><Users size={18} className="mr-2" /> Polling: {c.name}</h3>
            <div className="space-y-3">
                {Object.values(gameState.parties)
                    .filter(p => p.eligibleConstituencies.includes(gameState.selectedConstituency))
                    .sort((a, b) => b.constituencyPolling[gameState.selectedConstituency] - a.constituencyPolling[gameState.selectedConstituency])
                    .map(p => (
                        <div key={p.id}>
                            <div className="flex justify-between text-xs font-bold mb-1">
                                <span>{p.name}</span>
                                <span>{p.constituencyPolling[gameState.selectedConstituency].toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className={`h-2 rounded-full ${p.color}`} style={{ width: `${p.constituencyPolling[gameState.selectedConstituency]}%` }}></div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};
