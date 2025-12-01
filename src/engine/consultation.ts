/**
 * Consultation & Formation Logic
 * 
 * Handles the post-election phases:
 * 1. King's Consultation: Appointing an Informateur.
 * 2. Informateur's Mission: Finding a viable coalition.
 */

import type { GameState, PartyId, Party, IssueId } from '../types';

/**
 * Determines the Informateur based on election results.
 * Usually the leader of the largest party.
 */
export const determineInformateur = (state: GameState): PartyId => {
    const parties = Object.values(state.parties);
    // Sort by seats (descending)
    const sorted = parties.sort((a, b) => b.totalSeats - a.totalSeats);

    // In Belgium, the King usually picks the winner.
    // If the winner is extremist (cordon sanitaire), he might pick the second largest.
    for (const party of sorted) {
        if (!party.isExtremist) {
            return party.id;
        }
    }

    // Fallback (unlikely in game logic unless all are extremist)
    return sorted[0].id;
};

/**
 * Calculates the "Friction Score" between two parties.
 * Lower is better. 0 = Perfect alignment. 100 = Total opposite.
 * 
 * Formula: Weighted average of stance differences.
 */
export const calculateFriction = (partyA: Party, partyB: Party): number => {
    let totalDiff = 0;
    let totalWeight = 0;

    // Compare all issues where both have a stance
    const issuesA = partyA.stances;
    const issuesB = partyB.stances;

    // Create a map for faster lookup
    const mapB = new Map(issuesB.map(s => [s.issueId, s]));

    for (const stanceA of issuesA) {
        const stanceB = mapB.get(stanceA.issueId);
        if (stanceB) {
            const diff = Math.abs(stanceA.position - stanceB.position); // 0-100
            const weight = (stanceA.salience + stanceB.salience) / 2; // 0-10

            totalDiff += diff * weight;
            totalWeight += weight;
        }
    }

    if (totalWeight === 0) return 0; // No common issues

    return totalDiff / totalWeight;
};

/**
 * Calculates the friction between a coalition of parties.
 * Returns the maximum friction found between any pair of partners.
 */
export const calculateCoalitionFriction = (state: GameState, partners: PartyId[]): number => {
    if (partners.length < 2) return 0;

    let maxFriction = 0;

    for (let i = 0; i < partners.length; i++) {
        for (let j = i + 1; j < partners.length; j++) {
            const pA = state.parties[partners[i]];
            const pB = state.parties[partners[j]];
            const friction = calculateFriction(pA, pB);
            if (friction > maxFriction) {
                maxFriction = friction;
            }
        }
    }

    return maxFriction;
};

/**
 * Calculates the "Policy Distance" for a specific issue in a coalition agreement.
 * Used to determine how much a party is compromising.
 */
export const calculatePolicyCompromise = (party: Party, issueId: IssueId, agreedPosition: number): number => {
    const stance = party.stances.find(s => s.issueId === issueId);
    if (!stance) return 0; // Party doesn't care

    const diff = Math.abs(stance.position - agreedPosition);
    // Weighted by salience: High salience makes compromise more painful
    return diff * (stance.salience / 5);
};
