/**
 * Election Projection Screen
 * 
 * Dramatic pre-election screen showing "If election were held today..." projections.
 * Builds anticipation before the actual election calculation.
 */

import { useState } from 'react';
import { BarChart3, Users, AlertCircle, CheckCircle } from 'lucide-react';
import type { World } from '@/core';
import { MAJORITY_SEATS, TOTAL_SEATS } from '@/core';

// Type alias for backwards compatibility
type GameState = World;
type PartyId = string;

// Placeholder functions - need to be implemented in core
const calculateSeatProjections = (_gameState: GameState): Array<{ partyId: PartyId; projectedSeats: number }> => [];
const getCoalitionPossibilities = (_gameState: GameState): string[] => [];

interface ElectionProjectionProps {
    gameState: GameState;
    onProceed: () => void;
}

export const ElectionProjection = ({ gameState, onProceed }: ElectionProjectionProps) => {
    const [showDetails, setShowDetails] = useState(false);
    const projections = calculateSeatProjections(gameState);
    const playerProjection = projections.find(p => p.partyId === gameState.playerPartyId);
    const projectedSeats = playerProjection?.projectedSeats || 0;
    const hasMajority = projectedSeats >= MAJORITY_SEATS;
    const coalitionPossibilities = getCoalitionPossibilities(gameState);

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-indigo-500 rounded-2xl max-w-4xl w-full p-8 shadow-2xl animate-in slide-in-from-bottom duration-700">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-4 animate-pulse">
                        📊 ELECTION PROJECTION
                    </div>
                    <h1 className="text-4xl font-black text-white mb-2">
                        If the election were held today...
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Based on current polling data across all constituencies
                    </p>
                </div>

                {/* Main Projection */}
                <div className={`p-6 rounded-xl mb-6 ${hasMajority
                    ? 'bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-2 border-green-500'
                    : 'bg-gradient-to-r from-orange-900/40 to-red-900/40 border-2 border-orange-500'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-slate-300 text-sm mb-1">Your Party Projection</div>
                            <div className="text-6xl font-black text-white flex items-baseline">
                                {projectedSeats}
                                <span className="text-2xl text-slate-400 ml-2">/ {TOTAL_SEATS} seats</span>
                            </div>
                        </div>
                        <div className="text-right">
                            {hasMajority ? (
                                <div className="flex items-center text-green-400 text-xl font-bold">
                                    <CheckCircle size={32} className="mr-2" />
                                    MAJORITY!
                                </div>
                            ) : (
                                <div className="flex items-center text-orange-400 text-xl font-bold">
                                    <AlertCircle size={32} className="mr-2" />
                                    COALITION NEEDED
                                </div>
                            )}
                            <div className="text-slate-400 text-sm mt-2">
                                {hasMajority ? 'Can form government alone' : `${MAJORITY_SEATS - projectedSeats} seats short`}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seat Distribution */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="w-full flex items-center justify-between text-white bg-slate-800 hover:bg-slate-700 p-4 rounded-lg transition-colors mb-3"
                    >
                        <span className="flex items-center font-bold">
                            <BarChart3 size={20} className="mr-2" />
                            Full Seat Distribution
                        </span>
                        <span className="text-slate-400">{showDetails ? '▼' : '▶'}</span>
                    </button>

                    {showDetails && (
                        <div className="space-y-2 animate-in slide-in-from-top duration-300">
                            {projections.map(projection => {
                                const party = gameState.parties[projection.partyId];
                                const isPlayer = projection.partyId === gameState.playerPartyId;
                                const percentage = (projection.projectedSeats / TOTAL_SEATS) * 100;

                                return (
                                    <div key={projection.partyId} className={`p-3 rounded-lg ${isPlayer ? 'bg-indigo-900/50 border border-indigo-600' : 'bg-slate-800/50'
                                        }`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center">
                                                <div className={`w-4 h-4 rounded-full ${party.color} mr-3`}></div>
                                                <span className={`font-bold ${isPlayer ? 'text-white' : 'text-slate-300'}`}>
                                                    {party.name}
                                                </span>
                                            </div>
                                            <span className="text-white font-mono font-bold">
                                                {projection.projectedSeats} seats
                                            </span>
                                        </div>
                                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${party.color} transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Coalition Possibilities */}
                {!hasMajority && (
                    <div className="bg-slate-800/50 p-5 rounded-lg mb-6">
                        <h3 className="text-white font-bold flex items-center mb-3">
                            <Users size={20} className="mr-2" />
                            Possible Coalition Paths
                        </h3>
                        <ul className="space-y-2">
                            {coalitionPossibilities.map((possibility, idx) => (
                                <li key={idx} className="text-slate-300 flex items-start">
                                    <span className="text-indigo-400 mr-2">•</span>
                                    {possibility}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Action Button */}
                <button
                    onClick={onProceed}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                    Proceed to Election Results →
                </button>

                {/* Disclaimer */}
                <p className="text-center text-slate-500 text-xs mt-4">
                    * Projection based on current polling. Actual results may vary.
                </p>
            </div>
        </div>
    );
};
