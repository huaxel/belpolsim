import { describe, it, expect } from 'vitest';
import { createScenarioState } from './factories';

describe('Scenario Factory', () => {
    it('should create a scenario with the correct player party', () => {
        const state = createScenarioState({ playerPartyId: 'socialist' });

        expect(state.globals.playerParty).toBe('party:socialist');
        expect(state.globals.currentPhase).toBe('campaign');
        expect(state.entities).toContain('party:socialist');
        expect(state.entities).toContain('party:liberal');
        expect(state.entities).toContain('party:green');
        expect(state.entities).toContain('party:far_right');
    });

    it('should apply traits to the created parties', () => {
        const state = createScenarioState({ playerPartyId: 'socialist' });
        const socialistId = 'party:socialist';

        const platform = state.components.partyPlatform[socialistId];
        expect(platform.traits).toBeDefined();
        expect(platform.traits?.length).toBeGreaterThan(0);
        expect(platform.traits?.[0].id).toBe('pillar');
    });

    it('should create leaders for each party', () => {
        const state = createScenarioState({ playerPartyId: 'liberal' });

        // Check for politicians with isLeader tag
        const leaders = state.entities.filter(id =>
            id.startsWith('politician:') &&
            state.components.identity[id].tags?.includes('leader')
        );

        expect(leaders.length).toBe(6); // 6 parties in the preset
    });
});
