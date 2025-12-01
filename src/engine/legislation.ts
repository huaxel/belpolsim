/**
 * Legislative Engine
 * 
 * Handles the logic for proposing, voting on, and passing bills in Parliament.
 */

import type { GameState, Bill, PartyId } from '../types';

export interface VoteResult {
    yes: number;
    no: number;
    abstain: number;
    passed: boolean;
    details: Record<PartyId, 'yes' | 'no' | 'abstain'>;
}

/**
 * Calculates how parliament votes on a specific bill
 * 
 * Logic:
 * 1. Coalition partners generally vote YES (unless bill is extreme).
 * 2. Opposition votes based on ideological proximity to the bill's target position.
 * 3. Simple majority (>50% of votes cast) required to pass.
 */
export const calculateVote = (bill: Bill, state: GameState): VoteResult => {
    const { parliament, parties, government } = state;
    const voteDetails: Record<PartyId, 'yes' | 'no' | 'abstain'> = {} as any;

    let yesVotes = 0;
    let noVotes = 0;
    let abstainVotes = 0;

    // Iterate through all parties to determine their stance
    Object.values(parties).forEach(party => {
        let vote: 'yes' | 'no' | 'abstain' = 'abstain';

        // Check if party is in government
        const isInCoalition = government?.partners.includes(party.id);

        // Find party's stance on the issue
        const stance = party.stances.find(s => s.issueId === bill.issueId);
        const partyPosition = stance ? stance.position : 50; // Default to center if no stance
        const distance = Math.abs(partyPosition - bill.targetPosition);

        if (isInCoalition) {
            // Coalition partners support the government unless the bill is wildly against their principles
            // Threshold: If distance > 40, they might rebel (future feature: rebellion logic)
            // For v0.1.1, we assume strict party discipline for coalition
            vote = 'yes';
        } else {
            // Opposition logic
            // If the bill is close to their position (within 15 points), they might support it
            if (distance < 15) {
                vote = 'yes';
            } else if (distance > 25) {
                vote = 'no';
            } else {
                vote = 'abstain';
            }
        }

        voteDetails[party.id] = vote;
    });

    // Tally votes based on seats
    parliament.seats.forEach(seat => {
        const vote = voteDetails[seat.partyId];
        if (vote === 'yes') yesVotes++;
        else if (vote === 'no') noVotes++;
        else abstainVotes++;
    });

    // Simple majority of votes cast (ignoring abstentions for now, or just > 75 seats?)
    // In Belgium, it's majority of votes cast, provided quorum. 
    // For simplicity v0.1.1: Majority of total seats (76)
    const passed = yesVotes >= 76;

    return {
        yes: yesVotes,
        no: noVotes,
        abstain: abstainVotes,
        passed,
        details: voteDetails
    };
};

/**
 * Applies the effects of a passed bill to the game state
 */
export const applyBillEffects = (bill: Bill, state: GameState): GameState => {
    // 1. Update Public Approval (Simplified)
    // If the bill moves policy towards the "popular" center (50), approval goes up?
    // Or maybe based on the player's constituency?
    // For v0.1.1: Random small fluctuation + bonus for passing laws
    const approvalChange = 2;

    // 2. Update Government Stability
    // Passing laws demonstrates competence
    const stabilityChange = 5;

    // 3. Update National Budget (Placeholder)
    // If issue is 'taxation' and target > 50, revenue increases
    let budgetImpact = 0;
    if (bill.issueId === 'taxation') {
        budgetImpact = (bill.targetPosition - 50) * 100; // Arbitrary formula
    }

    return {
        ...state,
        publicApproval: Math.min(100, Math.max(0, state.publicApproval + approvalChange)),
        government: state.government ? {
            ...state.government,
            stability: Math.min(100, Math.max(0, state.government.stability + stabilityChange))
        } : null,
        nationalBudget: {
            ...state.nationalBudget,
            revenue: state.nationalBudget.revenue + budgetImpact
        },
        eventLog: [
            `Bill passed: ${bill.issueId} set to ${bill.targetPosition}.`,
            ...state.eventLog
        ]
    };
};
