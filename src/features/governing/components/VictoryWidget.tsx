/**
 * Victory Conditions Widget
 * 
 * Displays clear win conditions and current progress toward victory.
 * Shows seat projections and path to power.
 */

import { Target, TrendingUp, Users } from 'lucide-react';
import type { GameState } from '@/core';
import {
    getPartyPolling,
    projectSeats,
    getTotalSeats
} from '@/core';

interface VictoryWidgetProps {
    gameState: GameState;
}

export const VictoryWidget = ({ gameState }: VictoryWidgetProps) => {
    const playerPartyId = gameState.globals.playerParty;
    const totalSeats = getTotalSeats(gameState);
    const majorityThreshold = Math.floor(totalSeats / 2) + 1;

    // Use ECS queries for real data
    const projectedSeats = projectSeats(gameState, playerPartyId);
    const polling = getPartyPolling(gameState, playerPartyId);

    // Determine if we have a majority (projected)
    const hasMajority = projectedSeats >= majorityThreshold;
    const progressPercentage = (projectedSeats / majorityThreshold) * 100;
    const seatsNeeded = Math.max(0, majorityThreshold - projectedSeats);

    return (
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-xl shadow-lg border border-indigo-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg flex items-center">
                    <Target className="mr-2" size={20} />
                    Victory Conditions
                </h3>
                {hasMajority && (
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                        ON TRACK!
                    </span>
                )}
            </div>

            {/* Seat Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm text-indigo-200 mb-2">
                    <span className="flex items-center">
                        <Users size={14} className="mr-1" />
                        Projected Seats
                    </span>
                    <span className="font-mono font-bold text-white">
                        {projectedSeats} / {majorityThreshold}
                    </span>
                </div>

                <div className="h-4 bg-indigo-950 rounded-full overflow-hidden border border-indigo-700">
                    <div
                        className={`h-full transition-all duration-500 ${hasMajority ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-yellow-500 to-orange-400'
                            }`}
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                </div>

                <div className="flex justify-between text-xs text-indigo-300 mt-1">
                    <span>0</span>
                    <span className="font-bold">Majority: {majorityThreshold}</span>
                    <span>{totalSeats}</span>
                </div>
            </div>

            {/* Status Message */}
            <div className={`p-3 rounded-lg ${hasMajority
                ? 'bg-green-900/30 border border-green-700'
                : 'bg-orange-900/30 border border-orange-700'
                }`}>
                <p className="text-sm text-white flex items-center">
                    <TrendingUp size={16} className="mr-2" />
                    {hasMajority ? (
                        <span className="font-bold">Projected to win majority! Keep campaigning to secure victory.</span>
                    ) : (
                        <span>
                            Need <span className="font-bold text-yellow-300">{seatsNeeded} more seats</span> for majority.
                            Coalition will be required.
                        </span>
                    )}
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-indigo-950/50 p-3 rounded-lg border border-indigo-800">
                    <div className="text-xs text-indigo-300 mb-1">Current Polling</div>
                    <div className="text-lg font-bold text-white">
                        {polling.toFixed(1)}%
                    </div>
                </div>
                <div className="bg-indigo-950/50 p-3 rounded-lg border border-indigo-800">
                    <div className="text-xs text-indigo-300 mb-1">Turns Remaining</div>
                    <div className="text-lg font-bold text-white">
                        {/* Assuming maxTurns is 20 for now, or we need to add it to Globals */}
                        {20 - gameState.globals.currentTurn}
                    </div>
                </div>
            </div>
        </div>
    );
};
