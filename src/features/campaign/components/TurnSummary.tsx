/**
 * Turn Summary Modal
 * 
 * Displays a comprehensive recap after each turn showing:
 * - Polling changes for all parties
 * - AI opponent moves
 * - Key events that occurred
 * - Updated seat projections
 * - Next turn preview
 */

import { TrendingUp, TrendingDown, Users, Calendar, AlertCircle } from 'lucide-react';
import type { World } from '@/core';

// Type aliases for backwards compatibility  
type GameState = World;
type PartyId = string;

// Placeholder for seat projection
const calculateSeatProjections = (_gameState: GameState): Array<{ partyId: PartyId; projectedSeats: number }> => [];

interface TurnSummaryProps {
    currentState: GameState;
    previousState: GameState;
    onContinue: () => void;
}

export const TurnSummary = ({ currentState, previousState, onContinue }: TurnSummaryProps) => {
    const currentProjections = calculateSeatProjections(currentState);
    const previousProjections = calculateSeatProjections(previousState);

    // Calculate polling changes for each party
    const partyIds = Object.keys(currentState.parties) as PartyId[];
    const pollingChanges = partyIds.map(partyId => {
        const currentAvg = (Object.values(currentState.parties[partyId].constituencyPolling) as number[])
            .reduce((sum: number, val: number) => sum + val, 0) / Object.values(currentState.parties[partyId].constituencyPolling).length;
        const previousAvg = (Object.values(previousState.parties[partyId].constituencyPolling) as number[])
            .reduce((sum: number, val: number) => sum + val, 0) / Object.values(previousState.parties[partyId].constituencyPolling).length;

        return {
            partyId,
            party: currentState.parties[partyId],
            change: currentAvg - previousAvg,
            currentAvg,
            previousAvg
        };
    }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change)); // Sort by magnitude of change

    // Get recent events from this turn
    const recentEvents = currentState.eventLog.slice(-5); // Last 5 events

    // Calculate seat projection changes
    const playerCurrentSeats = currentProjections.find(p => p.partyId === currentState.playerPartyId)?.projectedSeats || 0;
    const playerPreviousSeats = previousProjections.find(p => p.partyId === currentState.playerPartyId)?.projectedSeats || 0;
    const seatChange = playerCurrentSeats - playerPreviousSeats;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-blue-500 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl animate-in slide-in-from-bottom duration-500">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-3">
                        📊 TURN {previousState.turn} SUMMARY
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">
                        End of Turn Report
                    </h1>
                    <p className="text-slate-400">
                        {currentState.maxTurns - currentState.turn} turns remaining until election
                    </p>
                </div>

                {/* Seat Projection Change */}
                <div className={`p-5 rounded-xl mb-6 ${seatChange > 0
                    ? 'bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-2 border-green-500'
                    : seatChange < 0
                        ? 'bg-gradient-to-r from-red-900/40 to-orange-900/40 border-2 border-red-500'
                        : 'bg-gradient-to-r from-slate-800/40 to-slate-700/40 border-2 border-slate-600'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-slate-300 text-sm mb-1">Your Projected Seats</div>
                            <div className="text-4xl font-black text-white flex items-baseline">
                                {playerCurrentSeats}
                                {seatChange !== 0 && (
                                    <span className={`text-xl ml-3 flex items-center ${seatChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {seatChange > 0 ? <TrendingUp size={20} className="mr-1" /> : <TrendingDown size={20} className="mr-1" />}
                                        {Math.abs(seatChange)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Users size={48} className="text-blue-400 opacity-50" />
                    </div>
                </div>

                {/* Polling Changes */}
                <div className="mb-6">
                    <h3 className="text-white font-bold text-lg mb-3 flex items-center">
                        <TrendingUp className="mr-2" size={20} />
                        Polling Changes
                    </h3>
                    <div className="space-y-2">
                        {pollingChanges.map(({ partyId, party, change, currentAvg }) => (
                            <div key={partyId} className={`p-3 rounded-lg ${partyId === currentState.playerPartyId ? 'bg-indigo-900/30 border border-indigo-600' : 'bg-slate-800/50'
                                }`}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full ${party.color} mr-3`}></div>
                                        <span className={`font-bold ${partyId === currentState.playerPartyId ? 'text-white' : 'text-slate-300'}`}>
                                            {party.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-slate-400 font-mono text-sm">
                                            {currentAvg.toFixed(1)}%
                                        </span>
                                        {change !== 0 && (
                                            <span className={`font-bold text-sm flex items-center ${change > 0 ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {change > 0 ? '+' : ''}{change.toFixed(1)}%
                                                {change > 0 ? <TrendingUp size={14} className="ml-1" /> : <TrendingDown size={14} className="ml-1" />}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Key Events */}
                <div className="mb-6">
                    <h3 className="text-white font-bold text-lg mb-3 flex items-center">
                        <AlertCircle className="mr-2" size={20} />
                        Key Events This Turn
                    </h3>
                    <div className="bg-slate-800/50 rounded-lg p-4 max-h-40 overflow-y-auto">
                        {recentEvents.length > 0 ? (
                            <ul className="space-y-2">
                                {recentEvents.map((event: any, idx: number) => (
                                    <li key={idx} className="text-slate-300 text-sm flex items-start">
                                        <span className="text-blue-400 mr-2">•</span>
                                        {event}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-slate-500 text-sm italic">No significant events this turn</p>
                        )}
                    </div>
                </div>

                {/* Next Turn Preview */}
                <div className="bg-slate-800/30 p-4 rounded-lg mb-6 border border-slate-700">
                    <h3 className="text-white font-bold text-sm mb-2 flex items-center">
                        <Calendar className="mr-2" size={16} />
                        Next Turn
                    </h3>
                    <p className="text-slate-400 text-sm">
                        Turn {currentState.turn} of {currentState.maxTurns} •
                        {currentState.maxTurns - currentState.turn === 1 ? (
                            <span className="text-yellow-400 font-bold ml-1">Final turn before election!</span>
                        ) : (
                            <span className="ml-1">{currentState.maxTurns - currentState.turn} turns until election</span>
                        )}
                    </p>
                </div>

                {/* Continue Button */}
                <button
                    onClick={onContinue}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                    Continue to Turn {currentState.turn} →
                </button>
            </div>
        </div>
    );
};
