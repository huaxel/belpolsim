import { MAJORITY_SEATS } from '../constants';
import type { GameState, PartyId, Politician } from '../types';

interface GovernmentProposal {
    partners: PartyId[];
    ministers: Politician[];
    primeMinister: Politician;
}

/**
 * Validates a proposed government against the core rules of the Belgian political system.
 * @param proposal The proposed government, including coalition partners and ministers.
 * @param gameState The current state of the game, used to access party data.
 * @returns An object containing a boolean `isValid` and a `reason` for failure.
 */
export const validateGovernment = (
    proposal: GovernmentProposal,
    gameState: GameState
): { isValid: boolean; reason: string } => {

    // 1. Majority Check: The coalition must have at least 76 of the 150 seats.
    const totalSeats = proposal.partners.reduce((sum, id) => {
        return sum + (gameState.parties[id]?.totalSeats || 0);
    }, 0);

    if (totalSeats < MAJORITY_SEATS) {
        return { isValid: false, reason: `Not enough seats for a majority. Requires ${MAJORITY_SEATS}, has ${totalSeats}.` };
    }

    // 2. Cordon Sanitaire Check: No extremist parties allowed in government.
    for (const partyId of proposal.partners) {
        if (gameState.parties[partyId]?.isExtremist) {
            return { isValid: false, reason: `Cordon Sanitaire: Cannot form a government with ${gameState.parties[partyId].name}.` };
        }
    }

    // 3. Cabinet Parity Check: Equal numbers of Dutch and French-speaking ministers.
    // The Prime Minister is excluded from this count.
    const ministers = proposal.ministers;
    const dutchSpeakingMinisters = ministers.filter(m => m.language === 'dutch').length;
    const frenchSpeakingMinisters = ministers.filter(m => m.language === 'french').length;

    if (dutchSpeakingMinisters !== frenchSpeakingMinisters) {
        return { isValid: false, reason: `Cabinet Parity not respected. Dutch-speaking ministers: ${dutchSpeakingMinisters}, French-speaking ministers: ${frenchSpeakingMinisters}.` };
    }

    // If all checks pass, the government is valid.
    return { isValid: true, reason: "Government is valid." };
};
