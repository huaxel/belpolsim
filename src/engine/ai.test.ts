import { describe, it, expect } from 'vitest';
import { evaluateCoalitionOffer, decideVote } from './ai';
import type { GameState, Party, Law, Stance } from '../types';

describe('AI Logic', () => {
    const mockParty: Party = {
        id: 'nva',
        name: 'N-VA',
        color: 'bg-yellow-500',
        isExtremist: false,
        ideology: { economic: 5, social: 5 },
        stances: [
            { issueId: 'taxation', position: 80, salience: 8 },
            { issueId: 'immigration', position: 70, salience: 9 }
        ],
        eligibleConstituencies: ['antwerp'],
        constituencyPolling: {},
        constituencySeats: {},
        totalSeats: 20,
        politicians: {},
        negotiationThreshold: 50
    };

    const mockState: GameState = {
        parties: {
            'nva': mockParty,
            'player': { ...mockParty, id: 'player', totalSeats: 30 }
        },
        government: {
            partners: ['player'],
            primeMinister: null,
            ministers: [],
            agreement: { policyCompromises: [], ministerialDistribution: {} },
            stability: 50
        }
    } as unknown as GameState;

    describe('evaluateCoalitionOffer', () => {
        it('should accept a good offer (high policy match, fair ministries)', () => {
            const proposal = {
                partners: ['player', 'nva'],
                ministerialDistribution: { 'nva': 4, 'player': 6 }, // 40% ministries, 40% seats (20/50)
                policyStances: [
                    { issueId: 'taxation', position: 80, salience: 5 } // Perfect match
                ] as Stance[]
            };

            const result = evaluateCoalitionOffer('nva', mockState, proposal);
            expect(result.accepted).toBe(true);
            expect(result.score).toBeGreaterThan(50);
        });

        it('should reject a bad offer (poor policy match, low ministries)', () => {
            const proposal = {
                partners: ['player', 'nva'],
                ministerialDistribution: { 'nva': 1, 'player': 9 }, // 10% ministries, 40% seats
                policyStances: [
                    { issueId: 'taxation', position: 10, salience: 5 } // Huge mismatch (80 vs 10)
                ] as Stance[]
            };

            const result = evaluateCoalitionOffer('nva', mockState, proposal);
            expect(result.accepted).toBe(false);
            // It might fail on policy OR ministries, both are bad.
            // Let's check that it is rejected, and reason is not empty.
            expect(result.reason.length).toBeGreaterThan(0);
        });
    });

    describe('decideVote', () => {
        it('should vote FOR if in government', () => {
            const stateInGov = {
                ...mockState,
                government: { partners: ['nva', 'player'] }
            } as unknown as GameState;

            const law: Law = { id: 'test', name: 'Test', description: '', effects: { budgetImpact: 0, popularityImpact: 0, stabilityImpact: 0 }, status: 'proposed' };
            const vote = decideVote('nva', stateInGov, law);
            expect(vote).toBe('FOR');
        });

        it('should vote AGAINST/FOR/ABSTAIN if in opposition (randomized)', () => {
            const stateInOpp = {
                ...mockState,
                government: { partners: ['player'] }
            } as unknown as GameState;

            const law: Law = { id: 'test', name: 'Test', description: '', effects: { budgetImpact: 0, popularityImpact: 0, stabilityImpact: 0 }, status: 'proposed' };
            const vote = decideVote('nva', stateInOpp, law);
            expect(['FOR', 'AGAINST', 'ABSTAIN']).toContain(vote);
        });
    });
});
