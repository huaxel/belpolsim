import type { Party } from '../types';

/**
 * A simple AI model to decide whether a party will join a coalition.
 * @param party The party making the decision.
 * @param frictionScore The calculated ideological friction for this party.
 * @returns A boolean indicating whether the party accepts the proposal.
 */
export const decideToJoinCoalition = (party: Party, frictionScore: number): boolean => {
    // Use the party's specific negotiation threshold
    const negotiationThreshold = party.negotiationThreshold || 50;

    // The AI makes a rational choice: if the political "cost" (friction) is
    // higher than their tolerance for compromise, they will reject the deal.
    return frictionScore < negotiationThreshold;
};
