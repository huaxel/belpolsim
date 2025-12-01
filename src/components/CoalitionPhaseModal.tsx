import React, { useState } from 'react';
import type { GameState, PartyId, Stance, Politician } from '../types';
import { CoalitionInterface } from './CoalitionInterface';

interface CoalitionPhaseModalProps {
    gameState: GameState;
    onClose: () => void;
    onTogglePartner: (id: PartyId) => void;
    onProposeGovernment: (proposal: { partners: PartyId[], policyStances: Stance[], ministers: Politician[], primeMinister: Politician | null }) => void;
}

type CoalitionStage = 'king_consults' | 'informateur' | 'formateur' | 'negotiating';

export const CoalitionPhaseModal: React.FC<CoalitionPhaseModalProps> = ({
    gameState,
    onClose,
    onTogglePartner,
    onProposeGovernment,
}) => {
    const [stage, setStage] = useState<CoalitionStage>('king_consults');
    const [informateurParty, setInformateurParty] = useState<PartyId | null>(null);
    const [formateurParty, setFormateurParty] = useState<PartyId | null>(null);

    const { parties, playerPartyId } = gameState;
    const playerIsInformateur = informateurParty === playerPartyId;
    const playerIsFormateur = formateurParty === playerPartyId;

    const handleKingConsults = () => {
        const largestPartyId = Object.values(parties).sort((a, b) => b.totalSeats - a.totalSeats)[0].id;
        setInformateurParty(largestPartyId);
        setStage('informateur');
    };

    const handleInformateurReport = () => {
        setFormateurParty(informateurParty);
        setStage('formateur');
    };

    const handleFormateurAccept = () => {
        setStage('negotiating');
    };

    const placeholderMinisters: Politician[] = [
        { id: 'playerMin1', name: 'Player Minister 1', partyId: playerPartyId, language: 'dutch', constituency: 'antwerp', charisma: 5, expertise: 5, popularity: 50, internalClout: 50, isElected: true, ministerialRole: 'Finance' },
        { id: 'playerMin2', name: 'Player Minister 2', partyId: playerPartyId, language: 'french', constituency: 'brussels_capital', charisma: 5, expertise: 5, popularity: 50, internalClout: 50, isElected: true, ministerialRole: 'Foreign Affairs' },
    ];

    const handleSubmitGovernmentProposal = (proposal: { partners: PartyId[], policyStances: Stance[], ministriesOffered: Record<PartyId, number> }) => {
        onProposeGovernment({
            partners: proposal.partners,
            policyStances: proposal.policyStances,
            ministers: placeholderMinisters, // Placeholder
            primeMinister: playerIsFormateur ? placeholderMinisters[0] : null, // Placeholder
        });
    };

    if (gameState.gamePhase !== 'coalition_formation') return null;

    const renderContent = () => {
        switch (stage) {
            case 'king_consults':
                return (
                    <>
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-slate-200">The King Consults</h2>
                            <p className="text-slate-400 mt-2">
                                Following the election results, His Majesty the King is consulting with all party leaders to assess potential coalition options.
                            </p>
                        </div>
                        <div className="py-4 text-slate-300">
                            The political landscape is fragmented. No single party holds a majority. The stability of the nation depends on successful coalition negotiations.
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={handleKingConsults} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors">Continue</button>
                        </div>
                    </>
                );
            case 'informateur':
                const informateurName = informateurParty ? parties[informateurParty]?.name : 'an unknown figure';
                return (
                    <>
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-slate-200">Appointment of the Informateur</h2>
                            <p className="text-slate-400 mt-2">
                                His Majesty the King has appointed {informateurName} as the Informateur. Their task is to explore viable coalition options.
                            </p>
                        </div>
                        <div className="py-4 text-slate-300">
                            {playerIsInformateur ? (
                                <p>You have been tasked with probing the political waters. Who could realistically form a government together?</p>
                            ) : (
                                <p>{informateurName} is currently conducting their preliminary talks. Political observers are eagerly awaiting their report.</p>
                            )}
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={handleInformateurReport} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors">Continue</button>
                        </div>
                    </>
                );
            case 'formateur':
                const formateurName = formateurParty ? parties[formateurParty]?.name : 'an unknown figure';
                return (
                    <>
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-slate-200">Appointment of the Formateur</h2>
                            <p className="text-slate-400 mt-2">
                                Based on the Informateur's report, the King has appointed {formateurName} as the Formateur. Their critical task is to formally build the new government.
                            </p>
                        </div>
                        <div className="py-4 text-slate-300">
                            {playerIsFormateur ? (
                                <p className="font-bold text-indigo-400">You are the Formateur! The future of Belgium rests on your negotiating skills. You must now secure a coalition agreement.</p>
                            ) : (
                                <p>{formateurName} is now leading the difficult negotiations to form a governing coalition. Expect intense discussions on policy and ministerial portfolios.</p>
                            )}
                        </div>
                        <div className="flex justify-end mt-6">
                            {playerIsFormateur && <button onClick={handleFormateurAccept} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors">Begin Negotiations</button>}
                            {!playerIsFormateur && <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold transition-colors">Monitor Negotiations</button>}
                        </div>
                    </>
                );
            case 'negotiating':
                if (!playerIsFormateur) {
                    return (
                        <div className="p-8 text-center text-slate-500">
                            The Formateur is currently negotiating. You await their proposal.
                            <button onClick={onClose} className="mt-4 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold transition-colors">Close</button>
                        </div>
                    );
                }
                return (
                    <CoalitionInterface
                        gameState={gameState}
                        onTogglePartner={onTogglePartner}
                        onFormGovernment={handleSubmitGovernmentProposal}
                    />
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="p-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
