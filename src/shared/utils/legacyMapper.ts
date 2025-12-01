import type { GameState } from '@/core';
import {
    getAllParties,
    getAllConstituencies,
    getPartyPoliticians,
    getPartySeats
} from '@/core';

export const mapECSToLegacyState = (gameState: GameState): any => {
    const parties: Record<string, any> = {};
    const constituencies: Record<string, any> = {};

    // Map Constituencies
    const constituencyIds = getAllConstituencies(gameState);
    constituencyIds.forEach(id => {
        const identity = gameState.components.identity[id];
        const data = gameState.components.constituencyData[id];

        if (identity && data) {
            constituencies[id] = {
                id: id,
                name: identity.name,
                ...data,
                // Ensure demographics exist (should be handled by factory, but safe fallback)
                demographics: data.demographics || {
                    youth: 0.25, retirees: 0.25, workers: 0.3, upper_class: 0.2
                }
            };
        }
    });

    // Map Parties
    const partyIds = getAllParties(gameState);
    partyIds.forEach(partyId => {
        const identity = gameState.components.identity[partyId];
        const stats = gameState.components.stats[partyId];

        if (!identity || !stats) return;

        // Map politicians for this party
        const politicianIds = getPartyPoliticians(gameState, partyId);
        const politiciansByConstituency: Record<string, any[]> = {};

        politicianIds.forEach(polId => {
            const polIdentity = gameState.components.identity[polId];
            const polStats = gameState.components.stats[polId];
            const polRelations = gameState.components.relations[polId];

            if (!polIdentity || !polStats || !polRelations) return;

            const constId = polRelations.representedConstituency;

            const polData = {
                id: polId,
                name: polIdentity.name,
                charisma: polStats.charisma || 50,
                competence: polStats.competence || 50,
                loyalty: polStats.loyalty || 50,
                ambition: polStats.ambition || 50,
                popularity: polStats.popularity || 50,
                isLeader: polIdentity.tags?.includes('leader')
            };

            if (constId) {
                if (!politiciansByConstituency[constId]) politiciansByConstituency[constId] = [];
                politiciansByConstituency[constId].push(polData);
            } else {
                // Fallback: add to all constituencies if no specific constituency assigned
                constituencyIds.forEach(cId => {
                    if (!politiciansByConstituency[cId]) politiciansByConstituency[cId] = [];
                    politiciansByConstituency[cId].push(polData);
                });
            }
        });

        // Ensure campaignStats exist for all constituencies
        const campaignStats: Record<string, any> = {};
        constituencyIds.forEach(cId => {
            const existing = stats.campaignStats?.[cId];
            campaignStats[cId] = existing || {
                awareness: 10, // Default values to avoid 0/undefined issues
                favorability: 50,
                enthusiasm: 50
            };
        });

        parties[partyId] = {
            id: partyId,
            name: identity.name,
            color: identity.color || '#000000',
            seats: getPartySeats(gameState, partyId),
            totalSeats: getPartySeats(gameState, partyId), // Legacy used totalSeats
            campaignStats,
            politicians: politiciansByConstituency,
            constituencyPolling: stats.constituencyPolling || {},
            stances: [], // TODO: Map platform positions to stances if needed
            autoCampaign: gameState.globals.autoCampaign && partyId === gameState.globals.playerParty ? {
                isEnabled: true,
                budgetLimit: 0,
                priorities: { critical: false, competitive: false, safe: false },
                regions: {}
            } : undefined
        };
    });

    return {
        ...gameState,
        parties,
        constituencies, // Add this so CampaignDashboard can use it
        budget: gameState.components.resources[gameState.globals.playerParty]?.money || 0,
        playerPartyId: gameState.globals.playerParty,
        turn: gameState.globals.currentTurn,
        maxTurns: 30, // Default max turns
        eventLog: [], // TODO: Map events
        isGameActive: true, // Assume active if state exists
        selectedConstituency: gameState.globals.selectedConstituency || 'brussels' // Default to brussels if not set
    };
};
