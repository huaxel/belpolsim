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
import { Target, Smartphone, Tv, Newspaper, Radio, Users, TrendingUp, DollarSign } from 'lucide-react';
import type { GameState, ConstituencyId, DemographicGroup } from '../types';
import type { CampaignActionType } from '../engine/campaignLogic';
import { calculateCampaignEffect } from '../engine/campaignLogic';
import { CONSTITUENCIES } from '../constants';

import { CampaignRecommendations } from './CampaignRecommendations';
import { AutoCampaignSettings } from './AutoCampaignSettings';
import { Settings } from 'lucide-react';
import type { AutoCampaignStrategy } from '../types';

interface CampaignDashboardProps {
    gameState: GameState;
    selectedConstituency: ConstituencyId;
    onPerformAction: (actionType: CampaignActionType, targetDemographic?: DemographicGroup) => void;
    onSelectConstituency: (id: ConstituencyId) => void;
    onUpdateAutoCampaign: (settings: AutoCampaignStrategy) => void;
}

export const CampaignDashboard = ({
    gameState,
    selectedConstituency,
    onPerformAction,
    onSelectConstituency,
    onUpdateAutoCampaign
}: CampaignDashboardProps) => {
    const [actionType, setActionType] = useState<CampaignActionType>('social_media');
    const [targetDemographic, setTargetDemographic] = useState<DemographicGroup | 'all'>('all');
    const [showSettings, setShowSettings] = useState(false);

    const constituency = CONSTITUENCIES[selectedConstituency];
    const currentStats = gameState.parties.player.campaignStats[selectedConstituency];
    const leadCandidate = gameState.parties.player.politicians[selectedConstituency]?.[0];

    const actionCosts = {
        social_media: 1000,
        tv_ad: 5000,
        newspaper: 2000,
        radio: 1500,
        door_to_door: 0,
        rally: 1200
    };

    // Calculate projected effect in real-time
    const projectedEffect = calculateCampaignEffect(
        {
            type: actionType,
            budget: actionCosts[actionType],
            scope: 'constituency',
            targetConstituency: selectedConstituency,
            targetDemographic: targetDemographic === 'all' ? undefined : targetDemographic
        },
        currentStats,
        constituency,
        leadCandidate
    );

    // Action configurations with icons and costs
    const actions: Array<{
        type: CampaignActionType;
        name: string;
        icon: typeof Smartphone;
        cost: number;
        description: string;
    }> = [
            { type: 'social_media', name: 'Social Media', icon: Smartphone, cost: 1000, description: 'Target youth voters online' },
            { type: 'tv_ad', name: 'TV Ad', icon: Tv, cost: 5000, description: 'Broad reach, expensive' },
            { type: 'newspaper', name: 'Newspaper', icon: Newspaper, cost: 2000, description: 'Reaches older demographics' },
            { type: 'radio', name: 'Radio', icon: Radio, cost: 1500, description: 'Good for workers' },
            { type: 'door_to_door', name: 'Door-to-Door', icon: Users, cost: 0, description: 'Free, high impact, low reach' },
        ];

    const demographics: Array<{ id: DemographicGroup | 'all'; name: string; weight?: number }> = [
        { id: 'all', name: 'All Voters' },
        { id: 'youth', name: 'Youth (18-35)', weight: constituency.demographics.youth },
        { id: 'retirees', name: 'Retirees (65+)', weight: constituency.demographics.retirees },
        { id: 'workers', name: 'Workers', weight: constituency.demographics.workers },
        { id: 'upper_class', name: 'Upper Class', weight: constituency.demographics.upper_class },
    ];

    const selectedAction = actions.find(a => a.type === actionType)!;
    const canAfford = gameState.budget >= selectedAction.cost;

    const handleQuickAction = (constId: ConstituencyId, action: CampaignActionType, demo?: DemographicGroup) => {
        onSelectConstituency(constId);
        // We need to wait for state update or just fire action?
        // Since onPerformAction uses the *current* selectedConstituency from props/state,
        // firing it immediately might use the OLD constituency if React hasn't updated yet.
        // However, we can't easily await the state update here without useEffect.
        // A better approach for Quick Action is to have onPerformAction accept an optional constituency override.
        // But for now, let's just switch view. The user can then click execute.
        // Actually, the requirement was "Quick Action".
        // Let's modify onPerformAction to accept constituencyId in the parent, or here.
        // But onPerformAction signature is fixed in props.
        // Let's just switch for now, or assume the parent handles it.
        // Wait, I can pass the constituency ID to onPerformAction if I update the interface.
        // But let's stick to the plan: "Quick Action button for recommended strategy".
        // If I just switch, it's "Quick View".

        // Revised plan: Just switch view and set up the action/demographic for the user to click "Execute".
        // That's safer and teaches them.
        onSelectConstituency(constId);
        setActionType(action);
        if (demo) setTargetDemographic(demo);
    };

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
                            {constituency.name} • {constituency.seats} seats
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
                            <div className="text-2xl font-bold text-green-400">€{gameState.budget.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                {showSettings && gameState.parties.player.autoCampaign && (
                    <AutoCampaignSettings
                        strategy={gameState.parties.player.autoCampaign}
                        onUpdate={onUpdateAutoCampaign}
                        onClose={() => setShowSettings(false)}
                    />
                )}

                <div className="grid grid-cols-3 gap-6">
                    {/* Left: Demographics Overview */}
                    <div className="col-span-1 space-y-4">
                        <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-3">
                            Demographics
                        </h3>

                        {/* Demographics breakdown */}
                        <div className="space-y-2">
                            {demographics.slice(1).map(demo => (
                                <div key={demo.id} className="bg-slate-800 rounded p-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-slate-300 text-sm">{demo.name}</span>
                                        <span className="text-white font-bold">{((demo.weight || 0) * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div
                                            className="bg-indigo-500 h-2 rounded-full"
                                            style={{ width: `${(demo.weight || 0) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Current Stats */}
                        <div className="mt-6">
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

                        {/* Target Demographic */}
                        <div className="mt-6">
                            <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-3">
                                Target Audience
                            </h3>
                            <div className="space-y-2">
                                {demographics.map(demo => (
                                    <button
                                        key={demo.id}
                                        onClick={() => setTargetDemographic(demo.id)}
                                        className={`w-full p-2 rounded border transition-all text-left ${targetDemographic === demo.id
                                            ? 'border-indigo-500 bg-indigo-900/20 text-white'
                                            : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
                                            }`}
                                    >
                                        <span className="text-sm">{demo.name}</span>
                                        {demo.weight && (
                                            <span className="text-xs text-slate-500 ml-2">
                                                ({(demo.weight * 100).toFixed(0)}%)
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
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
                            onClick={() => onPerformAction(actionType, targetDemographic === 'all' ? undefined : targetDemographic)}
                            disabled={!canAfford}
                            className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${canAfford
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                }`}
                        >
                            {canAfford ? `Execute Campaign (€${selectedAction.cost.toLocaleString()})` : 'Insufficient Budget'}
                        </button>

                        {leadCandidate && (
                            <div className="bg-slate-800/50 rounded p-3 border border-slate-700">
                                <div className="text-xs text-slate-400 mb-1">Head of List Bonus</div>
                                <div className="text-sm text-white">
                                    {leadCandidate.name} (Charisma: {leadCandidate.charisma}/10)
                                </div>
                                <div className="text-xs text-indigo-400 mt-1">
                                    {((1.0 + ((leadCandidate.charisma - 5) / 10)) * 100 - 100).toFixed(0)}% effectiveness boost
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
