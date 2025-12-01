/**
 * Constituency Importance Calculator
 * 
 * Determines which constituencies are most important for the player's campaign
 * based on:
 * - Close races (within 3% polling margin)
 * - Strategic value for coalition building
 * - Seat allocation potential
 */

import type { GameState, ConstituencyId, PartyId } from '../types';
import { CONSTITUENCIES } from '../constants';

export type ConstituencyImportance = 'critical' | 'competitive' | 'safe' | 'lost';

export interface ConstituencyAnalysis {
    constituencyId: ConstituencyId;
    importance: ConstituencyImportance;
    playerPolling: number;
    leadingOpponent: PartyId;
    leadingOpponentPolling: number;
    margin: number; // Positive if player leads, negative if behind
    projectedSeats: number; // Seats player would win in this constituency
}

/**
 * Calculate importance of each constituency for the player
 */
export const analyzeConstituencies = (state: GameState): ConstituencyAnalysis[] => {
    const cIds = Object.keys(CONSTITUENCIES) as ConstituencyId[];
    const partyIds = Object.keys(state.parties) as PartyId[];
    const opponents = partyIds.filter(id => id !== 'player');

    return cIds.map(cId => {
        const playerPolling = state.parties.player.constituencyPolling[cId];

        // Find leading opponent
        let leadingOpponent = opponents[0];
        let leadingOpponentPolling = state.parties[leadingOpponent].constituencyPolling[cId];

        for (const opponentId of opponents) {
            const opponentPolling = state.parties[opponentId].constituencyPolling[cId];
            if (opponentPolling > leadingOpponentPolling) {
                leadingOpponent = opponentId;
                leadingOpponentPolling = opponentPolling;
            }
        }

        const margin = playerPolling - leadingOpponentPolling;

        // Simple seat projection for this constituency (player's share)
        // In reality this would use D'Hondt, but for importance we can approximate
        const totalSeats = CONSTITUENCIES[cId].seats;
        const projectedSeats = Math.floor((playerPolling / 100) * totalSeats);

        // Determine importance
        let importance: ConstituencyImportance;
        const absMargin = Math.abs(margin);

        if (absMargin <= 3) {
            // Within 3% - critical swing constituency
            importance = 'critical';
        } else if (absMargin <= 8) {
            // Within 8% - competitive, winnable
            importance = 'competitive';
        } else if (margin > 8) {
            // Leading by more than 8% - safe
            importance = 'safe';
        } else {
            // Behind by more than 8% - likely lost
            importance = 'lost';
        }

        return {
            constituencyId: cId,
            importance,
            playerPolling,
            leadingOpponent,
            leadingOpponentPolling,
            margin,
            projectedSeats
        };
    });
};

/**
 * Get constituencies that need the most attention
 */
export const getCriticalConstituencies = (state: GameState): ConstituencyAnalysis[] => {
    const analysis = analyzeConstituencies(state);
    return analysis
        .filter(a => a.importance === 'critical' || a.importance === 'competitive')
        .sort((a, b) => {
            // Sort by importance first, then by margin (closest races first)
            if (a.importance === 'critical' && b.importance !== 'critical') return -1;
            if (b.importance === 'critical' && a.importance !== 'critical') return 1;
            return Math.abs(a.margin) - Math.abs(b.margin);
        });
};

/**
 * Get color class for constituency based on importance
 */
export const getConstituencyColor = (importance: ConstituencyImportance): string => {
    switch (importance) {
        case 'critical':
            return 'border-red-500 bg-red-900/20'; // Red border for critical
        case 'competitive':
            return 'border-yellow-500 bg-yellow-900/20'; // Yellow for competitive
        case 'safe':
            return 'border-green-500 bg-green-900/20'; // Green for safe
        case 'lost':
            return 'border-gray-600 bg-gray-900/20'; // Gray for lost
    }
};

/**
 * Get icon for constituency importance
 */
export const getConstituencyIcon = (importance: ConstituencyImportance): string => {
    switch (importance) {
        case 'critical':
            return '🔥'; // Fire for critical
        case 'competitive':
            return '⚔️'; // Swords for competitive
        case 'safe':
            return '✅'; // Check for safe
        case 'lost':
            return '❌'; // X for lost
    }
};
