/**
 * Campaign War Room Dashboard
 * 
 * Following Frontend Specialist guidelines:
 * - Corporate/analytic aesthetic (Paradox Interactive style)
 * - Lucide icons for all actions
 * - Real-time feedback on projected effects
 * - No game logic - only display what's passed via props
 */

import { useState } from 'react';
// Removed unused import

import { Target, Smartphone, Tv, Newspaper, Users, TrendingUp, DollarSign, Settings } from 'lucide-react';
import type { GameState, EntityId, CampaignActionType } from '@/core';
import {
    getPartyStats,
    getPartyResources,
    getConstituencyData,
    getPartyPoliticians,
    getIdentity
} from '@/core';

import { CampaignRecommendations } from './CampaignRecommendations';
import { AutoCampaignSettings } from './AutoCampaignSettings';

// AutoCampaignStrategy type for local use
interface AutoCampaignStrategy {
    isEnabled: boolean;
    budgetLimit: number;
    priorities: {
        critical: boolean;
        competitive: boolean;
        safe: boolean;
    };
    regions: Record<string, boolean>;
}

interface CampaignDashboardProps {
    gameState: GameState;
    selectedConstituency: EntityId;
    onPerformAction: (actionType: CampaignActionType, targetConstituencyId?: string, focusIssueId?: string) => void;
    onSelectConstituency: (id: EntityId) => void;
    onUpdateAutoCampaign: (settings: AutoCampaignStrategy) => void;
}

export const CampaignDashboard = ({
    gameState,
    selectedConstituency,
    onPerformAction,
    onSelectConstituency,
    onUpdateAutoCampaign
}: CampaignDashboardProps) => {
    const [actionType, setActionType] = useState<CampaignActionType>('doorToDoor');
    const [focusIssueId, setFocusIssueId] = useState<string>('');
    const [showSettings, setShowSettings] = useState(false);

    const playerPartyId = gameState.globals.playerParty;

    // Use Queries to get data
    const constituencyData = getConstituencyData(gameState, selectedConstituency);
    const constituencyName = getIdentity(gameState, selectedConstituency)?.name || 'Unknown';

    const partyStats = getPartyStats(gameState, playerPartyId);
    const partyResources = getPartyResources(gameState, playerPartyId);

    // Get Issues
    const issues = Object.keys(gameState.components.issueData).map(id => ({
        id,
        ...gameState.components.issueData[id]
    }));

    // Safe access to campaign stats for this constituency
    const currentStats = partyStats?.campaignStats?.[selectedConstituency] || {
        awareness: 0,
        favorability: 0,
        enthusiasm: 0
    };

    // Get lead candidate for this constituency
    const partyPoliticians = getPartyPoliticians(gameState, playerPartyId);
    // Filter for politicians in this constituency (assuming relations.representedConstituency is set)
    // Note: The original code assumed a specific structure. We'll try to find one.
    const leadCandidateId = partyPoliticians.find(pid =>
        gameState.components.relations[pid]?.representedConstituency === selectedConstituency
    );
    const leadCandidateIdentity = leadCandidateId ? getIdentity(gameState, leadCandidateId) : undefined;
    const leadCandidateStats = leadCandidateId ? gameState.components.stats[leadCandidateId] : undefined;

    const actionCosts: Record<string, number> = {
        advertisement: 5000,
        mediaAppearance: 2000,
        rally: 1200,
        doorToDoor: 0,
        fundraise: 1000,
        attackAd: 10000,
        policyAnnouncement: 3000
    };

    // Mock calculation for projected effect (logic should be in system, but UI needs preview)
    // In a real ECS, we might query a "PreviewSystem" or similar.
    // For now, we'll keep the simple calculation here or move it to a helper.
    const calculateProjectedEffect = () => {
        const cost = actionCosts[actionType] || 0;
        // Simple mock logic for UI preview
        return {
            awarenessChange: cost > 0 ? 1.5 : 0.5,
            favorabilityChange: cost > 0 ? 1.0 : 0.2,
            enthusiasmChange: cost > 0 ? 0.8 : 1.2,
            estimatedReach: cost > 0 ? 0.4 : 0.1,
            costPerVote: cost > 0 ? cost / 100 : 0
        };
    };

    const projectedEffect = calculateProjectedEffect();

    // Action configurations with icons and costs
    const actions: Array<{
        type: CampaignActionType;
        name: string;
        icon: typeof Smartphone;
        cost: number;
        description: string;
    }> = [
            { type: 'advertisement', name: 'TV Ad', icon: Tv, cost: 5000, description: 'Broad reach, expensive' },
            { type: 'mediaAppearance', name: 'Media Appearance', icon: Newspaper, cost: 2000, description: 'Reaches older demographics' },
            { type: 'rally', name: 'Rally', icon: Users, cost: 1200, description: 'Energize supporters' },
            { type: 'doorToDoor', name: 'Door-to-Door', icon: Users, cost: 0, description: 'Free, high impact, low reach' },
            { type: 'fundraise', name: 'Fundraise', icon: DollarSign, cost: 1000, description: 'Raise campaign funds' },
            { type: 'policyAnnouncement', name: 'Policy Speech', icon: TrendingUp, cost: 3000, description: 'Focus on specific issue' },
        ];

    const selectedAction = actions.find(a => a.type === actionType)!;
    const budget = partyResources?.money || 0;
    const canAfford = budget >= selectedAction.cost;

    const handleQuickAction = (constId: EntityId, action: CampaignActionType) => {
        onSelectConstituency(constId);
        setActionType(action);
    };

    if (!constituencyData) {
        return (
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700 flex flex-col items-center justify-center h-full min-h-[400px]">
                <Target className="text-slate-600 mb-4" size={48} />
                <h3 className="text-xl font-bold text-white mb-2">No Constituency Selected</h3>
                <p className="text-slate-400 text-center max-w-md">
                    Select an active region on the map (e.g., Antwerp, Brussels, Liège) to view campaign data and execute actions.
                </p>
                <div className="mt-4 text-xs text-slate-600">
                    Debug ID: {selectedConstituency || 'None'}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center">
                            <Target className="mr-3" size={28} />
                            Campaign War Room
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            {constituencyName} • {constituencyData.seats} seats
                        </p>
                    </div>
                    <div className="text-right flex items-center space-x-4">
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                            title="Auto-Campaign Settings"
                        >
                            <Settings size={24} />
                        </button>
                        <div>
                            <div className="text-slate-400 text-sm">Budget</div>
                            <div className="text-2xl font-bold text-green-400">€{budget.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                {showSettings && gameState.globals.autoCampaign && (
                    <AutoCampaignSettings
                        strategy={gameState.globals.autoCampaign as any} // TODO: Fix type
                        onUpdate={onUpdateAutoCampaign}
                        onClose={() => setShowSettings(false)}
                    />
                )}

                <div className="grid grid-cols-3 gap-6">
                    {/* Left: Stats */}
                    <div className="col-span-1 space-y-4">
                        <div className="mt-0">
                            <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-3">
                                Current Standing
                            </h3>
                            <div className="space-y-2">
                                <div className="bg-slate-800 rounded p-3">
                                    <div className="text-slate-400 text-xs mb-1">Awareness</div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-white font-bold">{currentStats.awareness.toFixed(1)}%</div>
                                        <div className="w-20 bg-slate-700 rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${currentStats.awareness}%` }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-800 rounded p-3">
                                    <div className="text-slate-400 text-xs mb-1">Favorability</div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-white font-bold">{currentStats.favorability.toFixed(1)}%</div>
                                        <div className="w-20 bg-slate-700 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${currentStats.favorability}%` }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-800 rounded p-3">
                                    <div className="text-slate-400 text-xs mb-1">Enthusiasm</div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-white font-bold">{currentStats.enthusiasm.toFixed(1)}%</div>
                                        <div className="w-20 bg-slate-700 rounded-full h-2">
                                            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${currentStats.enthusiasm}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center: Action Selection */}
                    <div className="col-span-1 space-y-4">
                        <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-3">
                            Campaign Medium
                        </h3>

                        {/* Action buttons */}
                        <div className="space-y-2">
                            {actions.map(action => {
                                const Icon = action.icon;
                                const isSelected = actionType === action.type;
                                return (
                                    <button
                                        key={action.type}
                                        onClick={() => setActionType(action.type)}
                                        className={`w-full p-3 rounded-lg border-2 transition-all ${isSelected
                                            ? 'border-indigo-500 bg-indigo-900/30'
                                            : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Icon size={20} className={isSelected ? 'text-indigo-400' : 'text-slate-400'} />
                                                <span className={`ml-3 font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                                    {action.name}
                                                </span>
                                            </div>
                                            <span className={`text-sm ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`}>
                                                {action.cost > 0 ? `€${action.cost.toLocaleString()}` : 'FREE'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1 text-left ml-8">
                                            {action.description}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Issue Selector */}
                        <div className="mt-6">
                            <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-3">
                                Focus Issue (Optional)
                            </h3>
                            <select
                                value={focusIssueId}
                                onChange={(e) => setFocusIssueId(e.target.value)}
                                className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
                            >
                                <option value="">No Specific Focus</option>
                                {issues.map(issue => (
                                    <option key={issue.id} value={issue.id}>
                                        {gameState.components.identity[issue.id]?.name || issue.id}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Right: Projected Impact */}
                    <div className="col-span-1 space-y-4">
                        <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-3">
                            Projected Impact
                        </h3>

                        {/* Projected effects */}
                        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-2 border-indigo-600 rounded-lg p-4">
                            <div className="space-y-3">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-blue-300 text-sm">Awareness</span>
                                        <span className="text-white font-bold">+{projectedEffect.awarenessChange.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full"
                                            style={{ width: `${Math.min(100, projectedEffect.awarenessChange * 10)}%` }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-green-300 text-sm">Favorability</span>
                                        <span className="text-white font-bold">+{projectedEffect.favorabilityChange.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: `${Math.min(100, projectedEffect.favorabilityChange * 10)}%` }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-yellow-300 text-sm">Enthusiasm</span>
                                        <span className="text-white font-bold">+{projectedEffect.enthusiasmChange.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div
                                            className="bg-yellow-500 h-2 rounded-full"
                                            style={{ width: `${Math.min(100, projectedEffect.enthusiasmChange * 10)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Metrics */}
                        <div className="space-y-3">
                            <div className="bg-slate-800 rounded-lg p-4">
                                <div className="flex items-center text-slate-400 text-sm mb-2">
                                    <TrendingUp size={16} className="mr-2" />
                                    Estimated Reach
                                </div>
                                <div className="text-2xl font-black text-white">
                                    {(projectedEffect.estimatedReach * 100).toFixed(1)}%
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    of constituency voters
                                </div>
                            </div>

                            {selectedAction.cost > 0 && (
                                <div className="bg-slate-800 rounded-lg p-4">
                                    <div className="flex items-center text-slate-400 text-sm mb-2">
                                        <DollarSign size={16} className="mr-2" />
                                        Cost per Vote
                                    </div>
                                    <div className="text-2xl font-black text-white">
                                        €{projectedEffect.costPerVote.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        estimated efficiency
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Execute button */}
                        <button
                            onClick={() => onPerformAction(actionType, selectedConstituency, focusIssueId || undefined)}
                            disabled={!canAfford}
                            className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${canAfford
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                }`}
                        >
                            {canAfford ? `Execute Campaign (€${selectedAction.cost.toLocaleString()})` : 'Insufficient Budget'}
                        </button>

                        {leadCandidateIdentity && leadCandidateStats && (
                            <div className="bg-slate-800/50 rounded p-3 border border-slate-700">
                                <div className="text-xs text-slate-400 mb-1">Head of List Bonus</div>
                                <div className="text-sm text-white">
                                    {leadCandidateIdentity.name} (Charisma: {leadCandidateStats.charisma}/10)
                                </div>
                                <div className="text-xs text-indigo-400 mt-1">
                                    {((1.0 + (((leadCandidateStats.charisma || 5) - 5) / 10)) * 100 - 100).toFixed(0)}% effectiveness boost
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recommendations Section */}
            <CampaignRecommendations
                gameState={gameState}
                onQuickAction={handleQuickAction}
            />
        </div>
    );
};
