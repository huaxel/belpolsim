import { BarChart } from 'lucide-react';
import { PoliticalCompass } from './PoliticalCompass';
import type { GameState } from '../types';

interface PollingDashboardProps {
    gameState: GameState;
}

export const PollingDashboard = ({ gameState }: PollingDashboardProps) => {
    const parties = Object.values(gameState.parties);

    // Sort by polling in selected constituency
    const sortedParties = [...parties].sort((a, b) =>
        b.constituencyPolling[gameState.selectedConstituency] - a.constituencyPolling[gameState.selectedConstituency]
    );

    return (
        <div className="space-y-6">
            {/* National/Constituency Polling */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-700 flex items-center">
                        <BarChart className="mr-2" size={20} />
                        Polling: <span className="ml-1 text-indigo-600 capitalize">{gameState.selectedConstituency.replace('_', ' ')}</span>
                    </h3>
                    <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-500">Turn {gameState.turn}</span>
                </div>

                <div className="space-y-3">
                    {sortedParties.map(party => {
                        const percentage = party.constituencyPolling[gameState.selectedConstituency];
                        if (percentage < 0.1) return null; // Hide negligible parties

                        return (
                            <div key={party.id} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold text-gray-700">{party.name}</span>
                                    <span className="font-mono text-gray-500">{percentage.toFixed(1)}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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
            <PoliticalCompass parties={parties} playerPartyId="player" />
        </div>
    );
};
