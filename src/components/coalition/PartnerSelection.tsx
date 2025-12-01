import type { Party, PartyId, Stance, IssueId } from '../../types';

interface PartnerSelectionProps {
    parties: Record<PartyId, Party>;
    playerPartyId: PartyId;
    coalitionPartners: PartyId[];
    partnerFrictions: Map<PartyId, number>;
    negotiationStances: Stance[];
    gameIssues: Record<IssueId, any>;
    ministriesOffered: Partial<Record<PartyId, number>>;
    onTogglePartner: (id: PartyId) => void;
    onMinistryOfferChange: (id: PartyId, value: number) => void;
}

const getMoodEmoji = (friction: number, threshold: number): string => {
    if (friction > threshold * 1.5) return '😡'; // Furious
    if (friction > threshold) return '😠'; // Angry
    if (friction > threshold * 0.5) return '😐'; // Neutral
    if (friction > threshold * 0.2) return '😊'; // Pleased
    return '😍'; // Thrilled
};

export const PartnerSelection = ({
    parties,
    playerPartyId,
    coalitionPartners,
    partnerFrictions,
    negotiationStances,
    gameIssues,
    ministriesOffered,
    onTogglePartner,
    onMinistryOfferChange
}: PartnerSelectionProps) => {
    return (
        <div className="space-y-4">
            <h3 className="font-bold text-gray-700 text-lg border-b pb-2">Potential Partners</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {Object.values(parties)
                    .filter(p => p.id !== playerPartyId)
                    .map(p => {
                        const isSelected = coalitionPartners.includes(p.id);
                        const isExtremist = p.isExtremist;
                        const friction = partnerFrictions.get(p.id) || 0;
                        const threshold = p.negotiationThreshold || 50;
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
                                                onChange={(e) => onMinistryOfferChange(p.id, parseInt(e.target.value))}
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
    );
};
