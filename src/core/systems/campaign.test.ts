import { describe, it, expect, beforeEach } from 'vitest';
import { CampaignSystem, ACTION_CONFIGS } from './campaign';
import { createScenarioState, createEntityId } from '../index';
import type { GameState, CampaignAction, CampaignActionType } from '../types';

describe('CampaignSystem v0.5.0', () => {
    let state: GameState;
    const system = new CampaignSystem();
    const playerPartyId = 'party:test_party';
    const constituencyId = 'constituency:antwerp';
    const issueId = 'issue:economy';

    beforeEach(() => {
        state = createScenarioState({ playerPartyId: 'socialist' }); // Use any valid ID to start

        // Manually add our test party
        state.entities.push(playerPartyId);
        state.globals.playerParty = playerPartyId;

        // Setup test data
        state.components.partyPlatform[playerPartyId] = {
            positions: { [issueId]: 80 }, // Strong position
            priorityIssues: [issueId]
        };

        state.components.issueData[issueId] = {
            category: 'economic',
            salience: 80,
            volatility: 20,
            polarization: 50
        };

        state.components.constituencyData[constituencyId] = {
            region: 'flanders',
            language: 'dutch',
            seats: 10,
            population: 100000,
            demographics: { youth: 0.2, retirees: 0.2, workers: 0.4, upper_class: 0.2 }
        };

        // Give resources
        state.components.resources[playerPartyId] = {
            money: 100000,
            actionPoints: 5,
            politicalCapital: 50
        };

        // Ensure identity exists (ActionSystem might check it indirectly or for logging)
        state.components.identity[playerPartyId] = {
            name: 'Test Party',
            type: 'party'
        };
    });

    it('should apply constituency-specific effects', () => {
        const action: CampaignAction = {
            type: 'rally',
            actor: playerPartyId,
            constituency: constituencyId
        };

        const result = system.processAction(state, action);
        expect(result.success).toBe(true);

        const stats = result.newState.components.stats[playerPartyId];
        expect(stats.campaignStats?.[constituencyId]).toBeDefined();
        expect(stats.campaignStats?.[constituencyId].enthusiasm).toBeGreaterThan(0);
    });

    it('should apply issue synergy bonus', () => {
        const action: CampaignAction = {
            type: 'policyAnnouncement',
            actor: playerPartyId,
            issue: issueId
        };

        const result = system.processAction(state, action);
        expect(result.success).toBe(true);

        const stats = result.newState.components.stats[playerPartyId];
        // Base momentum for policyAnnouncement is 3. 
        // Bonus: (80/100) * 0.5 = 0.4 (40% boost to nationalPolling)
        // Momentum bonus: +5
        // Total momentum should be 3 + 5 = 8
        expect(stats.momentum).toBe(8);
    });

    it('should generate correct event description for targeted action', () => {
        const action: CampaignAction = {
            type: 'rally',
            actor: playerPartyId,
            constituency: constituencyId,
            issue: issueId
        };

        const result = system.processAction(state, action);
        const event = result.events[0];

        expect(event.description).toContain(constituencyId);
        expect(event.description).toContain(issueId);
    });
});
