import { useState, useMemo } from 'react';
import type { GameState, PartyId, Stance, IssueId } from '../types';
import { TOTAL_SEATS, MAJORITY_SEATS } from '../constants';
import { calculateAllFrictions } from '../engine/simulations/coalition';
import { CheckCircle } from 'lucide-react';

interface CoalitionInterfaceProps {
    gameState: GameState;
    onTogglePartner: (id: PartyId) => void;
    onFormGovernment: (proposal: { partners: PartyId[], policyStances: Stance[], ministriesOffered: Record<PartyId, number> }) => void; // Renamed to match GameView
}

// Helper to determine mood emoji based on friction relative to threshold
const getMoodEmoji = (friction: number, threshold: number): string => {
    if (friction > threshold * 1.5) return '😡'; // Furious (Way above threshold)
    if (friction > threshold) return '😠'; // Angry (Above threshold)
    if (friction > threshold * 0.5) return '😐'; // Neutral
    if (friction > threshold * 0.2) return '😊'; // Pleased
    return '😍'; // Thrilled
};

export const CoalitionInterface = ({ gameState, onTogglePartner, onFormGovernment }: CoalitionInterfaceProps) => {
    const { parties, coalitionPartners, issues: gameIssues } = gameState;
    const playerParty = parties[gameState.playerPartyId];

    // Local state for the policy proposal being negotiated
    // Initialize with player's own stances as a starting point
    const [negotiationStances, setNegotiationStances] = useState<Stance[]>(() =>
        playerParty.stances.length > 0 ? playerParty.stances : Object.values(gameIssues).map(issue => ({
            issueId: issue.id,
            position: 50, // Default to a neutral stance if player has no initial stances
            salience: 5 // Default salience
        }))
    );
    const [ministriesOffered, setMinistriesOffered] = useState<Partial<Record<PartyId, number>>>({});

    // Calculate total seats for the current selected partners
    const currentCoalitionSeats = playerParty.totalSeats + coalitionPartners.reduce((acc, id) => acc + parties[id].totalSeats, 0);
    const majorityReached = currentCoalitionSeats >= MAJORITY_SEATS;

    // Calculate friction for each potential partner in real-time
    const partnerFrictions = useMemo(() => {
        const allFrictions = calculateAllFrictions(parties, negotiationStances);
        // Integrate ministries offered as a "sweetener" to reduce friction
        const frictionsWithSweetener = new Map<PartyId, number>();
        allFrictions.forEach((friction, partyId) => {
            const sweetener = (ministriesOffered[partyId] || 0) * 10; // Each ministry reduces friction by 10 points
            frictionsWithSweetener.set(partyId, Math.max(0, friction - sweetener));
        });
        return frictionsWithSweetener;
    }, [parties, negotiationStances, ministriesOffered]);

    const handleSliderChange = (issueId: IssueId, value: number) => {
        setNegotiationStances(prev => {
            const existingStance = prev.find(s => s.issueId === issueId);
            if (existingStance) {
                return prev.map(s => s.issueId === issueId ? { ...s, position: value } : s);
            } else {
                // If the player doesn't have a stance on this issue initially, add it
                return [...prev, { issueId, position: value, salience: 5 }]; // Default salience
            }
        });
    };

    const handleMinistryOfferChange = (partyId: PartyId, value: number) => {
        setMinistriesOffered(prev => ({ ...prev, [partyId]: value }));
    };

    const handleFormGovernment = () => {
        onFormGovernment({
            partners: [...coalitionPartners, gameState.playerPartyId],
            policyStances: negotiationStances,
            ministriesOffered: ministriesOffered as Record<PartyId, number>
        });
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-indigo-100">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center">
                <span className="bg-indigo-100 p-2 rounded-lg mr-3">🤝</span>
                Coalition Negotiation (Phase 2)
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Partner Selection */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-700 text-lg border-b pb-2">Potential Partners</h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {Object.values(parties)
                            .filter(p => p.id !== gameState.playerPartyId)
                            .map(p => {
                                const isSelected = coalitionPartners.includes(p.id);
                                const isExtremist = p.isExtremist;
                                const friction = partnerFrictions.get(p.id) || 0;
                                const threshold = p.negotiationThreshold || 50; // Fallback
                                const moodEmoji = getMoodEmoji(friction, threshold);
                                const isImpossible = friction > threshold * 1.5;

                                return (
                                    <div key={p.id} className="w-full flex flex-col group border-b border-gray-100 pb-4 last:border-0">
                                        <div className="flex justify-between items-center w-full">
                                            <button
                                                onClick={() => onTogglePartner(p.id)}
                                                disabled={(isExtremist || isImpossible) && !isSelected}
                                                className={`flex-grow p-4 rounded-xl border-2 transition-all flex justify-between items-center mr-2
                                                    ${isSelected
                                                        ? 'border-indigo-600 bg-indigo-50 shadow-md'
                                                        : (isExtremist || isImpossible)
                                                            ? 'border-gray-100 bg-gray-50 opacity-70 cursor-not-allowed'
                                                            : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                                                    }
                                                `}
                                            >
                                                <div className="flex flex-col text-left">
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`w-3 h-3 rounded-full ${p.color.replace('bg-', 'bg-')}`}></span>
                                                        <span className="font-bold text-gray-900">{p.name}</span>
                                                        {isExtremist && <span className="text-[10px] uppercase font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Extremist</span>}
                                                        {!isExtremist && isImpossible && <span className="text-[10px] uppercase font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Refuses</span>}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Seats: {p.totalSeats}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-3xl">{moodEmoji}</span>
                                                    <span className="text-xs text-gray-400 mt-1" title={`Friction: ${friction.toFixed(1)}`}>
                                                        Friction: {friction.toFixed(0)}
                                                    </span>
                                                </div>
                                            </button>

                                            {isSelected && (
                                                <div className="flex flex-col items-center">
                                                    <label htmlFor={`ministries-${p.id}`} className="text-xs text-gray-500 mb-1">Ministries</label>
                                                    <input
                                                        id={`ministries-${p.id}`}
                                                        type="number"
                                                        min="0"
                                                        max="5"
                                                        value={ministriesOffered[p.id] || 0}
                                                        onChange={(e) => handleMinistryOfferChange(p.id, parseInt(e.target.value))}
                                                        className="w-16 p-1 text-center border rounded-md text-gray-700"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Friction Breakdown */}
                                        {(isSelected || friction > 20) && (
                                            <div className="mt-2 pl-4 text-xs text-gray-500 w-full">
                                                <span className="font-bold">Top Conflicts:</span>
                                                <ul className="list-disc list-inside ml-2">
                                                    {negotiationStances
                                                        .map(stance => {
                                                            const partyStance = p.stances.find(s => s.issueId === stance.issueId);
                                                            if (!partyStance) return null;
                                                            const diff = Math.abs(stance.position - partyStance.position);
                                                            const impact = diff * partyStance.salience;
                                                            return { issueId: stance.issueId, impact, diff, partyPos: partyStance.position };
                                                        })
                                                        .filter((item): item is { issueId: IssueId, impact: number, diff: number, partyPos: number } => item !== null && item.impact > 50)
                                                        .sort((a, b) => b.impact - a.impact)
                                                        .slice(0, 3)
                                                        .map(conflict => (
                                                            <li key={conflict.issueId}>
                                                                {gameIssues[conflict.issueId].name} (Them: {conflict.partyPos}, You: {negotiationStances.find(s => s.issueId === conflict.issueId)?.position})
                                                            </li>
                                                        ))
                                                    }
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* Policy Sliders */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-700 text-lg border-b pb-2">Negotiated Policy Stances</h3>
                    {Object.values(gameIssues).map(issue => {
                        const currentStance = negotiationStances.find(s => s.issueId === issue.id);
                        const position = currentStance ? currentStance.position : 50; // Default to neutral
                        return (
                            <div key={issue.id} className="p-4 bg-gray-50 rounded-lg shadow-sm">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {issue.name}
                                </label>
                                <p className="text-xs text-gray-500 mb-3">{issue.description}</p>
                                <div className="relative w-full h-8 flex items-center">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={position}
                                        onChange={e => handleSliderChange(issue.id, parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer z-10 relative"
                                        style={{ accentColor: playerParty.color.replace('bg-', '') }}
                                    />

                                    {/* Partner Stance Markers */}
                                    {coalitionPartners.map(partnerId => {
                                        const partner = parties[partnerId];
                                        const partnerStance = partner.stances.find(s => s.issueId === issue.id);
                                        if (!partnerStance) return null;

                                        return (
                                            <div
                                                key={partnerId}
                                                className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-sm z-20 pointer-events-none transform -translate-y-1/2 top-1/2 transition-all duration-300`}
                                                style={{
                                                    left: `calc(${partnerStance.position}% - 8px)`,
                                                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue(`--color-${partner.color.replace('bg-', '')}`) || partner.color.replace('bg-', '').replace('red', '#ef4444').replace('blue', '#3b82f6').replace('green', '#22c55e').replace('yellow', '#eab308').replace('orange', '#f97316').replace('cyan', '#06b6d4').replace('gray', '#374151') // Fallback color mapping since we can't easily resolve tailwind classes to hex in JS without a map
                                                }}
                                                title={`${partner.name} wants: ${partnerStance.position}`}
                                            ></div>
                                        );
                                    })}
                                </div>
                                <span className="text-sm w-12 text-right text-gray-600">100</span>
                                <div className="w-16 text-center bg-indigo-100 text-indigo-800 font-bold rounded-md p-1 ml-2">
                                    {position}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer Status Bar */}
            <div className="bg-gray-50 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 mt-8">
                <div className="flex items-center space-x-6">
                    <div className="text-center md:text-left">
                        <div className="text-sm text-gray-500 uppercase font-bold tracking-wider">Coalition Strength</div>
                        <div className="flex items-baseline space-x-2">
                            <span className={`text-3xl font-black ${majorityReached ? "text-green-600" : "text-red-600"}`}>
                                {currentCoalitionSeats}
                            </span>
                            <span className="text-gray-400 font-medium">/ {TOTAL_SEATS} seats</span>
                        </div>
                    </div>

                    {majorityReached && (
                        <div className="hidden md:flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm font-bold">
                            <CheckCircle size={16} className="mr-1" /> Majority Reached
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    {/* For MVP, we'll assume a government can always be formed if majority is reached,
                        pending full `validateGovernment` integration in UI. */}
                    <button
                        onClick={handleFormGovernment}
                        disabled={!majorityReached}
                        className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-lg transition-all transform active:scale-95
                            ${majorityReached
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }
                        `}
                    >
                        Propose Government
                    </button>
                </div>
            </div>
        </div >
    );
};