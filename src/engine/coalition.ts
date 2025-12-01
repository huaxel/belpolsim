/**
 * Coalition Formation Module
 * 
 * Handles coalition partner selection and government formation.
 * Enforces Belgian political rules:
 * - Cordon Sanitaire: No coalitions with extremist parties
 * - Cabinet Parity: Equal Dutch/French-speaking ministers
 * - Majority requirement: Coalition must have ≥76 seats
 */

import type { GameState, PartyId, Politician, ActionResult, Stance } from '../types';
import { validateGovernment } from './government';

/**
 * Toggles a party's inclusion in coalition negotiations
 * 
 * Rules enforced:
 * - Cannot add extremist parties (Cordon Sanitaire)
 * - Can freely add/remove non-extremist parties
 * 
 * @param state - Current game state
 * @param partnerId - Party to add/remove from coalition
 * @returns Updated state with modified coalition partners list
 */
export const toggleCoalitionPartner = (state: GameState, partnerId: PartyId): ActionResult => {
    const partner = state.parties[partnerId];

    // Enforce Cordon Sanitaire
    if (partner.isExtremist) {
        const message = `CORDON SANITAIRE: Cannot ally with ${partner.name}.`;
        return { newState: state, success: false, message };
    }

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

/**
 * Attempts to form a government with the selected coalition partners
 * 
 * Process:
 * 1. Validates coalition has majority (≥76 seats)
 * 2. Assigns ministers from coalition parties
 * 3. Validates Cabinet Parity (equal Dutch/French ministers)
 * 4. If valid, transitions to 'governing' phase
 * 
 * @param state - Current game state
 * @param proposalPayload - Coalition details including partners, policy stances, and ministry distribution
 * @returns Updated state with formed government or error message
 */
export const formGovernment = (
    state: GameState,
    proposalPayload: {
        partners: PartyId[],
        policyStances: Stance[],
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

    // --- Minister Assignment Logic ---
    // Select politicians from each party to serve as ministers
    // based on the number of ministries offered to that party
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

    // Mock Prime Minister for now (needs to be a full Politician object)
    // We'll just pick the first minister as PM for now, or create a dummy one if empty
    const primeMinister: Politician = ministers.length > 0 ? ministers[0] : {
        id: 'mock-pm',
        name: 'Mock PM',
        partyId: 'player', // Default
        constituency: 'antwerp', // Default
        language: 'dutch',
        listPosition: 1,
        popularity: 50,
        expertise: 5,
        internalClout: 50,
        isElected: true,
        originalListPosition: 1,
        ministerialRole: null,
        charisma: 5
    };

    const proposal = {
        partners: proposalPayload.partners,
        ministers: ministers,
        primeMinister: primeMinister
    };

    // Validate using the shared validation logic
    const validation = validateGovernment(proposal, state);

    if (validation.isValid) {
        const total = proposal.partners.reduce((sum, id) => sum + state.parties[id].totalSeats, 0);
        const message = `GOVERNMENT FORMED with ${total} seats! Entering Governing Phase.`;

        return {
            newState: {
                ...state,
                gamePhase: 'governing',
                government: {
                    partners: proposalPayload.partners,
                    primeMinister: primeMinister, // To be implemented
                    ministers: ministers,
                    agreement: {
                        policyCompromises: proposalPayload.policyStances,
                        ministerialDistribution: proposalPayload.ministriesOffered
                    },
                    stability: 100 // Start with high stability
                },
                eventLog: [...state.eventLog, message]
            },
            success: true,
            message
        };
    } else {
        return { newState: state, success: false, message: validation.reason };
    }
};
