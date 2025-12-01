
import type { World } from '@/core';
import { User, TrendingUp, Award, Users } from 'lucide-react';

// Type alias for backwards compatibility
type GameState = World;

interface CandidateProfileProps {
    gameState: GameState;
}

export const CandidateProfile = ({ gameState }: CandidateProfileProps) => {
    const { playerCharacter, parties } = gameState;
    const playerParty = parties['player'];
    const constituencyId = playerCharacter.homeConstituency;

    // Get candidates in home constituency
    const candidates = playerParty.politicians[constituencyId] || [];

    // Sort by internal clout
    const sortedCandidates = [...candidates].sort((a, b) => b.internalClout - a.internalClout);

    // Find player rank
    // In this MVP, we assume the player IS one of these candidates, or we inject them.
    // For simplicity, let's assume the player IS the candidate with the closest clout, 
    // OR we just display the list and say "You are rank X".
    // Let's assume the player is NOT in the candidates array by default in the current generation logic,
    // so we should probably visualize "Your Position" relative to them.

    // BETTER APPROACH: The player IS the first candidate initially, but can drop.
    // Let's find the candidate that matches the player's ID or Name.
    // Since we didn't assign a specific ID to the player in `generateCandidates`, 
    // let's assume the player is the one with `id` ending in `-0` (the first one generated) 
    // AND we update that candidate's stats to match `playerCharacter`.

    // Actually, `useGameLogic` should probably sync `playerCharacter` with the actual candidate object.
    // For now, let's just show the list and highlight where the player WOULD be based on `internalClout`.

    const playerRank = sortedCandidates.filter(c => c.internalClout > playerCharacter.internalClout).length + 1;

    // Projected seats for player party in this constituency
    const polling = playerParty.constituencyPolling[constituencyId];
    // Rough seat estimation (D'Hondt is complex, but let's approximate: % / (100 / seats))
    // Actually we have `constituencySeats` in gameState if election happened, but this is pre-election.
    // Let's estimate: (Polling % / 100) * Total Seats in Constituency
    // This is a naive estimation but good enough for UI feedback.
    // We need to import CONSTITUENCIES to get seat count.
    // Let's just pass it or import it. We'll skip exact seat calc for now and just show rank.

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <div className="bg-indigo-100 p-3 rounded-full">
                        <User size={24} className="text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{playerCharacter.name}</h2>
                        <p className="text-sm text-gray-500 capitalize">{constituencyId.replace('_', ' ')} Candidate</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-500">List Rank</div>
                    <div className="text-3xl font-black text-indigo-600">#{playerRank}</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center text-gray-500 mb-2">
                        <Award size={16} className="mr-2" /> Internal Clout
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{playerCharacter.internalClout}</div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${playerCharacter.internalClout}%` }}></div>
                    </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center text-gray-500 mb-2">
                        <TrendingUp size={16} className="mr-2" /> Party Polling
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{polling.toFixed(1)}%</div>
                    <div className="text-xs text-gray-400 mt-1">In {constituencyId.replace('_', ' ')}</div>
                </div>
            </div>

            <div>
                <h3 className="font-bold text-gray-700 mb-3 flex items-center">
                    <Users size={18} className="mr-2" /> Party List (Top 5)
                </h3>
                <div className="space-y-2">
                    {sortedCandidates.slice(0, 5).map((candidate, index) => {
                        // Is this the player's slot?
                        // We are simulating the player being inserted into this list based on clout.
                        // If the player has 50 clout, and this candidate has 60, they are above.
                        // If this candidate has 40, they are below.
                        // This visualization is tricky without a real "Player Candidate" object in the array.
                        // Let's just list the rivals.

                        return (
                            <div key={candidate.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm">
                                <div className="flex items-center">
                                    <span className={`font-bold w-6 ${index + 1 <= 3 ? 'text-green-600' : 'text-gray-400'}`}>#{index + 1}</span>
                                    <span className="text-gray-700">{candidate.name}</span>
                                </div>
                                <div className="font-mono text-gray-500">{candidate.internalClout} Clout</div>
                            </div>
                        );
                    })}
                    {/* If player is not in top 5, show them here */}
                    {playerRank > 5 && (
                        <div className="flex justify-between items-center p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm">
                            <div className="flex items-center">
                                <span className="font-bold w-6 text-indigo-600">#{playerRank}</span>
                                <span className="text-indigo-900 font-bold">You</span>
                            </div>
                            <div className="font-mono text-indigo-600 font-bold">{playerCharacter.internalClout} Clout</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
