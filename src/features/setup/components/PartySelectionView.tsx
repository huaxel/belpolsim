import React, { useState } from 'react';
import { Users, TrendingUp, DollarSign, Star } from 'lucide-react';

interface PartyPreset {
    id: string;
    name: string;
    description: string;
    ideology: string;
    color: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    stats: {
        seats: number;
        money: number;
        momentum: number;
    };
    traits: {
        name: string;
        description: string;
    }[];
}

const PRESETS: PartyPreset[] = [
    {
        id: 'socialist',
        name: 'Socialist Party',
        description: 'The Pillar of the State. Defenders of social security and the unions.',
        ideology: 'Left',
        color: '#ef4444',
        difficulty: 'Medium',
        stats: { seats: 28, money: 60000, momentum: 0 },
        traits: [
            { name: 'The Pillar', description: '+20 Political Capital (Union Ties)' }
        ]
    },
    {
        id: 'liberal',
        name: 'Liberal Reformists',
        description: 'Champions of free enterprise, individual liberty, and the middle class.',
        ideology: 'Center-Right',
        color: '#3b82f6',
        difficulty: 'Easy',
        stats: { seats: 32, money: 90000, momentum: 0 },
        traits: [
            { name: 'Blue Factory', description: '+20 Fundraising Efficiency' }
        ]
    },
    {
        id: 'flemish',
        name: 'Flemish Alliance',
        description: 'Conservative regionalists advocating for community rights and autonomy.',
        ideology: 'Conservative',
        color: '#f59e0b',
        difficulty: 'Medium',
        stats: { seats: 35, money: 70000, momentum: 10 },
        traits: [
            { name: 'Community First', description: '+10 Momentum in Flanders' }
        ]
    },
    {
        id: 'green',
        name: 'The Ecologists',
        description: 'Defenders of the planet and social justice. Popular with the youth.',
        ideology: 'Green',
        color: '#22c55e',
        difficulty: 'Hard',
        stats: { seats: 18, money: 35000, momentum: 10 },
        traits: [
            { name: 'Climate Vanguard', description: 'Bonus on Environmental Issues' }
        ]
    },
    {
        id: 'far_right',
        name: 'Flemish Interest',
        description: 'Nationalist hardliners focused on immigration and independence.',
        ideology: 'Far-Right',
        color: '#000000',
        difficulty: 'Hard',
        stats: { seats: 22, money: 45000, momentum: 20 },
        traits: [
            { name: 'Secure Borders', description: 'High Populist Appeal' }
        ]
    },
    {
        id: 'workers',
        name: 'Workers\' Party',
        description: 'The radical challenger. Anti-establishment and strictly unitary.',
        ideology: 'Radical Left',
        color: '#7f1d1d',
        difficulty: 'Hard',
        stats: { seats: 15, money: 20000, momentum: 20 },
        traits: [
            { name: 'Class Struggle', description: 'High Volatility' }
        ]
    }
];

interface PartySelectionViewProps {
    onSelect: (partyId: string) => void;
}

export const PartySelectionView: React.FC<PartySelectionViewProps> = ({ onSelect }) => {
    const [selectedId, setSelectedId] = useState<string>(PRESETS[0].id);

    const selectedParty = PRESETS.find(p => p.id === selectedId) || PRESETS[0];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Party List */}
                <div className="lg:col-span-1 space-y-4">
                    <h1 className="text-3xl font-bold mb-6">Select Your Party</h1>
                    <div className="space-y-3">
                        {PRESETS.map(party => (
                            <div
                                key={party.id}
                                onClick={() => setSelectedId(party.id)}
                                className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${selectedId === party.id
                                    ? 'bg-slate-800 border-blue-500 shadow-lg'
                                    : 'bg-slate-900 border-transparent hover:bg-slate-800'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: party.color }}
                                    />
                                    <div>
                                        <div className="font-bold">{party.name}</div>
                                        <div className="text-xs text-slate-400">{party.ideology}</div>
                                    </div>
                                    <div className="ml-auto">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${party.difficulty === 'Easy' ? 'bg-green-900 text-green-200' :
                                            party.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-200' :
                                                'bg-red-900 text-red-200'
                                            }`}>
                                            {party.difficulty}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Party Details */}
                <div className="lg:col-span-2">
                    <div className="h-full bg-slate-900 border border-slate-800 rounded-xl flex flex-col">
                        <div className="p-6 border-b border-slate-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold" style={{ color: selectedParty.color }}>
                                        {selectedParty.name}
                                    </h2>
                                    <div className="text-slate-400 mt-2 text-lg">
                                        {selectedParty.description}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-slate-500 uppercase tracking-wider font-bold">Ideology</div>
                                    <div className="text-xl">{selectedParty.ideology}</div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-8 flex-1">

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-950 p-4 rounded-lg text-center">
                                    <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                                    <div className="text-2xl font-bold">{selectedParty.stats.seats}</div>
                                    <div className="text-xs text-slate-500 uppercase">Seats</div>
                                </div>
                                <div className="bg-slate-950 p-4 rounded-lg text-center">
                                    <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-400" />
                                    <div className="text-2xl font-bold">€{selectedParty.stats.money.toLocaleString()}</div>
                                    <div className="text-xs text-slate-500 uppercase">Funds</div>
                                </div>
                                <div className="bg-slate-950 p-4 rounded-lg text-center">
                                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                                    <div className="text-2xl font-bold">{selectedParty.stats.momentum}</div>
                                    <div className="text-xs text-slate-500 uppercase">Momentum</div>
                                </div>
                            </div>

                            {/* Traits */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-yellow-500" />
                                    Unique Traits
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {selectedParty.traits.map((trait, idx) => (
                                        <div key={idx} className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex justify-between items-center">
                                            <span className="font-bold text-slate-200">{trait.name}</span>
                                            <span className="text-slate-400">{trait.description}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                        <div className="p-6 border-t border-slate-800">
                            <button
                                className="w-full h-12 text-lg font-bold rounded-lg transition-colors hover:opacity-90"
                                style={{ backgroundColor: selectedParty.color }}
                                onClick={() => onSelect(selectedParty.id)}
                            >
                                Start Campaign as {selectedParty.name}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
