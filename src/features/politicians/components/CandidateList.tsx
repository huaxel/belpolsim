import type { World } from '@/core';

// Type alias for backwards compatibility
type GameState = World;

// Placeholder for CONSTITUENCIES - should be accessed from world data
const CONSTITUENCIES: Record<string, { name: string }> = {};

interface CandidateListProps {
    gameState: GameState;
}

export const CandidateList = ({ gameState }: CandidateListProps) => {
    const candidates = gameState.parties.player.politicians[gameState.selectedConstituency] || [];
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold mb-4">Candidates: {CONSTITUENCIES[gameState.selectedConstituency].name}</h3>
            <div className="grid grid-cols-2 gap-2">
                {candidates.map((c: any) => (
                    <div key={c.id} className={`p-2 rounded border ${c.isElected ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex justify-between items-center">
                            <span className={`font-medium ${c.isElected ? 'text-green-700' : 'text-gray-700'}`}>
                                {c.name} {c.isElected && '✅'}
                            </span>
                        </div>
                        <div className="flex gap-4 mt-1 text-xs text-gray-500">
                            <span title="Charisma">✨ {c.charisma}</span>
                            <span title="Expertise">🧠 {c.expertise}</span>
                        </div>
                    </div>
                ))}</div>
        </div>
    );
};
