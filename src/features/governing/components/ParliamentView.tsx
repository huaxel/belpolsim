import React, { useState } from 'react';
import { Users, FileText, CheckCircle } from 'lucide-react';
import {
    type GameState,
    type EntityId,
    getAllParties,
    getPartySeats,
    getTotalSeats,
    getIdentity,
    getAllIssues
} from '@/core';
import { legislativeSystem } from '@/core/systems';

interface ParliamentViewProps {
    gameState: GameState;
    dispatch: (action: any) => void;
}

export const ParliamentView: React.FC<ParliamentViewProps> = ({ gameState, dispatch }) => {
    const [selectedIssue, setSelectedIssue] = useState<EntityId>('');
    const [stance, setStance] = useState<number>(0);
    const [feedback, setFeedback] = useState<string | null>(null);

    const parties = getAllParties(gameState);
    const issues = getAllIssues(gameState);
    const totalSeats = getTotalSeats(gameState);
    const majorityThreshold = Math.floor(totalSeats / 2) + 1;

    // Get active bills (simple filter for MVP)
    const activeBills = Object.entries(gameState.components.billData)
        .filter(([_, bill]) => bill.status === 'vote' || bill.status === 'proposed')
        .map(([id, bill]) => ({ id, ...bill }));

    const handlePropose = () => {
        if (!selectedIssue) return;

        const action = {
            type: 'proposeBill',
            actor: gameState.globals.playerParty,
            issueId: selectedIssue,
            stance: stance,
        };

        const result = legislativeSystem.processAction(gameState, action as any);
        if (result.success) {
            dispatch({ type: 'UPDATE_GAME_STATE', payload: result.newState });
            setFeedback('Bill proposed successfully!');
            setTimeout(() => setFeedback(null), 3000);
        } else {
            setFeedback(`Error: ${result.error} `);
        }
    };

    const handleVote = (billId: EntityId) => {
        const action = {
            type: 'voteOnBill',
            actor: gameState.globals.playerParty, // Technically the system handles everyone's vote
            billId: billId,
        };

        const result = legislativeSystem.processAction(gameState, action as any);
        if (result.success) {
            dispatch({ type: 'UPDATE_GAME_STATE', payload: result.newState });
            setFeedback(result.message || 'Vote complete');
        } else {
            setFeedback(`Error: ${result.error} `);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Left Column: Parliament Seating & Status */}
            <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                        <Users className="mr-2" /> Parliament
                    </h2>

                    {/* Simple Visual Representation of Seats */}
                    <div className="h-64 bg-indigo-950/50 rounded-lg flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-x-0 bottom-0 h-32 w-64 mx-auto border-t-8 border-l-8 border-r-8 border-indigo-500 rounded-t-full opacity-20"></div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white">{totalSeats}</div>
                            <div className="text-sm text-indigo-300">Total Seats</div>
                            <div className="mt-2 text-xs text-indigo-400">Majority: {majorityThreshold}</div>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                        {parties.map(partyId => {
                            const seats = getPartySeats(gameState, partyId);
                            const identity = getIdentity(gameState, partyId);
                            if (seats === 0) return null;

                            return (
                                <div key={partyId} className="flex justify-between items-center bg-white/5 p-2 rounded">
                                    <div className="flex items-center">
                                        <div
                                            className="w-3 h-3 rounded-full mr-2"
                                            style={{ backgroundColor: identity?.color || '#ccc' }}
                                        />
                                        <span className="text-sm text-white">{identity?.name}</span>
                                    </div>
                                    <span className="text-sm font-mono text-indigo-200">{seats}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Right Column: Legislation */}
            <div className="space-y-6">
                {/* Proposal Form */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                        <FileText className="mr-2" /> Propose Legislation
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-indigo-200 mb-1">Select Issue</label>
                            <select
                                className="w-full bg-indigo-950/50 border border-indigo-700 rounded p-2 text-white"
                                value={selectedIssue}
                                onChange={(e) => setSelectedIssue(e.target.value)}
                            >
                                <option value="">-- Select an Issue --</option>
                                {issues.map(issueId => (
                                    <option key={issueId} value={issueId}>
                                        {getIdentity(gameState, issueId)?.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-indigo-200 mb-1">Stance: {stance}</label>
                            <input
                                type="range"
                                min="-100"
                                max="100"
                                value={stance}
                                onChange={(e) => setStance(parseInt(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-indigo-400">
                                <span>Oppose (-100)</span>
                                <span>Neutral (0)</span>
                                <span>Support (100)</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePropose}
                            disabled={!selectedIssue}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Propose Bill
                        </button>

                        {feedback && (
                            <div className="text-sm text-yellow-300 mt-2 animate-pulse">
                                {feedback}
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Bills */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4">Active Bills</h3>

                    {activeBills.length === 0 ? (
                        <p className="text-indigo-300 italic">No bills currently in session.</p>
                    ) : (
                        <div className="space-y-4">
                            {activeBills.map(bill => (
                                <div key={bill.id} className="bg-indigo-950/30 p-4 rounded border border-indigo-800">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-white">{bill.title}</h4>
                                        <span className="text-xs bg-indigo-700 px-2 py-1 rounded text-white uppercase">
                                            {bill.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-indigo-200 mb-3">{bill.description}</p>

                                    {bill.status === 'vote' && (
                                        <button
                                            onClick={() => handleVote(bill.id)}
                                            className="w-full bg-green-600 hover:bg-green-500 text-white text-sm font-bold py-2 rounded flex items-center justify-center"
                                        >
                                            <CheckCircle size={16} className="mr-2" />
                                            Call Vote
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
