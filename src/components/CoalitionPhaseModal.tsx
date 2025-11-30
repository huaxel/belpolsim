import React, { useState } from 'react';
import type { GameState, PartyId, Stance, Politician } from '../types';
import { CoalitionInterface } from './CoalitionInterface'; // Import the negotiation UI
import { Button } from './ui/Button'; // Assuming a generic Button component exists
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/Dialog'; // Assuming a generic Dialog component exists

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
        // In a real game, the King would consult and then appoint an informateur.
        // For now, we'll simulate a random appointment or a pre-defined one.
        const largestPartyId = Object.values(parties).sort((a, b) => b.totalSeats - a.totalSeats)[0].id;
        setInformateurParty(largestPartyId);
        setStage('informateur');
    };

    const handleInformateurReport = () => {
        // Informateur reports back to the King, who then appoints a Formateur.
        // For simplicity, let's say the informateur suggests the same party leader as formateur.
        setFormateurParty(informateurParty);
        setStage('formateur');
    };

    const handleFormateurAccept = () => {
        setStage('negotiating');
    };

    // Placeholder data for ministers, will need a proper UI later
    const placeholderMinisters: Politician[] = [
        // Example: Two ministers from player's party
        { id: 'playerMin1', name: 'Player Minister 1', partyId: playerPartyId, language: 'dutch', constituency: 'antwerp', charisma: 5, expertise: 5, popularity: 50, isElected: true, ministerialRole: 'Finance' },
        { id: 'playerMin2', name: 'Player Minister 2', partyId: playerPartyId, language: 'french', constituency: 'brussels_capital', charisma: 5, expertise: 5, popularity: 50, isElected: true, ministerialRole: 'Foreign Affairs' },
        // ... add more as needed for other partners, ensuring parity
    ];

    const handleSubmitGovernmentProposal = (proposal: { partners: PartyId[], policyStances: Stance[], ministriesOffered: number }) => {
        // Integrate the real proposal data here
        onProposeGovernment({
            ...proposal,
            ministers: placeholderMinisters, // Placeholder
            primeMinister: playerIsFormateur ? placeholderMinisters[0] : null, // Placeholder
        });
    };

    const renderContent = () => {
        switch (stage) {
            case 'king_consults':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>The King Consults</DialogTitle>
                            <DialogDescription>
                                Following the election results, His Majesty the King is consulting with all party leaders to assess potential coalition options.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 text-gray-700">
                            The political landscape is fragmented. No single party holds a majority. The stability of the nation depends on successful coalition negotiations.
                        </div>
                        <DialogFooter>
                            <Button onClick={handleKingConsults}>Continue</Button>
                        </DialogFooter>
                    </>
                );
            case 'informateur':
                const informateurName = informateurParty ? parties[informateurParty]?.name : 'an unknown figure';
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Appointment of the Informateur</DialogTitle>
                            <DialogDescription>
                                His Majesty the King has appointed {informateurName} as the Informateur. Their task is to explore viable coalition options.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 text-gray-700">
                            {playerIsInformateur ? (
                                <p>You have been tasked with probing the political waters. Who could realistically form a government together?</p>
                            ) : (
                                <p>{informateurName} is currently conducting their preliminary talks. Political observers are eagerly awaiting their report.</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button onClick={handleInformateurReport}>Continue</Button>
                        </DialogFooter>
                    </>
                );
            case 'formateur':
                const formateurName = formateurParty ? parties[formateurParty]?.name : 'an unknown figure';
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Appointment of the Formateur</DialogTitle>
                            <DialogDescription>
                                Based on the Informateur's report, the King has appointed {formateurName} as the Formateur. Their critical task is to formally build the new government.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 text-gray-700">
                            {playerIsFormateur ? (
                                <p className="font-bold text-indigo-700">You are the Formateur! The future of Belgium rests on your negotiating skills. You must now secure a coalition agreement.</p>
                            ) : (
                                <p>{formateurName} is now leading the difficult negotiations to form a governing coalition. Expect intense discussions on policy and ministerial portfolios.</p>
                            )}
                        </div>
                        <DialogFooter>
                            {playerIsFormateur && <Button onClick={handleFormateurAccept}>Begin Negotiations</Button>}
                            {!playerIsFormateur && <Button onClick={onClose}>Monitor Negotiations</Button>}
                        </DialogFooter>
                    </>
                );
            case 'negotiating':
                if (!playerIsFormateur) {
                    return (
                        <div className="p-8 text-center text-gray-500">
                            The Formateur is currently negotiating. You await their proposal.
                            <Button onClick={onClose} className="mt-4">Close</Button>
                        </div>
                    );
                }
                return (
                    <CoalitionInterface
                        gameState={gameState}
                        onTogglePartner={onTogglePartner}
                        onProposeGovernment={handleSubmitGovernmentProposal}
                    />
                );
        }
    };

    return (
        <Dialog open={gameState.isCoalitionPhase} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                {renderContent()}
            </DialogContent>
        </Dialog>
    );
};
