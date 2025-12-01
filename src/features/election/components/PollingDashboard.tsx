import { BarChart } from 'lucide-react';
import { PoliticalCompass } from '@/features/politicians';
import type { World } from '@/core';

// Type alias for backwards compatibility
type GameState = World;

interface PollingDashboardProps {
    gameState: GameState;
}

export const PollingDashboard = ({ gameState }: PollingDashboardProps) => {
    const parties = Object.values(gameState.parties as any);

    // Sort by polling in selected constituency
    const sortedParties = [...parties].sort((a: any, b: any) =>
        b.constituencyPolling[gameState.selectedConstituency] - a.constituencyPolling[gameState.selectedConstituency]
    );

    return (
        <div className="space-y-6">
            {/* National/Constituency Polling */}
            <div className="bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-200 flex items-center">
                        <BarChart className="mr-2 text-blue-500" size={20} />
                        Polling: <span className="ml-1 text-blue-400 capitalize">{gameState.selectedConstituency.replace('_', ' ')}</span>
                    </h3>
                    <span className="text-xs font-bold bg-slate-800 px-2 py-1 rounded text-slate-400">Turn {gameState.turn}</span>
                </div>

                <div className="space-y-3">
                    {sortedParties.map((party: any) => {
                        const percentage = party.constituencyPolling[gameState.selectedConstituency];
                        if (percentage < 0.1) return null; // Hide negligible parties

                        return (
                            <div key={party.id} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold text-slate-300">{party.name}</span>
                                    <span className="font-mono text-slate-500">{percentage.toFixed(1)}%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${party.color} transition-all duration-500`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Political Compass */}
            <PoliticalCompass parties={parties as any[]} />
        </div>
    );
};
