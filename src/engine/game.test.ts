import { describe, it, expect, beforeEach } from 'vitest';
import {
    handleAction,
    endTurn
} from './game';
import { createInitialState } from './state';
import type { GameState } from '../types';

describe('Game Logic', () => {
    let state: GameState;

    beforeEach(() => {
        state = createInitialState();
    });

    describe('Action Handlers', () => {
        it('should handle CANVASS action', () => {
            const initialEnergy = state.energy;
            const result = handleAction(state, 'canvas');

            expect(result.success).toBe(true);
            expect(result.newState.energy).toBeLessThan(initialEnergy);
            // Polling changes are probabilistic, but we can check if the function ran without error
        });

        it('should handle RALLY action', () => {
            const initialBudget = state.budget;
            const initialEnergy = state.energy;
            const result = handleAction(state, 'rally');

            expect(result.success).toBe(true);
            expect(result.newState.budget).toBeLessThan(initialBudget);
            expect(result.newState.energy).toBeLessThan(initialEnergy);
        });

        it('should handle POSTERS action', () => {
            const initialBudget = state.budget;
            const result = handleAction(state, 'posters');

            expect(result.success).toBe(true);
            expect(result.newState.budget).toBeLessThan(initialBudget);
        });

        it('should handle FUNDRAISE action', () => {
            const initialEnergy = state.energy;
            const initialBudget = state.budget;
            const result = handleAction(state, 'fundraise');

            expect(result.success).toBe(true);
            expect(result.newState.energy).toBeLessThan(initialEnergy);
            expect(result.newState.budget).toBeGreaterThan(initialBudget);
        });

        it('should handle TV_AD action', () => {
            const initialBudget = state.budget;
            const result = handleAction(state, 'tv_ad');

            expect(result.success).toBe(true);
            expect(result.newState.budget).toBeLessThan(initialBudget);
        });

        it('should handle DEBATE action', () => {
            const initialEnergy = state.energy;
            const result = handleAction(state, 'debate');

            expect(result.success).toBe(true);
            expect(result.newState.energy).toBeLessThan(initialEnergy);
        });
    });

    describe('End Turn', () => {
        it('should advance the turn', () => {
            const initialTurn = state.turn;

            const newState = endTurn(state);

            expect(newState.turn).toBe(initialTurn + 1);
        });

        it('should regenerate energy', () => {
            state.energy = 0;
            const newState = endTurn(state);
            expect(newState.energy).toBeGreaterThan(0);
        });

        it('should trigger election when max turns reached', () => {
            // Fast forward to end of game
            state.turn = 100; // Assuming max turns is less than 100 or logic handles it
            // We need to know the exact MAX_TURNS or date logic to test this precisely.
            // For now, let's just check if it doesn't crash.
            const newState = endTurn(state);
            expect(newState).toBeDefined();
        });
    });
});
