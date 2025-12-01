// Type definitions for backwards compatibility
type PartyId = string;
type IssueId = string;
interface Stance {
    issueId: IssueId;
    position: number;
    salience: number;
}
interface Party {
    id: PartyId;
    name: string;
    color: string;
    stances: Stance[];
}

interface PolicyNegotiationProps {
    gameIssues: Record<IssueId, any>;
    negotiationStances: Stance[];
    coalitionPartners: PartyId[];
    parties: Record<PartyId, Party>;
    playerParty: Party;
    onSliderChange: (issueId: IssueId, value: number) => void;
}

export const PolicyNegotiation = ({
    gameIssues,
    negotiationStances,
    coalitionPartners,
    parties,
    playerParty,
    onSliderChange
}: PolicyNegotiationProps) => {
    return (
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
                                onChange={e => onSliderChange(issue.id, parseInt(e.target.value))}
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
                                            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue(`--color-${partner.color.replace('bg-', '')}`) || partner.color.replace('bg-', '').replace('red', '#ef4444').replace('blue', '#3b82f6').replace('green', '#22c55e').replace('yellow', '#eab308').replace('orange', '#f97316').replace('cyan', '#06b6d4').replace('gray', '#374151') // Fallback color mapping
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
    );
};
