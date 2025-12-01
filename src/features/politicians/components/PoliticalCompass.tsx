import React from 'react';

// Type definitions for backwards compatibility
type PartyId = string;
interface Party {
    id: PartyId;
    name: string;
    color: string;
    ideology: { economic: number; social: number };
}
interface Politician {
    id: string;
    name: string;
    partyId: PartyId;
}

interface PoliticalCompassProps {
    parties: Party[];
    politicians?: Politician[]; // Optional: for individual politician visualization
}

export const PoliticalCompass: React.FC<PoliticalCompassProps> = ({ parties, politicians }) => {
    // Determine the bounds of the compass (0-100 for both economic and social)
    const minEconomic = 0;
    const maxEconomic = 100;
    const minSocial = 0;
    const maxSocial = 100;

    // Canvas/Container dimensions
    const width = 400;
    const height = 400;
    const padding = 20;
    const plotWidth = width - 2 * padding;
    const plotHeight = height - 2 * padding;

    // Function to map ideology values (0-100) to pixel coordinates
    const mapToPixels = (value: number, minVal: number, maxVal: number, plotDim: number) => {
        // Normalize value to 0-1 range, then scale to plot dimensions
        return (value - minVal) / (maxVal - minVal) * plotDim;
    };

    return (
        <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800 flex flex-col items-center">
            <h3 className="font-bold text-slate-400 text-lg border-b border-slate-800 pb-2 mb-4 w-full text-center">Political Compass</h3>
            <div
                className="relative border-2 border-slate-700 bg-slate-950"
                style={{ width: `${width}px`, height: `${height}px` }}
            >
                {/* Horizontal Axis (Economic: Left-Right) */}
                <div className="absolute top-1/2 left-0 w-full h-px bg-slate-600"></div>
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-full pr-2 text-sm text-slate-500">Left</div>
                <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-full pl-2 text-sm text-slate-500">Right</div>

                {/* Vertical Axis (Social: Progressive-Conservative) */}
                <div className="absolute left-1/2 top-0 h-full w-px bg-slate-600"></div>
                <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-full pb-2 text-sm text-slate-500">Progressive</div>
                <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full pt-2 text-sm text-slate-500">Conservative</div>

                {/* Plot Parties */}
                {parties.map(party => {
                    const x = mapToPixels(party.ideology.economic, minEconomic, maxEconomic, plotWidth);
                    const y = mapToPixels(party.ideology.social, minSocial, maxSocial, plotHeight);

                    return (
                        <div
                            key={party.id}
                            className={`absolute w-3 h-3 rounded-full flex items-center justify-center cursor-pointer group`}
                            style={{
                                left: `${padding + x - 6}px`, // -6 to center the dot
                                top: `${padding + y - 6}px`,  // -6 to center the dot
                                backgroundColor: party.color.replace('bg-', '#') // Assuming Tailwind color maps directly or close
                            }}
                            title={`${party.name} (E: ${party.ideology.economic}, S: ${party.ideology.social})`}
                        >
                            <span className="absolute whitespace-nowrap -bottom-6 text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-2 py-1 rounded border border-slate-700 z-10">
                                {party.name}
                            </span>
                        </div>
                    );
                })}

                {/* Plot Politicians (Optional) */}
                {politicians && politicians.map(politician => {
                    // Assuming politicians also have ideology or derive it from party
                    const party = parties.find(p => p.id === politician.partyId);
                    if (!party) return null; // Should not happen with valid data

                    const x = mapToPixels(party.ideology.economic, minEconomic, maxEconomic, plotWidth);
                    const y = mapToPixels(party.ideology.social, minSocial, maxSocial, plotHeight);

                    return (
                        <div
                            key={politician.id}
                            className={`absolute w-2 h-2 rounded-full border border-slate-500`}
                            style={{
                                left: `${padding + x - 4}px`, // Smaller dot, slightly offset
                                top: `${padding + y - 4 + (Math.random() * 10 - 5)}px`, // Small random offset to distinguish
                                backgroundColor: party.color.replace('bg-', '#')
                            }}
                            title={`${politician.name} (${party.name})`}
                        ></div>
                    );
                })}
            </div>
        </div>
    );
};