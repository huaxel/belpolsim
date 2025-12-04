/**
 * Legislative System - Hybrid ECS Implementation
 * 
 * Handles the legislative process:
 * - Bill proposal
 * - Voting logic (Ideology vs Coalition Loyalty)
 * - Bill resolution and effects
 */

import type {
    GameState,
    GamePhase,
    GameAction,
    ActionResult,
    EntityId,
    EntityType,
    BillData,
} from '../types';
import { ActionSystem } from '../System';
import {
    createEntityId,
} from '../types';
import {
    getAllParties,
    getPartyIssuePosition,
    areCoalitionPartners,
    getPartySeats,
    getTotalSeats,
    getIdentity,
} from '../queries';

// ============================================================================
// LEGISLATIVE ACTIONS
// ============================================================================

export type LegislativeActionType = 'proposeBill' | 'voteOnBill';

export interface ProposeBillAction extends GameAction {
    type: 'proposeBill';
    issueId: EntityId;
    stance: number; // -100 to 100 (Left/Right or Against/For)
}

export interface VoteOnBillAction extends GameAction {
    type: 'voteOnBill';
    billId: EntityId;
}

// ============================================================================
// SYSTEM IMPLEMENTATION
// ============================================================================

export class LegislativeSystem extends ActionSystem {
    readonly name = 'LegislativeSystem';
    protected readonly activePhases: GamePhase[] = ['governing'];

    /**
     * Main processing - could handle automated voting sessions or timeouts
     */
    protected process(state: GameState): GameState {
        // For now, legislation is driven by actions, not automatic ticks
        return state;
    }

    /**
     * Get available actions
     */
    public getAvailableActions(_state: GameState, _actor: EntityId): GameAction[] {
        // TODO: Implement availability logic (e.g., can only propose if in government)
        return [];
    }

    /**
     * Execute legislative actions
     */
    protected executeAction(state: GameState, action: GameAction): ActionResult {
        switch (action.type) {
            case 'proposeBill':
                return this.proposeBill(state, action as ProposeBillAction);
            case 'voteOnBill':
                return this.voteOnBill(state, action as VoteOnBillAction);
            default:
                return {
                    success: false,
                    newState: state,
                    events: [],
                    error: `Unknown legislative action: ${action.type}`,
                };
        }
    }

    /**
     * Propose a new bill
     */
    private proposeBill(state: GameState, action: ProposeBillAction): ActionResult {
        const { actor, issueId, stance } = action;
        const issueName = getIdentity(state, issueId)?.name || 'Unknown Issue';

        // Create Bill Entity
        const billId = createEntityId('bill', `bill-${state.globals.currentTurn}-${Date.now()}`);
        const billData: BillData = {
            title: `${issueName} Reform`,
            description: `A proposal regarding ${issueName} with a stance of ${stance}.`,
            status: 'vote', // Skip committee for MVP
            sponsor: actor,
            relatedIssues: [issueId],
            votes: { for: [], against: [], abstain: [] },
            voteBreakdown: {},
        };

        // Add to state
        const newState = {
            ...state,
            entities: [...state.entities, billId],
            components: {
                ...state.components,
                identity: {
                    ...state.components.identity,
                    [billId]: {
                        name: billData.title,
                        type: 'bill' as EntityType,
                    }
                },
                billData: {
                    ...state.components.billData,
                    [billId]: billData,
                },
            },
        };

        return {
            success: true,
            newState,
            events: [{
                id: `event:proposal-${billId}`,
                type: 'legislation',
                turn: state.globals.currentTurn,
                title: 'Bill Proposed',
                description: `${getIdentity(state, actor)?.name} proposed ${billData.title}.`,
                effects: [],
                resolved: true,
            }],
            message: 'Bill proposed successfully.',
        };
    }

    /**
     * Conduct a vote on a bill
     */
    private voteOnBill(state: GameState, action: VoteOnBillAction): ActionResult {
        const { billId } = action;
        const bill = state.components.billData[billId];
        if (!bill) return { success: false, newState: state, events: [], error: 'Bill not found' };

        let newState = state;
        const votes = { for: [] as EntityId[], against: [] as EntityId[], abstain: [] as EntityId[] };
        const voteBreakdown: Record<EntityId, 'for' | 'against' | 'abstain'> = {};

        const parties = getAllParties(state);

        // Calculate votes for each party
        for (const partyId of parties) {
            const vote = this.calculatePartyVote(state, partyId, bill);
            votes[vote].push(partyId);
            voteBreakdown[partyId] = vote;
        }

        // Tally seats
        const seatsFor = votes.for.reduce((sum, pid) => sum + getPartySeats(state, pid), 0);
        const seatsAgainst = votes.against.reduce((sum, pid) => sum + getPartySeats(state, pid), 0);
        const totalSeats = getTotalSeats(state);

        const passed = seatsFor > (totalSeats / 2); // Simple majority

        // Update Bill Status
        const updatedBill: BillData = {
            ...bill,
            status: passed ? 'passed' : 'rejected',
            votes,
            voteBreakdown,
        };

        newState = {
            ...newState,
            components: {
                ...newState.components,
                billData: {
                    ...newState.components.billData,
                    [billId]: updatedBill,
                },
            },
        };

        // Apply Effects (Stability, Polling)
        // TODO: Implement detailed effects based on who rebelled

        return {
            success: true,
            newState,
            events: [{
                id: `event:vote-${billId}`,
                type: 'legislation',
                turn: state.globals.currentTurn,
                title: passed ? 'Bill Passed' : 'Bill Rejected',
                description: `${bill.title} was ${passed ? 'passed' : 'rejected'} by parliament (${seatsFor} vs ${seatsAgainst}).`,
                effects: [],
                resolved: true,
            }],
            message: `Vote complete. Bill ${passed ? 'passed' : 'failed'}.`,
        };
    }

    /**
     * Calculate how a party votes on a bill
     */
    private calculatePartyVote(state: GameState, partyId: EntityId, bill: BillData): 'for' | 'against' | 'abstain' {
        // 1. Ideological Match
        // We need to know the "Stance" of the bill. For MVP, let's assume we store it or derive it.
        // Hack: Parse stance from description or store it in BillData (we should add it to BillData properly later)
        // For now, let's assume the bill has a 'stance' property if we cast it, or we rely on the issue.

        // Let's assume the bill reflects the sponsor's position on the issue.
        const issueId = bill.relatedIssues[0];
        const sponsorPosition = getPartyIssuePosition(state, bill.sponsor, issueId) ?? 0;
        const partyPosition = getPartyIssuePosition(state, partyId, issueId) ?? 0;

        const distance = Math.abs(sponsorPosition - partyPosition);
        const ideologicalScore = 100 - distance; // 100 = perfect match, 0 = opposite

        // 2. Coalition Loyalty
        const isCoalition = areCoalitionPartners(state, partyId, bill.sponsor) || partyId === bill.sponsor;
        const loyaltyBonus = isCoalition ? 50 : 0; // Huge bonus for coalition

        // 3. Final Score
        const totalScore = ideologicalScore + loyaltyBonus;

        // Thresholds
        if (totalScore > 60) return 'for';
        if (totalScore < 40) return 'against';
        return 'abstain';
    }
}

export const legislativeSystem = new LegislativeSystem();
