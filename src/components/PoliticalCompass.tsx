import type { Party } from '../types';

interface PoliticalCompassProps {
    parties: Party[];
    playerPartyId: string;
}

export const PoliticalCompass = ({ parties, playerPartyId }: PoliticalCompassProps) => {
    // Compass dimensions
    const size = 300;
    const center = size / 2;
    const scale = (size / 2) / 11; // Scale 10 to fit in half size with some padding

    // Helper to map coordinate (-10 to 10) to pixel
    const mapX = (val: number) => center + (val * scale);
    const mapY = (val: number) => center - (val * scale); // Invert Y because SVG Y grows downwards

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
            <h3 className="font-bold text-gray-700 mb-4">Political Compass</h3>

            <div className="relative">
                <svg width={size} height={size} className="bg-gray-50 rounded-lg border border-gray-200">
                    {/* Grid Lines */}
                    <line x1={center} y1={0} x2={center} y2={size} stroke="#e5e7eb" strokeWidth="2" />
                    <line x1={0} y1={center} x2={size} y2={center} stroke="#e5e7eb" strokeWidth="2" />

                    {/* Labels */}
                    <text x={center} y={15} textAnchor="middle" className="text-[10px] fill-gray-400 font-bold">AUTHORITARIAN</text>
                    <text x={center} y={size - 5} textAnchor="middle" className="text-[10px] fill-gray-400 font-bold">LIBERTARIAN</text>
                    <text x={5} y={center} alignmentBaseline="middle" className="text-[10px] fill-gray-400 font-bold" transform={`rotate(-90, 10, ${center})`}>LEFT</text>
                    <text x={size - 5} y={center} textAnchor="end" alignmentBaseline="middle" className="text-[10px] fill-gray-400 font-bold">RIGHT</text>

                    {/* Parties */}
                    {parties.map(party => (
                        <g key={party.id} transform={`translate(${mapX(party.ideology.economic)}, ${mapY(party.ideology.social)})`}>
                            <circle
                                r={party.id === playerPartyId ? 8 : 6}
                                className={`${party.color.replace('bg-', 'fill-')} stroke-white stroke-2`}
                            />
                            <text
                                y={-10}
                                textAnchor="middle"
                                className={`text-[10px] font-bold ${party.id === playerPartyId ? 'fill-black' : 'fill-gray-500'}`}
                            >
                                {party.name}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center max-w-[300px]">
                Parties are mapped based on Economic (Left/Right) and Social (Libertarian/Authoritarian) stances.
            </div>
        </div>
    );
};
