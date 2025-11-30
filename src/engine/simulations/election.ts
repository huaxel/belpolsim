import { PartyId } from '../../types';

/**
 * Calculates the number of seats each party wins in a given constituency using the D'Hondt method,
 * respecting an electoral threshold.
 *
 * @param constituencyVotes An object mapping PartyId to their raw vote count in that constituency.
 * @param totalSeats The total number of seats available in the constituency.
 * @param electoralThreshold The percentage (e.g., 0.05 for 5%) a party must reach to be eligible for seats.
 * @returns An object mapping PartyId to the number of seats won.
 */
export function calculateDdHondtSeats(
    constituencyVotes: Record<PartyId, number>,
    totalSeats: number,
    electoralThreshold: number = 0.05 // Default to 5%
): Record<PartyId, number> {
    const seatsWon: Record<PartyId, number> = {};
    const eligibleParties: PartyId[] = [];
    const divisors: Record<PartyId, number> = {};
    const currentQuotients: Record<PartyId, number> = {};

    let totalConstituencyVotes = 0;
    for (const partyId in constituencyVotes) {
        totalConstituencyVotes += constituencyVotes[partyId as PartyId];
    }

    // 1. Filter out parties that do not meet the electoralThreshold
    for (const partyId in constituencyVotes) {
        const votes = constituencyVotes[partyId as PartyId];
        const voteShare = votes / totalConstituencyVotes;

        if (voteShare >= electoralThreshold) {
            eligibleParties.push(partyId as PartyId);
            seatsWon[partyId as PartyId] = 0;
            divisors[partyId as PartyId] = 1;
            currentQuotients[partyId as PartyId] = votes / 1;
        } else {
            seatsWon[partyId as PartyId] = 0; // Parties below threshold get 0 seats
        }
    }

    // If no eligible parties or no seats, return early
    if (eligibleParties.length === 0 || totalSeats === 0) {
        return seatsWon;
    }

    // 2. Allocate seats using the D'Hondt method
    for (let i = 0; i < totalSeats; i++) {
        let winningParty: PartyId | null = null;
        let maxQuotient = -1;

        for (const partyId of eligibleParties) {
            if (currentQuotients[partyId] > maxQuotient) {
                maxQuotient = currentQuotients[partyId];
                winningParty = partyId;
            }
        }

        if (winningParty !== null) {
            seatsWon[winningParty]++;
            divisors[winningParty]++;
            currentQuotients[winningParty] = constituencyVotes[winningParty] / divisors[winningParty];
        } else {
            // This should ideally not happen if totalSeats > 0 and eligibleParties.length > 0
            // but as a safeguard, if no party can win (e.g., all quotients become 0), break.
            break;
        }
    }

    return seatsWon;
}
