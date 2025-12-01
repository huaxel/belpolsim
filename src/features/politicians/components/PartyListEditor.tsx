import React, { useState } from 'react';
import { Users, ArrowUp, ArrowDown, Star, Award, TrendingUp } from 'lucide-react';
import type { World } from '@/core';

// Type alias for backwards compatibility
type GameState = World;
type ConstituencyId = string;

// Placeholder for CONSTITUENCIES - should be accessed from world data
const CONSTITUENCIES: Record<ConstituencyId, { name: string; seats: number }> = {};

interface PartyListEditorProps {
    gameState: GameState;
    onReorder: (constituencyId: ConstituencyId, politicianId: string, newIndex: number) => void;
}

export const PartyListEditor: React.FC<PartyListEditorProps> = ({ gameState, onReorder }) => {
    const [selectedConstituency, setSelectedConstituency] = useState<ConstituencyId>('antwerp');
    const playerParty = gameState.parties.player;
    const politicians = playerParty.politicians[selectedConstituency] || [];

    // Sort by list position
    const sortedPoliticians = [...politicians].sort((a, b) => a.listPosition - b.listPosition);

    const handleMove = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === sortedPoliticians.length - 1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        const politician = sortedPoliticians[index];

        // In a real implementation, we would swap positions.
        // For now, we just call the handler.
        onReorder(selectedConstituency, politician.id, newIndex);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                    <Users className="mr-3 text-blue-600" />
                    Electoral Lists
                </h2>

                <select
                    value={selectedConstituency}
                    onChange={(e) => setSelectedConstituency(e.target.value as ConstituencyId)}
                    className="p-2 border rounded-lg bg-slate-50 font-medium"
                >
                    {playerParty.eligibleConstituencies.map(cId => (
                        <option key={cId} value={cId}>
                            {CONSTITUENCIES[cId].name} ({CONSTITUENCIES[cId].seats} seats)
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {sortedPoliticians.map((pol, index) => (
                    <div key={pol.id} className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                        <div className="flex flex-col items-center mr-4 space-y-1">
                            <button
                                onClick={() => handleMove(index, 'up')}
                                disabled={index === 0}
                                className="p-1 hover:bg-slate-200 rounded disabled:opacity-30"
                            >
                                <ArrowUp size={16} />
                            </button>
                            <span className="font-bold text-lg w-6 text-center">{pol.listPosition}</span>
                            <button
                                onClick={() => handleMove(index, 'down')}
                                disabled={index === sortedPoliticians.length - 1}
                                className="p-1 hover:bg-slate-200 rounded disabled:opacity-30"
                            >
                                <ArrowDown size={16} />
                            </button>
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{pol.name}</h3>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                                        {pol.language === 'dutch' ? 'Dutch-speaking' : 'French-speaking'}
                                    </div>
                                </div>
                                {pol.isElected && (
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                                        Elected
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-3">
                                <div className="flex items-center text-sm text-slate-600" title="Charisma affects rally effectiveness">
                                    <Star size={14} className="mr-1 text-yellow-500" />
                                    <span>Cha: <strong>{pol.charisma}</strong></span>
                                </div>
                                <div className="flex items-center text-sm text-slate-600" title="Expertise affects debate performance">
                                    <Award size={14} className="mr-1 text-purple-500" />
                                    <span>Exp: <strong>{pol.expertise}</strong></span>
                                </div>
                                <div className="flex items-center text-sm text-slate-600" title="Popularity affects preference votes">
                                    <TrendingUp size={14} className="mr-1 text-green-500" />
                                    <span>Pop: <strong>{pol.popularity}</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800">
                <p><strong>Tip:</strong> Candidates at the top of the list are more likely to be elected. Popular candidates can pull the list up!</p>
            </div>
        </div>
    );
};
