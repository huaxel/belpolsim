/**
 * Seat Projection Calculator
 * 
 * Calculates projected seat distribution based on current polling data.
 * Uses the same D'Hondt method as the actual election to provide accurate projections.
 */

import { CONSTITUENCIES, ELECTORAL_THRESHOLD } from '../constants';
import type { GameState, PartyId, ConstituencyId } from '../types';

export interface SeatProjection {
    partyId: PartyId;
    projectedSeats: number;
    constituencyBreakdown: Record<ConstituencyId, number>;
}

/**
 * Calculate projected seats for all parties based on current polling
 * This mirrors the election calculation logic but doesn't modify state
 */
export const calculateSeatProjections = (state: GameState): SeatProjection[] => {
    const partyIds = Object.keys(state.parties) as PartyId[];
    const cIds = Object.keys(CONSTITUENCIES) as ConstituencyId[];

    // Initialize projections
    const projections: Record<PartyId, SeatProjection> = {} as Record<PartyId, SeatProjection>;
    partyIds.forEach(id => {
        projections[id] = {
            partyId: id,
            projectedSeats: 0,
            constituencyBreakdown: {} as Record<ConstituencyId, number>
        };
        cIds.forEach(c => {
            projections[id].constituencyBreakdown[c] = 0;
        });
    });

    // Allocate seats in each constituency using D'Hondt method
    cIds.forEach(c => {
        const seatsToAlloc = CONSTITUENCIES[c].seats;
        const eligible = partyIds.filter(id => {
            const isEligibleRegion = state.parties[id].eligibleConstituencies.includes(c);
            const meetsThreshold = state.parties[id].constituencyPolling[c] >= ELECTORAL_THRESHOLD;
            return isEligibleRegion && meetsThreshold;
        });

        // D'Hondt allocation
        for (let i = 0; i < seatsToAlloc; i++) {
            let maxQ = -1;
            let winner: PartyId | null = null;
            for (const id of eligible) {
                const q = state.parties[id].constituencyPolling[c] / (projections[id].constituencyBreakdown[c] + 1);
                if (q > maxQ) {
                    maxQ = q;
                    winner = id;
                }
            }
            if (winner) {
                projections[winner].constituencyBreakdown[c]++;
            }
        }
    });

    // Sum up total seats
    partyIds.forEach(id => {
        let sum = 0;
        cIds.forEach(c => {
            sum += projections[id].constituencyBreakdown[c];
        });
        projections[id].projectedSeats = sum;
    });

    return Object.values(projections).sort((a, b) => b.projectedSeats - a.projectedSeats);
};

/**
 * Check if player is projected to win majority
 */
export const isProjectedMajority = (state: GameState): boolean => {
    const projections = calculateSeatProjections(state);
    const playerProjection = projections.find(p => p.partyId === state.playerPartyId);
    return (playerProjection?.projectedSeats || 0) >= 76;
};

/**
 * Get coalition possibilities based on projections
 */
export const getCoalitionPossibilities = (state: GameState): string[] => {
    const projections = calculateSeatProjections(state);
    const playerSeats = projections.find(p => p.partyId === state.playerPartyId)?.projectedSeats || 0;

    if (playerSeats >= 76) {
        return ['Majority government possible!'];
    }

    const possibilities: string[] = [];
    const sortedParties = projections.filter(p => p.partyId !== state.playerPartyId && !state.parties[p.partyId].isExtremist);

    // Check two-party coalitions
    for (const partner of sortedParties) {
        if (playerSeats + partner.projectedSeats >= 76) {
            possibilities.push(`Coalition with ${state.parties[partner.partyId].name} (${playerSeats + partner.projectedSeats} seats)`);
        }
    }

    if (possibilities.length === 0) {
        possibilities.push('Multi-party coalition required');
    }

    return possibilities.slice(0, 3); // Show top 3
};
