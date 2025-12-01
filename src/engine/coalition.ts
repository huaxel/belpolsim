import type { GameState, PartyId, Stance, Politician, ActionResult } from '../types';

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

    // --- Real Minister Assignment Logic ---
    const ministers: Politician[] = [];

    // We need to pick actual politicians to be ministers.
    // For MVP, we'll just pick the first N politicians from the party's lists.
    Object.entries(proposalPayload.ministriesOffered).forEach(([partyId, count]) => {
        const party = state.parties[partyId as PartyId];
        let assignedCount = 0;

        // Iterate through constituencies to find politicians
        for (const constituencyId of party.eligibleConstituencies) {
            const politicians = party.politicians[constituencyId];
            for (const politician of politicians) {
                if (assignedCount < count) {
                    ministers.push(politician);
                    assignedCount++;
                } else {
                    break;
                }
            }
            if (assignedCount >= count) break;
        }
    });

    const proposal = {
        partners: proposalPayload.partners,
        ministers: ministers,
        primeMinister: { language: 'dutch' } // Placeholder, needs UI selection
    };

    // Validate using the shared validation logic
    const validation = validateGovernment(proposal as any, state);

    if (validation.isValid) {
        const total = proposal.partners.reduce((sum, id) => sum + state.parties[id].totalSeats, 0);
        const message = `GOVERNMENT FORMED with ${total} seats! Entering Governing Phase.`;

        return {
            newState: {
                ...state,
                gamePhase: 'governing',
                government: {
                    partners: proposalPayload.partners,
                    primeMinister: null, // To be implemented
                    ministers: ministers,
                    agreement: proposalPayload.policyStances,
                    stability: 100 // Start with high stability
                },
                nationalBudget: 10000, // Initial national budget
                eventLog: [...state.eventLog, message]
            },
            success: true,
            message
        };
    } else {
        return { newState: state, success: false, message: validation.reason };
    }
};
