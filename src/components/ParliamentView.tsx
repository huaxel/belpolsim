import { useMemo } from 'react';
import type { GameState, Law } from '../types';
import { Gavel, Check, X, History } from 'lucide-react';
import { decideVote } from '../engine/ai';

interface ParliamentViewProps {
    gameState: GameState;
    onVote: (law: Law) => void;
}

export const ParliamentView = ({ gameState, onVote }: ParliamentViewProps) => {
    const { laws, parties } = gameState;

    // Mock laws for proposal if none exist
    const availableLaws: Law[] = [
        {
            id: 'law-wealth-tax',
            name: 'Wealth Tax Act',
            description: 'Implement a 1% tax on fortunes over €1M.',
            effects: { budgetImpact: 2000, popularityImpact: 5, stabilityImpact: -10 },
            status: 'proposed'
        },
        {
            id: 'law-nuclear-extension',
            name: 'Nuclear Extension Bill',
            description: 'Extend the life of nuclear power plants by 10 years.',
            effects: { budgetImpact: 500, popularityImpact: -2, stabilityImpact: -5 },
            status: 'proposed'
        },
        {
            id: 'law-pension-reform',
            name: 'Pension Reform',
            description: 'Raise retirement age to 68 to save budget.',
            effects: { budgetImpact: 3000, popularityImpact: -15, stabilityImpact: -20 },
            status: 'proposed'
        }
    ];

    // Filter out laws that are already in state
    const proposedLaws = availableLaws.filter(l => !laws.find(existing => existing.id === l.id));
    const passedLaws = laws.filter(l => l.status === 'passed');
    const rejectedLaws = laws.filter(l => l.status === 'rejected');

    // Calculate projections
    const projections = useMemo(() => {
        const map = new Map<string, { yes: number, no: number, abstain: number, passed: boolean }>();
        proposedLaws.forEach(law => {
            let yes = 0, no = 0, abstain = 0;
            Object.values(parties).forEach(party => {
                const vote = decideVote(party.id, gameState, law);
                if (vote === 'FOR') yes += party.totalSeats;
                else if (vote === 'AGAINST') no += party.totalSeats;
                else abstain += party.totalSeats;
            });
            map.set(law.id, { yes, no, abstain, passed: yes > no });
        });
        return map;
    }, [proposedLaws, parties, gameState]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left Column: Active Proposals */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-inner">
                    <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
                        <Gavel className="text-blue-500" /> Legislative Agenda
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                        {proposedLaws.map(law => {
                            const proj = projections.get(law.id) || { yes: 0, no: 0, abstain: 0, passed: false };
                            const totalVotes = proj.yes + proj.no + proj.abstain;
                            const yesPct = totalVotes > 0 ? (proj.yes / totalVotes) * 100 : 0;
                            const noPct = totalVotes > 0 ? (proj.no / totalVotes) * 100 : 0;

                            return (
                                <div key={law.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{law.name}</h3>
                                            <p className="text-slate-400 text-sm">{law.description}</p>
                                            <div className="flex gap-4 mt-2 text-xs font-mono">
                                                <span className={law.effects.budgetImpact > 0 ? "text-green-400" : "text-red-400"}>
                                                    Budget: {law.effects.budgetImpact > 0 ? '+' : ''}{law.effects.budgetImpact}M
                                                </span>
                                                <span className={law.effects.popularityImpact > 0 ? "text-green-400" : "text-red-400"}>
                                                    Pop: {law.effects.popularityImpact > 0 ? '+' : ''}{law.effects.popularityImpact}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${proj.passed ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                            Projected: {proj.passed ? 'PASS' : 'FAIL'}
                                        </div>
                                    </div>

                                    {/* Projection Bar */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-slate-400">
                                            <span>Yes: {proj.yes}</span>
                                            <span>No: {proj.no}</span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden flex">
                                            <div style={{ width: `${yesPct}%` }} className="bg-green-500 h-full" />
                                            <div style={{ width: `${noPct}%` }} className="bg-red-500 h-full" />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => onVote(law)}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Gavel size={18} /> Call Vote
                                    </button>
                                </div>
                            );
                        })}
                        {proposedLaws.length === 0 && (
                            <div className="text-center p-8 text-slate-500 italic">
                                No new bills on the agenda.
                            </div>
                        )}
                    </div>
                </div>

                {/* Hemicycle Visualization (Simplified) */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-inner flex flex-col items-center justify-center min-h-[300px]">
                    <h3 className="text-slate-400 font-bold uppercase mb-4">Parliament Seating</h3>
                    <div className="relative w-full max-w-md aspect-[2/1] border-b-2 border-slate-700">
                        {/* Placeholder for actual hemicycle visualization */}
                        <div className="absolute inset-0 flex items-end justify-center pb-4 text-slate-600">
                            [Hemicycle Visualization Placeholder]
                        </div>
                        {/* We can iterate parties and show dots later */}
                    </div>
                    <div className="mt-4 flex flex-wrap justify-center gap-4">
                        {Object.values(parties).map(party => (
                            <div key={party.id} className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${party.color}`}></div>
                                <span className="text-xs text-slate-300">{party.name} ({party.totalSeats})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: History */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-inner">
                <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <History className="text-slate-500" /> Legislative Log
                </h2>

                <div className="space-y-4">
                    {passedLaws.map(law => (
                        <div key={law.id} className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <Check className="text-green-500" size={16} />
                                <span className="font-bold text-green-100">{law.name}</span>
                            </div>
                            <div className="text-xs text-green-300/70">PASSED</div>
                        </div>
                    ))}
                    {rejectedLaws.map(law => (
                        <div key={law.id} className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <X className="text-red-500" size={16} />
                                <span className="font-bold text-red-100">{law.name}</span>
                            </div>
                            <div className="text-xs text-red-300/70">REJECTED</div>
                        </div>
                    ))}
                    {passedLaws.length === 0 && rejectedLaws.length === 0 && (
                        <div className="text-slate-500 text-sm text-center py-4">No history yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
};
