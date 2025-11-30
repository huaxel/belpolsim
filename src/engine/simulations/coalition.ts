import type { Party, Stance, PartyId } from '../../types';

/**
 * @private
 * Calculates the ideological friction for a single party against a given policy proposal.
 * This is the core mathematical model for negotiation.
 * @param party The party to calculate friction for.
 * @param proposal The proposed set of stances from the government agreement.
 * @returns A normalized friction score, where a higher number means more disagreement.
 */
const calculateFrictionForParty = (party: Party, proposal: Stance[]): number => {
    let totalFriction = 0;
    let totalSalience = 0;

    proposal.forEach(proposedStance => {
        const partyStance = party.stances.find(s => s.issueId === proposedStance.issueId);

        if (partyStance) {
            const positionDifference = Math.abs(proposedStance.position - partyStance.position);
            // The friction for an issue is the difference in position, weighted by how much the party cares (salience).
            const weightedFriction = positionDifference * partyStance.salience;
            
            totalFriction += weightedFriction;
            totalSalience += partyStance.salience;
        }
    });

    // If the party has no opinion on any of the proposed issues, there is no friction.
    if (totalSalience === 0) {
        return 0;
    }

    // Normalize the friction score. The maximum possible friction is totalSalience * 100 (max position difference).
    // This gives us a score roughly between 0 and 100.
    const normalizedFriction = (totalFriction / (totalSalience * 100)) * 100;

    return normalizedFriction;
};

/**
 * Calculates the ideological friction for all parties against a proposed government agreement.
 * This is the main entry point to be called by the game's reducer.
 * @param parties A record of all parties in the game.
 * @param proposal The proposed set of stances for the new government.
 * @returns A Map where keys are PartyIds and values are their friction scores.
 */
export const calculateAllFrictions = (parties: Record<PartyId, Party>, proposal: Stance[]): Map<PartyId, number> => {
    const frictionMap = new Map<PartyId, number>();

    for (const partyId in parties) {
        const party = parties[partyId as PartyId];
        const score = calculateFrictionForParty(party, proposal);
        frictionMap.set(party.id, score);
    }

    return frictionMap;
};

/*
================================================================================
== GAME THEORY NOTE (From the Logic Engineer)
================================================================================
This friction algorithm models coalition negotiation as a multi-dimensional
cost-benefit analysis. A political party cannot get everything it wants; it
must compromise. This model quantifies the "cost" of that compromise.

- The 'position' difference (0-100) represents how far a party must move from
  its ideal policy on a given issue. A large difference is a large compromise.

- The 'salience' (0-10) represents how much a party's voters and members care
  about that issue. Compromising on a high-salience issue is politically
  far more costly than compromising on a low-salience one.

- The `totalFriction` is therefore a sum of all the compromises a party must
  make, weighted by the political cost of each compromise.

A high friction score signifies a "bad deal" for a party, where the ideological
cost is likely too high for their base to accept. The AI will use this score
to make a rational choice: accept a deal with low friction, or reject one
with high friction. This creates a strategic challenge for the player, who must
find a policy balance that is acceptable to a majority of potential partners.
================================================================================
*/
