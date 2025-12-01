import React, { useState } from 'react';
import type { World } from '@/core';
import { Users, FileText, TrendingUp, AlertTriangle } from 'lucide-react';

// Type aliases for backwards compatibility
type GameState = World;
type IssueId = string;
interface Bill {
    id: string;
    issueId: IssueId;
    targetPosition: number;
    proposedBy: string;
    status: 'proposed' | 'voting' | 'passed' | 'rejected';
}

// Placeholder functions - need to be implemented in core
const calculateVote = (_bill: Bill, _gameState: GameState): { passed: boolean; yes: number; no: number; abstain: number } => ({ passed: false, yes: 0, no: 0, abstain: 0 });
const applyBillEffects = (_bill: Bill, gameState: GameState): GameState => gameState;

interface GovernmentDashboardProps {
    gameState: GameState;
    onUpdateState: (newState: GameState) => void;
}

export const GovernmentDashboard: React.FC<GovernmentDashboardProps> = ({ gameState, onUpdateState }) => {
    const { government, nationalBudget, publicApproval, issues } = gameState;
    const [selectedIssue, setSelectedIssue] = useState<IssueId>('taxation');
    const [targetPosition, setTargetPosition] = useState<number>(50);
    const [lastVoteResult, setLastVoteResult] = useState<any>(null);

    if (!government) {
        return <div className="p-8 text-center text-gray-400">No Government Formed</div>;
    }

    const handleProposeBill = () => {
        const bill: Bill = {
            id: `bill-${Date.now()}`,
            issueId: selectedIssue,
            targetPosition: targetPosition,
            proposedBy: gameState.playerPartyId,
            status: 'voting' as const
        };

        const result = calculateVote(bill, gameState);
        setLastVoteResult(result);

        if (result.passed) {
            const newState = applyBillEffects(bill, gameState);
            // Add bill to history
            newState.bills = [...newState.bills, { ...bill, status: 'passed' as const }];
            onUpdateState(newState);
        } else {
            // Stability penalty for failed bill
            const newState = {
                ...gameState,
                government: {
                    ...government,
                    stability: Math.max(0, government.stability - 10)
                },
                bills: [...gameState.bills, { ...bill, status: 'rejected' as const }],
                eventLog: [`Bill failed: ${bill.issueId}. Government stability drops.`, ...gameState.eventLog]
            };
            onUpdateState(newState);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-slate-900 text-white min-h-screen">
            {/* Header Stats */}
            <div className="lg:col-span-3 grid grid-cols-4 gap-4 mb-4">
                <div className="bg-slate-800 p-4 rounded-lg shadow border border-slate-700 flex items-center">
                    <TrendingUp className="w-8 h-8 text-green-400 mr-3" />
                    <div>
                        <div className="text-sm text-gray-400">Stability</div>
                        <div className="text-2xl font-bold">{government.stability}%</div>
                    </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg shadow border border-slate-700 flex items-center">
                    <Users className="w-8 h-8 text-blue-400 mr-3" />
                    <div>
                        <div className="text-sm text-gray-400">Public Approval</div>
                        <div className="text-2xl font-bold">{publicApproval}%</div>
                    </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg shadow border border-slate-700 flex items-center">
                    <FileText className="w-8 h-8 text-yellow-400 mr-3" />
                    <div>
                        <div className="text-sm text-gray-400">Budget Deficit</div>
                        <div className="text-2xl font-bold text-red-400">€{nationalBudget.deficit}B</div>
                    </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg shadow border border-slate-700 flex items-center">
                    <AlertTriangle className="w-8 h-8 text-orange-400 mr-3" />
                    <div>
                        <div className="text-sm text-gray-400">Active Crises</div>
                        <div className="text-2xl font-bold">{gameState.crises.length}</div>
                    </div>
                </div>
            </div>

            {/* Left Column: Cabinet */}
            <div className="lg:col-span-1 bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" /> Cabinet
                </h2>
                <div className="space-y-4">
                    <div className="p-3 bg-slate-700 rounded border border-slate-600">
                        <div className="text-xs text-gray-400 uppercase">Prime Minister</div>
                        <div className="font-bold text-lg">{government.primeMinister?.name || 'Vacant'}</div>
                        <div className="text-sm text-blue-300">{government.primeMinister?.partyId.toUpperCase()}</div>
                    </div>
                    <div className="h-64 overflow-y-auto space-y-2 pr-2">
                        {government.ministers.map((minister: any) => (
                            <div key={minister.id} className="p-2 bg-slate-700/50 rounded flex justify-between items-center">
                                <div>
                                    <div className="font-medium">{minister.name}</div>
                                    <div className="text-xs text-gray-400">{minister.partyId.toUpperCase()}</div>
                                </div>
                                <div className="text-xs bg-slate-600 px-2 py-1 rounded">Minister</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Center Column: Legislation */}
            <div className="lg:col-span-2 bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" /> Legislative Agenda
                </h2>

                <div className="bg-slate-700/30 p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold mb-4">Propose New Bill</h3>

                    <div className="grid grid-cols-2 gap-6 mb-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Select Issue</label>
                            <select
                                value={selectedIssue}
                                onChange={(e) => setSelectedIssue(e.target.value as IssueId)}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                            >
                                {Object.values(issues).map((issue: any) => (
                                    <option key={issue.id} value={issue.id}>{issue.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Target Position (0-100)</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={targetPosition}
                                onChange={(e) => setTargetPosition(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="text-center mt-2 font-mono text-xl">{targetPosition}</div>
                        </div>
                    </div>

                    <button
                        onClick={handleProposeBill}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-colors"
                    >
                        Submit to Parliament
                    </button>
                </div>

                {/* Vote Result Display */}
                {lastVoteResult && (
                    <div className={`p-4 rounded-lg border ${lastVoteResult.passed ? 'bg-green-900/30 border-green-500' : 'bg-red-900/30 border-red-500'}`}>
                        <h3 className="font-bold text-lg mb-2">
                            {lastVoteResult.passed ? '✅ Bill Passed' : '❌ Bill Rejected'}
                        </h3>
                        <div className="flex justify-between text-sm">
                            <span>Yes: {lastVoteResult.yes}</span>
                            <span>No: {lastVoteResult.no}</span>
                            <span>Abstain: {lastVoteResult.abstain}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
