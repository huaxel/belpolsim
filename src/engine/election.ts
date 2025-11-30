import { CONSTITUENCIES, ELECTORAL_THRESHOLD, MAJORITY_SEATS } from "../constants";
import type { GameState, PartyId, ConstituencyId, Candidate } from "../types";

export const calculateElection = (state: GameState): GameState => {
    const parties = { ...state.parties };
    const partyIds = Object.keys(parties) as PartyId[];
    const cIds = Object.keys(CONSTITUENCIES) as ConstituencyId[];

    partyIds.forEach(id => {
        parties[id].totalSeats = 0;
        cIds.forEach(c => parties[id].constituencySeats[c] = 0);
    });

    cIds.forEach(c => {
        const seatsToAlloc = CONSTITUENCIES[c].seats;
        const eligible = partyIds.filter(id => {
            const isEligibleRegion = parties[id].eligibleConstituencies.includes(c);
            const meetsThreshold = parties[id].constituencyPolling[c] >= ELECTORAL_THRESHOLD;
            return isEligibleRegion && meetsThreshold;
        });

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

    partyIds.forEach(id => {
        let sum = 0;
        cIds.forEach(c => {
            const seats = parties[id].constituencySeats[c];
            sum += seats;
            (parties[id].candidates as Record<ConstituencyId, Candidate[]>)[c].forEach((cand: Candidate, idx: number) => {
                if (idx < seats) cand.isElected = true;
            });
        });
        parties[id].totalSeats = sum;
    });

    const playerSeats = parties.player.totalSeats;
    const hasMajority = playerSeats >= MAJORITY_SEATS;

    return {
        ...state,
        isGameOver: hasMajority,
        isCoalitionPhase: !hasMajority,
        parties: parties,
        eventLog: [...state.eventLog, `ELECTION OVER! You won ${playerSeats} seats. Majority needed: ${MAJORITY_SEATS}.`]
    };
}
