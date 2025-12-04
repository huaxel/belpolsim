import type { GameState, EntityId } from '@/core';
import { getPartyPolling, getAllParties } from '@/core';

// Type aliases for backwards compatibility
type ConstituencyId = string;

// Placeholder for CONSTITUENCIES - should be accessed from world data
const CONSTITUENCIES: Record<ConstituencyId, { name: string }> = {
    west_flanders: { name: 'West-Vlaanderen' },
    east_flanders: { name: 'Oost-Vlaanderen' },
    antwerp: { name: 'Antwerpen' },
    flemish_brabant: { name: 'Vlaams-Brabant' },
    limburg: { name: 'Limburg' },
    brussels_capital: { name: 'Brussels' },
    walloon_brabant: { name: 'Brabant wallon' },
    hainaut: { name: 'Hainaut' },
    namur: { name: 'Namur' },
    liege: { name: 'Liège' },
    luxembourg: { name: 'Luxembourg' }
};

interface BelgiumMapProps {
    gameState: GameState;
    selectedConstituency?: string;
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

// Map SVG keys to Game Entity IDs
const ID_MAPPING: Record<string, string> = {
    antwerp: 'constituency:antwerp',
    liege: 'constituency:liege',
    brussels_capital: 'constituency:brussels',
    // Map others to potential future IDs or keep as is if not implemented
    west_flanders: 'constituency:west_flanders',
    east_flanders: 'constituency:east_flanders',
    flemish_brabant: 'constituency:flemish_brabant',
    limburg: 'constituency:limburg',
    walloon_brabant: 'constituency:walloon_brabant',
    hainaut: 'constituency:hainaut',
    namur: 'constituency:namur',
    luxembourg: 'constituency:luxembourg'
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

export const BelgiumMap = ({ gameState, selectedConstituency, onSelect }: BelgiumMapProps) => {
    const getLeadingPartyColor = (cId: ConstituencyId): string => {
        let maxPoll = -1;
        let leader: EntityId | null = null;

        // Use ECS queries to get party data
        const partyIds = getAllParties(gameState);

        partyIds.forEach(partyId => {
            // For now, use national polling as constituency polling isn't implemented
            const poll = getPartyPolling(gameState, partyId);
            if (poll > maxPoll) {
                maxPoll = poll;
                leader = partyId;
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
            // Use identity component for party info (color stored in tags or separate component)
            const partyIdentity = gameState.components.identity[leader];
            void cId; // Suppress unused variable warning (will be used for constituency-level polling)
            return colorMap[partyIdentity?.tags?.[0] || ''] || '#d1d5db';
        }
        return '#d1d5db'; // Gray default
    };

    // const selectedConstituency = gameState.globals.selectedConstituencyId;

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-full aspect-[4/3] max-w-2xl">
                <svg viewBox="0 0 140 130" className="w-full h-full drop-shadow-2xl">
                    {Object.entries(MAP_PATHS).map(([id, path]) => {
                        const cId = id as ConstituencyId;
                        const entityId = ID_MAPPING[cId]; // Only get mapped IDs
                        const isSelected = entityId && selectedConstituency === entityId;
                        const fillColor = getLeadingPartyColor(cId);
                        const isInteractive = !!entityId;

                        return (
                            <g
                                key={cId}
                                onClick={() => isInteractive && onSelect(entityId)}
                                className={`transition-all ${isInteractive ? 'cursor-pointer hover:opacity-80' : 'opacity-50 cursor-not-allowed'}`}
                            >
                                <path
                                    d={path}
                                    fill={isInteractive ? fillColor : '#1e293b'} // Darker for unimplemented
                                    stroke={isSelected ? "#eab308" : "#334155"}
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
                        const entityId = ID_MAPPING[cId] || cId;
                        const isSelected = selectedConstituency === entityId;
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
