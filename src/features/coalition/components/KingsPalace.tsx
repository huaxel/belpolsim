import React from 'react';
import { Crown, ArrowRight } from 'lucide-react';
import type { World } from '@/core';

// Type alias for backwards compatibility
type GameState = World;

interface KingsPalaceProps {
    gameState: GameState;
    onAction: (action: any) => void;
}

export const KingsPalace: React.FC<KingsPalaceProps> = ({ gameState, onAction }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-white p-8">
            <div className="max-w-2xl w-full bg-slate-800 rounded-2xl p-8 shadow-2xl border border-yellow-600/30 text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-yellow-900/30 rounded-full border border-yellow-600">
                        <Crown className="w-16 h-16 text-yellow-500" />
                    </div>
                </div>

                <h2 className="text-3xl font-serif font-bold text-yellow-100 mb-4">
                    The Royal Palace of Brussels
                </h2>

                <p className="text-slate-300 mb-8 text-lg leading-relaxed">
                    The election is over. The King has invited the party leaders to the Palace to begin consultations.
                    As the leader of {gameState.parties.player.name}, you await your audience with His Majesty.
                </p>

                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 mb-8 text-left">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Election Results</h3>
                    <div className="space-y-2">
                        {Object.values(gameState.parties)
                            .sort((a: any, b: any) => b.totalSeats - a.totalSeats)
                            .map((party: any) => (
                                <div key={party.id} className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${party.color}`} />
                                        <span className="font-medium">{party.name}</span>
                                    </div>
                                    <span className="font-bold">{party.totalSeats} seats</span>
                                </div>
                            ))}
                    </div>
                </div>

                <button
                    onClick={() => onAction({ type: 'MEET_THE_KING' })}
                    className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-yellow-600 font-lg rounded-xl hover:bg-yellow-500 hover:shadow-lg hover:shadow-yellow-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                    <span>Meet the King</span>
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </button>
            </div>
        </div>
    );
};
