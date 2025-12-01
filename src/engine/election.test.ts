import { describe, it, expect } from 'vitest';
import { createInitialState } from './state';
import { calculateElection } from './election';

describe('calculateElection', () => {
    it('should calculate the election results correctly', () => {
        const initialState = createInitialState();
        const finalState = calculateElection(initialState);
        expect(finalState.gamePhase).toBe('consultation');
        expect(finalState.parties.player.totalSeats).toBeGreaterThan(0);
        expect(finalState.parliament.seats.length).toBe(150);
    });
});
