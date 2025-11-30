import { MAJORITY_SEATS } from '../constants';
import type { GameState, PartyId, ActionResult } from '../types';

export const toggleCoalitionPartner = (state: GameState, partnerId: PartyId): ActionResult => {
    const partner = state.parties[partnerId];

    if (partner.isExtremist) {
        const message = `CORDON SANITAIRE: Cannot ally with ${partner.name}.`;
        return { newState: state, success: false, message };
    }

    // Obsolete demand/redLine logic has been removed.
    // The new Friction system will handle coalition compatibility.

    const current = state.coalitionPartners;
    const isPartner = current.includes(partnerId);

    const newCoalitionPartners = isPartner
        ? current.filter(id => id !== partnerId)
        : [...current, partnerId];

    const message = isPartner
        ? `${partner.name} removed from coalition talks.`
        : `${partner.name} added to coalition talks.`;

    return {
        newState: {
            ...state,
            coalitionPartners: newCoalitionPartners
        },
        success: true,
        message
    };
};

import { validateGovernment } from './government';

export const formGovernment = (
    state: GameState,
    proposalPayload: {
        partners: PartyId[],
        policyStances: any[],
        ministriesOffered: Record<PartyId, number>
    }
): ActionResult => {

    // Construct the proposal object for validation
    // Note: In a full implementation, we would assign specific ministers here based on the count in ministriesOffered.
    // For now, we create dummy ministers to satisfy the type checker if needed, or just rely on the count logic in validation.
    // The current validation logic checks for `ministers` array length for parity.

    // Let's simulate minister assignment for parity check:
    // We need to know the language of the ministers.
    // We'll assume for now that parties provide ministers of their own language region.
    // This is a simplification.

    const simulatedMinisters: any[] = [];

    Object.entries(proposalPayload.ministriesOffered).forEach(([partyId, count]) => {
        const party = state.parties[partyId as PartyId];
        // Determine language based on first eligible constituency region (heuristic)
        const region = state.parties[partyId as PartyId].eligibleConstituencies[0];
        // Simple heuristic: if Flanders -> Dutch, else French. (Brussels is complex, but this will do for MVP)
        const language = (region === 'antwerp' || region === 'east_flanders' || region === 'west_flanders' || region === 'limburg' || region === 'flemish_brabant') ? 'dutch' : 'french';

        for (let i = 0; i < count; i++) {
            simulatedMinisters.push({ language });
        }
    });

    const proposal = {
        partners: proposalPayload.partners,
        ministers: simulatedMinisters, // Passed to validation
        primeMinister: { language: 'dutch' } // Placeholder, needs UI selection
    };

    // Validate using the shared validation logic
    // We cast simulatedMinisters to any because the validator expects full Politician objects, 
    // but currently only checks .language property.
    const validation = validateGovernment(proposal as any, state);

    if (validation.isValid) {
        const total = proposal.partners.reduce((sum, id) => sum + state.parties[id].totalSeats, 0);
        const message = `GOVERNMENT FORMED with ${total} seats!`;
        return {
            newState: {
                ...state,
                isGameOver: true,
                isCoalitionPhase: false,
                eventLog: [...state.eventLog, message]
            },
            success: true,
            message
        };
    } else {
        return { newState: state, success: false, message: validation.reason };
    }
};
