import { describe, it, expect } from 'vitest';
import { createInitialState, generatePoliticians } from './state';

describe('State Generation', () => {
    describe('createInitialState', () => {
        it('should create a valid initial game state', () => {
            const state = createInitialState();

            expect(state).toBeDefined();
            expect(state.gamePhase).toBe('campaign');
            expect(state.turn).toBe(1);

            // Check parties
            expect(Object.keys(state.parties).length).toBeGreaterThan(0);
            expect(state.parties.player).toBeDefined();

            // Check issues
            expect(Object.keys(state.issues).length).toBeGreaterThan(0);

            // Check parliament
            expect(state.parliament.seats).toHaveLength(0); // Should be empty initially
        });

        it('should initialize player party correctly', () => {
            const state = createInitialState();
            const playerParty = state.parties.player;

            expect(playerParty.name).toBe('Ecolo-Groen (You)'); // Assuming default player party name from state.ts
            // Party does not have budget/energy, GameState does
            expect(state.budget).toBeGreaterThan(0);
            expect(state.energy).toBeGreaterThan(0);
        });
    });

    describe('generatePoliticians', () => {
        it('should generate the correct number of politicians', () => {
            const count = 5;
            const politicians = generatePoliticians('player', 'antwerp', count, 'dutch');

            expect(politicians).toHaveLength(count);
        });

        it('should generate politicians with valid attributes', () => {
            const politicians = generatePoliticians('player', 'antwerp', 1, 'dutch');
            const politician = politicians[0];

            expect(politician.id).toBeDefined();
            expect(politician.name).toBeDefined();
            expect(politician.partyId).toBe('player');
            expect(politician.constituency).toBe('antwerp');
            expect(politician.charisma).toBeGreaterThanOrEqual(1);
            expect(politician.charisma).toBeLessThanOrEqual(10);
            expect(politician.expertise).toBeGreaterThanOrEqual(1);
            expect(politician.expertise).toBeLessThanOrEqual(10);
        });
    });
});
