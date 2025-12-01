/**
 * Election Calculation Module
 * 
 * Handles the calculation of election results using the D'Hondt method
 * (proportional representation system used in Belgium).
 * 
 * Key responsibilities:
 * - Allocate seats to parties based on polling percentages
 * - Mark politicians as elected based on list position
 * - Populate the 150-seat Federal Parliament
 * - Transition game phase to coalition_formation or governing
 */

import { CONSTITUENCIES, ELECTORAL_THRESHOLD, MAJORITY_SEATS } from "../constants";
import type { GameState, PartyId, ConstituencyId, Politician } from "../types";

/**
 * Calculates election results across all constituencies
 * 
 * This function:
 * 1. Resets all seat counts to zero
 * 2. Allocates seats in each constituency using D'Hondt method
 * 3. Marks top politicians as elected based on internal clout (list position)
 * 4. Collects all 150 elected politicians into parliament
 * 5. Determines if player won majority (≥76 seats)
 * 6. Sets game phase accordingly
 * 
 * @param state - Current game state with polling data
 * @returns Updated game state with election results and populated parliament
 */
export const calculateElection = (state: GameState): GameState => {
    // Deep copy parties to avoid mutating the previous state
    const parties = JSON.parse(JSON.stringify(state.parties));
    const partyIds = Object.keys(parties) as PartyId[];
    const cIds = Object.keys(CONSTITUENCIES) as ConstituencyId[];

    // Reset all seat counts
    partyIds.forEach(id => {
        parties[id].totalSeats = 0;
        cIds.forEach(c => parties[id].constituencySeats[c] = 0);
    });

    // Allocate seats in each constituency using D'Hondt method
    cIds.forEach(c => {
        const seatsToAlloc = CONSTITUENCIES[c].seats;
        const eligible = partyIds.filter(id => {
            const isEligibleRegion = parties[id].eligibleConstituencies.includes(c);
            const meetsThreshold = parties[id].constituencyPolling[c] >= ELECTORAL_THRESHOLD;
            return isEligibleRegion && meetsThreshold;
        });

        // D'Hondt allocation: repeatedly award seats to party with highest quotient
        for (let i = 0; i < seatsToAlloc; i++) {
            let maxQ = -1;
            let winner: PartyId | null = null;
            for (const id of eligible) {
                const q = parties[id].constituencyPolling[c] / (parties[id].constituencySeats[c] + 1);
                if (q > maxQ) {
                    maxQ = q;
                    winner = id;
                }
            }
            if (winner) parties[winner].constituencySeats[c]++;
        }
    });

    // Collect all elected politicians for parliament (150 total)
    const allElectedPoliticians: Politician[] = [];

    partyIds.forEach(id => {
        let sum = 0;
        cIds.forEach(c => {
            const seats = parties[id].constituencySeats[c];
            sum += seats;
            // Mark top N politicians as elected (sorted by internal clout)
            (parties[id].politicians as Record<ConstituencyId, Politician[]>)[c].forEach((politician: Politician, idx: number) => {
                if (idx < seats) {
                    politician.isElected = true;
                    allElectedPoliticians.push(politician);
                }
            });
        });
        parties[id].totalSeats = sum;
    });

    const playerSeats = parties.player.totalSeats;
    const hasMajority = playerSeats >= MAJORITY_SEATS;

    return {
        ...state,
        gamePhase: hasMajority ? 'governing' : 'consultation',
        parties: parties,
        parliament: { seats: allElectedPoliticians },
        eventLog: [...state.eventLog, `ELECTION OVER! You won ${playerSeats} seats. Majority needed: ${MAJORITY_SEATS}.`]
    };
}
