import { describe, it, expect, beforeEach } from 'vitest';
import { legislativeSystem } from './legislative';
import {
    GameState,
    EntityId,
    PartyPlatform,
    Relations,
    EntityType,
} from '../types';

// Mock State Helper
const createMockState = (): GameState => ({
    entities: [],
    components: {
        identity: {},
        stats: {},
        resources: {},
        relations: {},
        partyPlatform: {},
        constituencyData: {},
        issueData: {},
        billData: {},
    },
    globals: {
        turn: 1,
        currentTurn: 1,
        currentYear: 2024,
        gamePhase: 'governing',
        currentPhase: 'governing',
        playerParty: 'party-1',
        currentCoalition: {
            parties: ['party-1', 'party-2'],
            primeMinister: 'pol-1',
            formationDate: 1,
            policyCompromises: {},
            portfolioAllocation: {},
            frictionLevel: 0,
            stabilityScore: 100,
            governmentStability: 80,
        },
        election: {
            results: {},
            history: [],
            nextElectionTurn: 10,
        },
        autoCampaign: false,
        selectedConstituency: '',
    },
});

describe('LegislativeSystem', () => {
    let state: GameState;

    beforeEach(() => {
        state = createMockState();

        // Setup Issue
        state.entities.push('issue-1');
        state.components.identity['issue-1'] = { name: 'Tax Reform', type: 'issue' as EntityType };

        // Setup Parties
        // Party 1: Proponent (Sponsor) - Position 100
        state.entities.push('party-1');
        state.components.identity['party-1'] = { name: 'Party A', type: 'party' as EntityType };
        state.components.partyPlatform['party-1'] = {
            positions: { 'issue-1': 100 },
            priorityIssues: [],
        } as PartyPlatform;
        state.components.resources['party-1'] = { money: 1000, influence: 100 };
        state.components.stats['party-1'] = { seats: 50 };

        // Party 2: Coalition Partner - Position 50 (Neutral/Slightly For)
        state.entities.push('party-2');
        state.components.identity['party-2'] = { name: 'Party B', type: 'party' as EntityType };
        state.components.partyPlatform['party-2'] = {
            positions: { 'issue-1': 50 },
            priorityIssues: [],
        } as PartyPlatform;
        state.components.resources['party-2'] = { money: 1000, influence: 100 };
        state.components.stats['party-2'] = { seats: 30 };

        // Party 3: Opposition - Position -100 (Against)
        state.entities.push('party-3');
        state.components.identity['party-3'] = { name: 'Party C', type: 'party' as EntityType };
        state.components.partyPlatform['party-3'] = {
            positions: { 'issue-1': -100 },
            priorityIssues: [],
        } as PartyPlatform;
        state.components.resources['party-3'] = { money: 1000, influence: 100 };
        state.components.stats['party-3'] = { seats: 40 };

        // Total Seats: 120. Majority: 61.
        // Setup Constituency for Seats
        state.entities.push('constituency-1');
        state.components.identity['constituency-1'] = { name: 'Brussels', type: 'constituency' as EntityType };
        state.components.constituencyData['constituency-1'] = {
            seats: 120,
            region: 'brussels',
            language: 'bilingual',
            population: 1000000,
        } as any;
    });

    it('should propose a bill correctly', () => {
        const action = {
            type: 'proposeBill',
            actor: 'party-1',
            issueId: 'issue-1',
            stance: 100,
        };

        const result = legislativeSystem.processAction(state, action as any);

        expect(result.success).toBe(true);
        expect(result.events).toHaveLength(1);
        expect(result.events[0].title).toBe('Bill Proposed');

        // Check if bill entity was created
        const billId = result.newState.entities.find(id => id.startsWith('bill:'));
        expect(billId).toBeDefined();

        const bill = result.newState.components.billData[billId!];
        expect(bill).toBeDefined();
        expect(bill.title).toContain('Tax Reform');
        expect(bill.sponsor).toBe('party-1');
        expect(bill.status).toBe('vote');
    });

    it('should pass a bill with coalition support', () => {
        // 1. Propose
        let result = legislativeSystem.processAction(state, {
            type: 'proposeBill',
            actor: 'party-1',
            issueId: 'issue-1',
            stance: 100,
        } as any);

        const billId = result.newState.entities.find(id => id.startsWith('bill:'))!;
        state = result.newState;

        // 2. Vote
        result = legislativeSystem.processAction(state, {
            type: 'voteOnBill',
            actor: 'party-1',
            billId: billId,
        } as any);

        expect(result.success).toBe(true);
        expect(result.events[0].title).toBe('Bill Passed');

        const updatedBill = result.newState.components.billData[billId];
        expect(updatedBill.status).toBe('passed');

        // Check Breakdown
        // Party 1 (Sponsor): 100 vs 100 -> Dist 0 -> Score 100 + Bonus -> FOR
        // Party 2 (Coalition): 50 vs 100 -> Dist 50 -> Score 50 + 50 (Bonus) = 100 -> FOR
        // Party 3 (Opposition): -100 vs 100 -> Dist 200 -> Score -100 -> AGAINST

        expect(updatedBill.votes?.for).toContain('party-1');
        expect(updatedBill.votes?.for).toContain('party-2');
        expect(updatedBill.votes?.against).toContain('party-3');
    });

    it('should reject a bill if coalition breaks or opposition is too strong', () => {
        // Modify Party 2 to be strongly against
        state.components.partyPlatform['party-2'].positions['issue-1'] = -100;

        // 1. Propose
        let result = legislativeSystem.processAction(state, {
            type: 'proposeBill',
            actor: 'party-1',
            issueId: 'issue-1',
            stance: 100,
        } as any);

        const billId = result.newState.entities.find(id => id.startsWith('bill:'))!;
        state = result.newState;

        // 2. Vote
        result = legislativeSystem.processAction(state, {
            type: 'voteOnBill',
            actor: 'party-1',
            billId: billId,
        } as any);

        const updatedBill = result.newState.components.billData[billId];

        // Party 2: -100 vs 100 -> Dist 200 -> Score -100 + 50 (Bonus) = -50 -> AGAINST
        // Party 1 (50 seats) vs Party 2 (30) + Party 3 (40) = 70 Against.

        expect(updatedBill.status).toBe('rejected');
        expect(updatedBill.votes?.against).toContain('party-2');
    });
});
