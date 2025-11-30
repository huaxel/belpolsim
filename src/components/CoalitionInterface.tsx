import { useState } from 'react';
import { POLICIES, TOTAL_SEATS } from '../constants';
import type { GameState, PartyId } from '../types';

interface CoalitionInterfaceProps {
    gameState: GameState;
    onTogglePartner: (id: PartyId) => void;
    onFormGovernment: () => void;
}

export const CoalitionInterface = ({ gameState, onTogglePartner, onFormGovernment }: CoalitionInterfaceProps) => {
    const totalSeats = gameState.parties.player.totalSeats + gameState.coalitionPartners.reduce((acc, id) => acc + gameState.parties[id].totalSeats, 0);
    const [acceptedDemands, setAcceptedDemands] = useState<Record<string, boolean>>({});

    // Collect all demands from current partners
    const activeDemands = new Set<string>();
    gameState.coalitionPartners.forEach(id => {
        gameState.parties[id].demands.forEach(d => activeDemands.add(d));
    });

    const allDemandsAccepted = Array.from(activeDemands).every(d => acceptedDemands[d]);

    const handleToggleDemand = (demandId: string) => {
        setAcceptedDemands(prev => ({ ...prev, [demandId]: !prev[demandId] }));
    };

    return (
        <div className="bg-indigo-50 p-6 rounded-2xl border-2 border-indigo-200">
            <h2 className="text-2xl font-bold text-indigo-900 mb-4">Form Government</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Partner Selection */}
                <div>
                    <h3 className="font-bold text-indigo-800 mb-2">Select Partners</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {Object.values(gameState.parties).filter(p => p.id !== 'player').map(p => (
                            <button
                                key={p.id}
                                onClick={() => onTogglePartner(p.id)}
                                className={`p-3 rounded-lg border flex justify-between items-center transition-all ${gameState.coalitionPartners.includes(p.id) ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-gray-50'} ${p.isExtremist ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex flex-col text-left">
                                    <span className="font-bold">{p.name}</span>
                                    <span className="text-xs opacity-80">{p.demands.length > 0 ? `Demands: ${p.demands.length}` : 'No Demands'}</span>
                                </div>
                                <span className="font-bold text-lg">{p.totalSeats}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Demands Negotiation */}
                <div>
                    <h3 className="font-bold text-indigo-800 mb-2">Policy Demands</h3>
                    {activeDemands.size === 0 ? (
                        <p className="text-gray-500 italic text-sm">Select partners to see their demands.</p>
                    ) : (
                        <div className="space-y-2">
                            {Array.from(activeDemands).map(demandId => {
                                // @ts-ignore - We know the ID exists in POLICIES
                                const policy = POLICIES[demandId];
                                return (
                                    <div key={demandId} className={`p-3 rounded-lg border flex items-start space-x-3 ${acceptedDemands[demandId] ? 'bg-green-50 border-green-200' : 'bg-white border-red-200'}`}>
                                        <input
                                            type="checkbox"
                                            checked={!!acceptedDemands[demandId]}
                                            onChange={() => handleToggleDemand(demandId)}
                                            className="mt-1 h-4 w-4 text-indigo-600"
                                        />
                                        <div>
                                            <h4 className="font-bold text-sm">{policy ? policy.name : demandId}</h4>
                                            <p className="text-xs text-gray-600">{policy ? policy.description : 'Unknown Policy'}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-indigo-200">
                <div className="text-xl font-bold text-indigo-900">
                    Total Seats: <span className={totalSeats >= 76 ? "text-green-600" : "text-red-600"}>{totalSeats}</span> / {TOTAL_SEATS}
                </div>
                <div className="flex items-center space-x-4">
                    {!allDemandsAccepted && activeDemands.size > 0 && <span className="text-red-500 text-xs font-bold">Accept all demands to proceed</span>}
                    <button
                        onClick={onFormGovernment}
                        disabled={!allDemandsAccepted && activeDemands.size > 0}
                        className={`px-6 py-2 rounded-lg font-bold transition-all ${allDemandsAccepted || activeDemands.size === 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                        Form Government
                    </button>
                </div>
            </div>
        </div>
    );
};
