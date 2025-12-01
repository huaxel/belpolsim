import { describe, it, expect } from 'vitest';
import { calculateBudgetImpact, resolveCrisis, voteOnLegislation, checkGovernmentStability, generateCrisis } from './governing';
import { createInitialState } from './state';
import type { GameState, Law, Crisis } from '../types';

describe('Governing Logic', () => {
    it('should calculate budget impact correctly', () => {
        const state = createInitialState();
        state.nationalBudget = {
            revenue: 100,
            expenses: 100,
            debt: 500,
            deficit: 0,
            lastYearGrowth: 2.0
        };
        state.laws = [
            {
                id: 'law1',
                name: 'Tax Hike',
                description: 'Raises taxes',
                effects: { budgetImpact: 10, popularityImpact: -5, stabilityImpact: -2 },
                status: 'passed'
            }
        ];

        const newBudget = calculateBudgetImpact(state);

        // Revenue should increase by growth (2%) + law impact (10)
        // 100 * 1.02 = 102 + 10 = 112
        expect(newBudget.revenue).toBeCloseTo(112);

        // Expenses should increase by inflation (2%)
        // 100 * 1.02 = 102
        expect(newBudget.expenses).toBeCloseTo(102);

        // Deficit = Revenue - Expenses = 112 - 102 = 10
        expect(newBudget.deficit).toBeCloseTo(10);

        // Debt should decrease by deficit (surplus)
        // 500 - 10 = 490
        expect(newBudget.debt).toBeCloseTo(490);
    });

    it('should resolve crisis correctly', () => {
        const state = createInitialState();
        const crisis: Crisis = {
            id: 'crisis1',
            title: 'Test Crisis',
            description: 'Test',
            severity: 'medium',
            active: true,
            turnsRemaining: 1,
            choices: [
                {
                    text: 'Fix it',
                    description: 'Fixes it',
                    effect: (s) => ({ publicApproval: 100 })
                }
            ]
        };
        state.crises = [crisis];

        const result = resolveCrisis(state, 'crisis1', 0);

        expect(result.success).toBe(true);
        expect(result.newState.crises.length).toBe(0);
        expect(result.newState.publicApproval).toBe(100);
    });

    it('should vote on legislation', () => {
        const state = createInitialState();
        // Mock government with player party
        state.government = {
            partners: ['player'],
            primeMinister: null,
            ministers: [],
            agreement: { policyCompromises: [], ministerialDistribution: {} as any },
            stability: 50
        };
        // Player party has seats (initialized in state)
        state.parties['player'].totalSeats = 50;
        // Need to ensure other parties don't outvote. 
        // Total seats is 150. If player has 50, need others to be < 50 or split.
        // But in `createInitialState`, seats are 0 until election.
        // So let's mock seats.
        state.parties['player'].totalSeats = 80; // Majority

        const law: Law = {
            id: 'law1',
            name: 'Test Law',
            description: 'Test',
            effects: { budgetImpact: 0, popularityImpact: 10, stabilityImpact: 5 },
            status: 'proposed'
        };

        const result = voteOnLegislation(state, law);

        expect(result.success).toBe(true);
        expect(result.message).toContain('passed');
        expect(result.newState.laws[0].status).toBe('passed');
        expect(result.newState.publicApproval).toBeGreaterThan(50); // Started at 50, +10
    });

    it('should check government stability', () => {
        const state = createInitialState();
        state.government = {
            partners: ['player'],
            primeMinister: null,
            ministers: [],
            agreement: { policyCompromises: [], ministerialDistribution: {} as any },
            stability: 0
        };

        const check = checkGovernmentStability(state);
        expect(check.collapsed).toBe(true);
    });
});
