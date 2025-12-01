import { CONSTITUENCIES } from '../constants';
import type { ConstituencyId, GameState, PartyId } from '../types';

interface BelgiumMapProps {
    gameState: GameState;
    onSelect: (id: ConstituencyId) => void;
}

// Simplified SVG paths for Belgium's constituencies (Abstract representation)
// In a real app, these would be precise paths. Here we use approximate shapes for the grid.
const MAP_PATHS: Record<ConstituencyId, string> = {
    // Flanders
    west_flanders: "M10,40 L40,30 L50,60 L20,80 Z",
    east_flanders: "M40,30 L70,30 L70,60 L50,60 Z",
    antwerp: "M50,10 L90,10 L90,40 L60,40 Z",
    flemish_brabant: "M60,40 L90,40 L80,60 L50,60 Z", // Surrounding Brussels
    limburg: "M90,10 L120,20 L110,50 L90,40 Z",

    // Brussels
    brussels_capital: "M65,45 L75,45 L75,55 L65,55 Z", // Small enclave

    // Wallonia
    walloon_brabant: "M60,60 L80,60 L80,70 L60,70 Z",
    hainaut: "M20,80 L60,70 L60,90 L30,100 Z",
    namur: "M60,70 L90,70 L90,100 L60,90 Z",
    liege: "M80,60 L110,50 L120,80 L90,70 Z",
    luxembourg: "M90,100 L120,80 L130,120 L80,120 Z"
};

// Center points for labels
const MAP_LABELS: Record<ConstituencyId, { x: number, y: number }> = {
    west_flanders: { x: 30, y: 55 },
    east_flanders: { x: 55, y: 45 },
    antwerp: { x: 70, y: 25 },
    flemish_brabant: { x: 85, y: 50 }, // Offset
    limburg: { x: 105, y: 30 },
    brussels_capital: { x: 70, y: 50 },
    walloon_brabant: { x: 70, y: 65 },
    hainaut: { x: 40, y: 85 },
    namur: { x: 75, y: 85 },
    liege: { x: 100, y: 65 },
    luxembourg: { x: 105, y: 105 }
};

export const BelgiumMap = ({ gameState, onSelect }: BelgiumMapProps) => {
    const getLeadingPartyColor = (cId: ConstituencyId): string => {
        let maxPoll = -1;
        let leader: PartyId | null = null;

        Object.values(gameState.parties).forEach(party => {
            const poll = party.constituencyPolling[cId];
            if (poll > maxPoll) {
                maxPoll = poll;
                leader = party.id;
            }
        });

        if (leader) {
            // Map Tailwind classes to hex colors for SVG fill
            const colorMap: Record<string, string> = {
                'bg-green-600': '#16a34a', // Player
                'bg-yellow-500': '#eab308', // N-VA
                'bg-gray-800': '#1f2937',   // VB
                'bg-red-500': '#ef4444',    // Vooruit
                'bg-orange-500': '#f97316', // CD&V
                'bg-red-600': '#dc2626',    // PS
                'bg-blue-600': '#2563eb',   // MR
                'bg-red-800': '#991b1b',    // PTB
                'bg-cyan-500': '#06b6d4',   // Les Engages
            };
            return colorMap[gameState.parties[leader as PartyId].color] || '#d1d5db';
        }
        return '#d1d5db'; // Gray default
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-full aspect-[4/3] max-w-2xl">
                <svg viewBox="0 0 140 130" className="w-full h-full drop-shadow-2xl">
                    {Object.entries(MAP_PATHS).map(([id, path]) => {
                        const cId = id as ConstituencyId;
                        const isSelected = gameState.selectedConstituency === cId;
                        const fillColor = getLeadingPartyColor(cId);

                        return (
                            <g key={cId} onClick={() => onSelect(cId)} className="cursor-pointer transition-all hover:opacity-80">
                                <path
                                    d={path}
                                    fill={fillColor}
                                    stroke={isSelected ? "#eab308" : "#1e293b"}
                                    strokeWidth={isSelected ? "2" : "0.5"}
                                    className="transition-colors duration-300"
                                />
                                {/* Highlight effect for selection */}
                                {isSelected && (
                                    <path d={path} fill="none" stroke="#eab308" strokeWidth="1" strokeDasharray="2,2" />
                                )}
                            </g>
                        );
                    })}

                    {/* Labels */}
                    {Object.entries(MAP_LABELS).map(([id, pos]) => {
                        const cId = id as ConstituencyId;
                        const isSelected = gameState.selectedConstituency === cId;
                        return (
                            <text
                                key={`label-${cId}`}
                                x={pos.x}
                                y={pos.y}
                                fontSize="3"
                                fill={isSelected ? "#000" : "#fff"}
                                textAnchor="middle"
                                pointerEvents="none"
                                fontWeight="bold"
                                style={{ textShadow: '0px 0px 2px rgba(0,0,0,0.8)' }}
                            >
                                {CONSTITUENCIES[cId].name.substring(0, 3).toUpperCase()}
                            </text>
                        );
                    })}
                </svg>
            </div>
            <div className="mt-4 text-center text-sm text-slate-500">
                Click a region to view details and campaign.
            </div>
        </div>
    );
};
