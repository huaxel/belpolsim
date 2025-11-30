import type { Party } from '../types';

/**
 * A simple AI model to decide whether a party will join a coalition.
 * @param party The party making the decision.
 * @param frictionScore The calculated ideological friction for this party.
 * @returns A boolean indicating whether the party accepts the proposal.
 */
export const decideToJoinCoalition = (party: Party, frictionScore: number): boolean => {
    // As the Logic Engineer, I propose to the Systems Architect that we add
    // a `negotiationThreshold` property to the `Party` type. This would allow
    // for more varied AI personalities. For example, a pragmatic party might have
    // a threshold of 60, while an ideologically rigid party might have a
    // threshold of 35.
    // For now, I will use a hard-coded constant.
    const negotiationThreshold = 50;

    // The AI makes a rational choice: if the political "cost" (friction) is
    // higher than their tolerance for compromise, they will reject the deal.
    return frictionScore < negotiationThreshold;
};
