import type { GameState, PartyId, Law, Stance } from '../types';

interface CoalitionOfferEvaluation {
    accepted: boolean;
    reason: string;
    score: number;
}

/**
 * Evaluates a coalition offer from the perspective of an AI party.
 * @param partyId The ID of the party evaluating the offer.
 * @param state The current game state.
 * @param proposal The proposed coalition details (partners, ministries, policy concessions).
 * @returns An evaluation object with acceptance status and reasoning.
 */
export const evaluateCoalitionOffer = (
    partyId: PartyId,
    state: GameState,
    proposal: { partners: PartyId[], ministerialDistribution: Record<PartyId, number>, policyStances: Stance[] }
): CoalitionOfferEvaluation => {
    const party = state.parties[partyId];
    if (!party) return { accepted: false, reason: "Party not found", score: 0 };

    // 1. Friction Score (Ideological Distance)
    let totalMismatch = 0;
    let issuesCompared = 0;

    proposal.policyStances.forEach(proposedStance => {
        const partyStance = party.stances.find(s => s.issueId === proposedStance.issueId);
        if (partyStance) {
            totalMismatch += Math.abs(partyStance.position - proposedStance.position);
            issuesCompared++;
        }
    });

    // Normalize mismatch: Average mismatch per issue (0-100)
    const avgMismatch = issuesCompared > 0 ? totalMismatch / issuesCompared : 0;
    const policyScore = Math.max(0, 100 - avgMismatch);

    // 2. Power Score (Ministries)
    // How many ministries are we getting vs our seat share?
    const totalSeats = Object.values(state.parties).reduce((sum, p) => sum + p.totalSeats, 0);
    const coalitionSeats = proposal.partners.reduce((sum, pid) => sum + state.parties[pid].totalSeats, 0);
    const ourSeats = party.totalSeats;
    const ourSeatShareInCoalition = ourSeats / coalitionSeats;

    const totalMinistries = Object.values(proposal.ministerialDistribution).reduce((sum, val) => sum + val, 0);
    const ourMinistries = proposal.ministerialDistribution[partyId] || 0;
    const ourMinistryShare = totalMinistries > 0 ? ourMinistries / totalMinistries : 0;

    // If we get our fair share or more, that's good.
    // Score: 100 if we get exactly proportional representation. >100 if we get more.
    const powerScore = (ourMinistryShare / ourSeatShareInCoalition) * 100;

    // 3. Strategic Considerations (Thresholds)
    // Base threshold from party data
    const baseThreshold = party.negotiationThreshold || 50;

    // Final Weighted Score
    // Policy is usually more important than power for ideological parties, but let's balance them.
    // 60% Policy, 40% Power.
    const finalScore = (policyScore * 0.6) + (powerScore * 0.4);

    let accepted = finalScore >= baseThreshold;
    let reason = "";

    if (accepted) {
        reason = "The proposal is acceptable to our members.";
        if (powerScore > 120) reason = "We are very pleased with the ministry allocation.";
    } else {
        if (policyScore < 40) reason = "The policy compromises are too great.";
        else if (powerScore < 80) reason = "We require more ministerial representation.";
        else reason = "The overall deal does not meet our requirements.";
    }

    return { accepted, reason, score: finalScore };
};

/**
 * Decides how an AI party votes on a specific law.
 * @param partyId The ID of the party voting.
 * @param state The current game state.
 * @param law The law being voted on.
 * @returns 'FOR', 'AGAINST', or 'ABSTAIN'
 */
export const decideVote = (
    partyId: PartyId,
    state: GameState,
    law: Law
): 'FOR' | 'AGAINST' | 'ABSTAIN' => {
    const party = state.parties[partyId];
    if (!party) return 'ABSTAIN';

    // 1. Government Discipline
    // If the party is in government, they usually vote FOR government bills (unless it's a conscience vote).
    // Assuming all proposed laws are "Government Bills" for now.
    const isInGovernment = state.government?.partners.includes(partyId);

    if (isInGovernment) {
        // High chance to support, but check for extreme ideological violation
        // Check if the law's effects violently contradict party stances?
        // For MVP, government parties always support to maintain stability.
        return 'FOR';
    }

    // 2. Ideological Alignment
    // Check the law's effects against party stances.
    // This is tricky because Law effects are functions.
    // We need to look at the 'description' or metadata if available.
    // For now, let's simulate based on a hidden 'ideology' tag or random for MVP if not fully modeled.

    // BETTER APPROACH: Use the law's ID or name to infer stance.
    // Or, check if the law matches a stance issue.
    // Since Law doesn't strictly map to Stance, we'll use a simple heuristic:
    // Random vote based on "Opposition" role.

    // Opposition usually opposes, but might support popular things.
    // Let's make it 70% AGAINST, 20% FOR, 10% ABSTAIN for now.
    const roll = Math.random();
    if (roll < 0.7) return 'AGAINST';
    if (roll < 0.9) return 'FOR';
    return 'ABSTAIN';
};
