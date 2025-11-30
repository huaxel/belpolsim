import { useState } from 'react';
import { POLICIES, TOTAL_SEATS } from '../constants';
import type { GameState, PartyId } from '../types';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface CoalitionInterfaceProps {
    gameState: GameState;
    onTogglePartner: (id: PartyId) => void;
    onFormGovernment: () => void;
}

export const CoalitionInterface = ({ gameState, onTogglePartner, onFormGovernment }: CoalitionInterfaceProps) => {
    const totalSeats = gameState.parties.player.totalSeats + gameState.coalitionPartners.reduce((acc, id) => acc + gameState.parties[id].totalSeats, 0);
    const [acceptedDemands, setAcceptedDemands] = useState<Record<string, boolean>>({});
    const player = gameState.parties.player;

    // Collect all demands from current partners
    const activeDemands = new Set<string>();
    gameState.coalitionPartners.forEach(id => {
        gameState.parties[id].demands.forEach(d => activeDemands.add(d));
    });

    const allDemandsAccepted = Array.from(activeDemands).every(d => acceptedDemands[d]);

    const handleToggleDemand = (demandId: string) => {
        setAcceptedDemands(prev => ({ ...prev, [demandId]: !prev[demandId] }));
    };

    const getConflict = (partnerId: PartyId) => {
        const partner = gameState.parties[partnerId];
        // Player demands vs Partner Red Lines
        const conflict1 = player.demands.find(d => partner.redLines.includes(d));
        if (conflict1) return `Opposes your ${POLICIES[conflict1 as keyof typeof POLICIES]?.name}`;

        // Partner demands vs Player Red Lines
        const conflict2 = partner.demands.find(d => player.redLines.includes(d));
        if (conflict2) return `You oppose their ${POLICIES[conflict2 as keyof typeof POLICIES]?.name}`;

        return null;
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-indigo-100">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center">
                <span className="bg-indigo-100 p-2 rounded-lg mr-3">🤝</span>
                Coalition Negotiation
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Partner Selection */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-700 text-lg border-b pb-2">Potential Partners</h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {Object.values(gameState.parties).filter(p => p.id !== 'player').map(p => {
                            const conflict = getConflict(p.id);
                            const isSelected = gameState.coalitionPartners.includes(p.id);
                            const isExtremist = p.isExtremist;
                            const isDisabled = isExtremist || !!conflict;

                            return (
                                <button
                                    key={p.id}
                                    onClick={() => !isDisabled && onTogglePartner(p.id)}
                                    disabled={isDisabled && !isSelected} // Allow deselecting even if disabled
                                    className={`w-full p-4 rounded-xl border-2 transition-all flex justify-between items-center group
                                        ${isSelected
                                            ? 'border-indigo-600 bg-indigo-50 shadow-md'
                                            : isDisabled
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
                                        </div>

                                        {conflict ? (
                                            <div className="text-xs text-red-500 font-medium mt-1 flex items-center">
                                                <XCircle size={12} className="mr-1" /> {conflict}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-gray-500 mt-1">
                                                {p.demands.length} Demands • {p.redLines.length} Red Lines
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="font-bold text-xl text-gray-800">{p.totalSeats}</span>
                                        <span className="text-xs text-gray-400">seats</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Demands Negotiation */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-700 text-lg border-b pb-2">Program for Government</h3>
                    {activeDemands.size === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 border-2 border-dashed border-gray-200 rounded-xl">
                            <p>Select partners to negotiate policies.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-4">
                                <p>To form a government, you must agree to your partners' key demands.</p>
                            </div>
                            {Array.from(activeDemands).map(demandId => {
                                // @ts-ignore
                                const policy = POLICIES[demandId];
                                const isAccepted = acceptedDemands[demandId];
                                return (
                                    <div
                                        key={demandId}
                                        onClick={() => handleToggleDemand(demandId)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start space-x-3
                                            ${isAccepted
                                                ? 'bg-green-50 border-green-500 shadow-sm'
                                                : 'bg-white border-gray-200 hover:border-gray-300'
                                            }
                                        `}
                                    >
                                        <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${isAccepted ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'}`}>
                                            {isAccepted && <CheckCircle size={14} className="text-white" />}
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-sm ${isAccepted ? 'text-green-900' : 'text-gray-900'}`}>
                                                {policy ? policy.name : demandId}
                                            </h4>
                                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                                {policy ? policy.description : 'Unknown Policy'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Status Bar */}
            <div className="bg-gray-50 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center space-x-6">
                    <div className="text-center md:text-left">
                        <div className="text-sm text-gray-500 uppercase font-bold tracking-wider">Coalition Strength</div>
                        <div className="flex items-baseline space-x-2">
                            <span className={`text-3xl font-black ${totalSeats >= 76 ? "text-green-600" : "text-red-600"}`}>
                                {totalSeats}
                            </span>
                            <span className="text-gray-400 font-medium">/ {TOTAL_SEATS} seats</span>
                        </div>
                    </div>

                    {totalSeats >= 76 && (
                        <div className="hidden md:flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm font-bold">
                            <CheckCircle size={16} className="mr-1" /> Majority Reached
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    {!allDemandsAccepted && activeDemands.size > 0 && (
                        <span className="text-red-500 text-xs font-bold flex items-center animate-pulse">
                            <AlertTriangle size={12} className="mr-1" />
                            Must accept all demands
                        </span>
                    )}
                    <button
                        onClick={onFormGovernment}
                        disabled={!allDemandsAccepted && activeDemands.size > 0}
                        className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-lg transition-all transform active:scale-95
                            ${allDemandsAccepted || activeDemands.size === 0
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }
                        `}
                    >
                        Form Government
                    </button>
                </div>
            </div>
        </div>
    );
};
