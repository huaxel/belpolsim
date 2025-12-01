/**
 * Campaign Logic Engine
 * 
 * Pure functions for calculating campaign action effects based on:
 * - Demographics (youth, retirees, workers, upper_class)
 * - Media consumption patterns
 * - Cost efficiency (reach vs. impact tradeoff)
 * - Diminishing returns (awareness cap at 80%)
 * - Head of List bonus (charisma multiplier)
 * 
 * Following Logic Engineer guidelines: Pure functions, explain game theory
 */

import type {
    ConstituencyId,
    Constituency,
    CampaignStats,
    Politician,
    DemographicGroup,
    GameState
} from '../types';
import { CONSTITUENCIES } from '../constants';

// ============================================================================
// ACTION TYPES & INTERFACES
// ============================================================================

export type CampaignActionType =
    | 'social_media'
    | 'tv_ad'
    | 'newspaper'
    | 'radio'
    | 'door_to_door'
    | 'rally';

export type CampaignScope = 'constituency' | 'regional' | 'national';

export interface CampaignAction {
    type: CampaignActionType;
    budget: number;
    scope: CampaignScope;
    targetConstituency?: ConstituencyId; // For constituency scope
    targetRegion?: import('../types').RegionId; // For regional scope
    targetDemographic?: DemographicGroup; // Optional targeting
}

export interface CampaignEffect {
    awarenessChange: number;      // Change in awareness (0-100)
    favorabilityChange: number;   // Change in favorability (0-100)
    enthusiasmChange: number;     // Change in enthusiasm (0-100)
    costPerVote: number;          // Estimated cost per vote gained
    estimatedReach: number;       // Number of voters affected (0-1 as fraction)
}

// ============================================================================
// GAME THEORY CONSTANTS
// ============================================================================

/**
 * Demographic Multipliers
 * 
 * Game Theory: Different demographics consume different media
 * - Youth: High social media, low newspaper/TV
 * - Retirees: High TV/newspaper, low social media
 * - Workers: Balanced, prefer radio
 * - Upper class: Newspaper, moderate TV
 */
const DEMOGRAPHIC_MULTIPLIERS: Record<CampaignActionType, Record<DemographicGroup, number>> = {
    social_media: {
        youth: 1.5,        // Youth are very responsive to social media
        retirees: 0.2,     // Retirees barely use it
        workers: 0.8,      // Workers use it moderately
        upper_class: 1.0   // Upper class uses it normally
    },
    newspaper: {
        youth: 0.3,        // Youth don't read newspapers
        retirees: 1.5,     // Retirees love newspapers
        workers: 0.7,      // Workers read occasionally
        upper_class: 1.2   // Upper class reads regularly
    },
    tv_ad: {
        youth: 0.8,        // Youth watch less TV
        retirees: 1.3,     // Retirees watch lots of TV
        workers: 1.0,      // Workers watch normally
        upper_class: 1.1   // Upper class watches moderately
    },
    radio: {
        youth: 0.4,        // Youth don't listen to radio
        retirees: 1.2,     // Retirees listen regularly
        workers: 1.1,      // Workers listen during commute
        upper_class: 0.8   // Upper class listens less
    },
    door_to_door: {
        youth: 1.0,        // Everyone equally receptive in person
        retirees: 1.0,
        workers: 1.2,      // Workers appreciate personal touch
        upper_class: 0.6   // Upper class less accessible
    },
    rally: {
        youth: 1.2,        // Youth like events
        retirees: 0.8,     // Retirees less mobile
        workers: 1.1,      // Workers attend if convenient
        upper_class: 0.7   // Upper class less interested
    }
};

/**
 * Cost Efficiency Parameters
 * 
 * Game Theory: Expensive actions have broad reach but low per-person impact
 * - TV: Very expensive, reaches everyone, low impact per person
 * - Door-to-door: Free, tiny reach, very high impact per person
 * - Social media: Cheap, targeted reach, good impact
 */
const ACTION_COSTS = {
    tv_ad: {
        baseCost: 5000,
        reach: 1.0,      // Reaches entire constituency
        impact: 0.3      // Low impact per person (passive viewing)
    },
    social_media: {
        baseCost: 1000,
        reach: 0.4,      // Reaches 40% of constituency
        impact: 0.6      // Medium impact (targeted, interactive)
    },
    newspaper: {
        baseCost: 2000,
        reach: 0.5,      // Reaches 50% of constituency
        impact: 0.4      // Medium-low impact (passive reading)
    },
    radio: {
        baseCost: 1500,
        reach: 0.6,      // Reaches 60% of constituency
        impact: 0.5      // Medium impact (audio, repetition)
    },
    door_to_door: {
        baseCost: 0,     // Free! (just energy cost)
        reach: 0.1,      // Only reaches 10% of constituency
        impact: 1.0      // Very high impact (personal connection)
    },
    rally: {
        baseCost: 1200,
        reach: 0.3,      // Reaches 30% of constituency
        impact: 0.8      // High impact (emotional, in-person)
    }
};

// ============================================================================
// PURE FUNCTIONS
// ============================================================================

/**
 * Calculate awareness multiplier with diminishing returns
 * 
 * Game Theory: After 80% awareness, it's hard to find people who don't know you
 * - Below 80%: Full effectiveness
 * - Above 80%: Linear decay to 0% at 100%
 */
export const calculateAwarenessMultiplier = (currentAwareness: number): number => {
    if (currentAwareness < 80) {
        return 1.0;
    }
    // Linear decay: at 80% = 1.0, at 100% = 0.0
    return 1.0 - ((currentAwareness - 80) / 20);
};

/**
 * Calculate Head of List bonus
 * 
 * Game Theory (Belgian-specific): Charismatic leaders multiply campaign effectiveness
 * - Charisma 5 (average): 1.0x multiplier
 * - Charisma 10 (max): 1.5x multiplier
 * - Charisma 0 (min): 0.5x multiplier
 */
export const calculateCharismaBonus = (leadCandidate?: Politician): number => {
    if (!leadCandidate) return 1.0;
    return 1.0 + ((leadCandidate.charisma - 5) / 10);
};

/**
 * Calculate weighted demographic effect
 * 
 * Combines constituency demographics with action multipliers
 */
export const calculateDemographicEffect = (
    actionType: CampaignActionType,
    constituency: Constituency,
    targetDemographic?: DemographicGroup
): number => {
    const multipliers = DEMOGRAPHIC_MULTIPLIERS[actionType];

    if (targetDemographic) {
        // Targeted campaign: 2x effect on target group, 0.5x on others
        const targetEffect = multipliers[targetDemographic] * 2.0;

        // Calculate weighted average
        let totalEffect = 0;
        let totalWeight = 0;

        (Object.keys(constituency.demographics) as DemographicGroup[]).forEach(demo => {
            const weight = constituency.demographics[demo];
            const effect = demo === targetDemographic
                ? targetEffect
                : multipliers[demo] * 0.5;
            totalEffect += weight * effect;
            totalWeight += weight;
        });

        return totalEffect / totalWeight;
    } else {
        // Broad campaign: weighted average across all demographics
        let totalEffect = 0;
        let totalWeight = 0;

        (Object.keys(constituency.demographics) as DemographicGroup[]).forEach(demo => {
            const weight = constituency.demographics[demo];
            const effect = multipliers[demo];
            totalEffect += weight * effect;
            totalWeight += weight;
        });

        return totalEffect / totalWeight;
    }
};

/**
 * Main campaign effect calculator
 * 
 * Pure function that takes action + current state and returns predicted effect
 * 
 * Game Theory:
 * 1. Awareness has diminishing returns (hard to reach last 20%)
 * 2. Demographics matter (youth vs retirees consume different media)
 * 3. Cost efficiency (expensive ≠ effective)
 * 4. Charismatic leaders multiply effectiveness
 */
export const calculateCampaignEffect = (
    action: CampaignAction,
    currentStats: CampaignStats,
    constituency: Constituency,
    leadCandidate?: Politician
): CampaignEffect => {
    const actionParams = ACTION_COSTS[action.type];

    // 1. Base effect from action parameters
    const baseReach = actionParams.reach;
    const baseImpact = actionParams.impact;

    // 2. Awareness multiplier (diminishing returns)
    const awarenessMultiplier = calculateAwarenessMultiplier(currentStats.awareness);

    // 3. Demographic effect
    const demographicEffect = calculateDemographicEffect(
        action.type,
        constituency,
        action.targetDemographic
    );

    // 4. Head of List bonus (Belgian-specific)
    const charismaBonus = calculateCharismaBonus(leadCandidate);

    // 5. Calculate final effects
    const totalMultiplier = awarenessMultiplier * demographicEffect * charismaBonus;

    // Awareness: Increases with reach and impact
    const awarenessChange = baseReach * baseImpact * totalMultiplier * 10;

    // Favorability: Harder to move, only affected by high-impact actions
    const favorabilityChange = baseImpact > 0.6
        ? baseImpact * demographicEffect * charismaBonus * 3
        : 0;

    // Enthusiasm: Affected by personal actions (rallies, door-to-door)
    const enthusiasmChange = (action.type === 'rally' || action.type === 'door_to_door')
        ? baseImpact * demographicEffect * charismaBonus * 5
        : baseImpact * demographicEffect * charismaBonus * 2;

    // 6. Calculate cost efficiency
    const estimatedReach = baseReach * demographicEffect;
    const totalEffect = awarenessChange + favorabilityChange + enthusiasmChange;
    const costPerVote = actionParams.baseCost > 0
        ? actionParams.baseCost / (totalEffect * estimatedReach)
        : 0; // Free actions have 0 cost per vote

    return {
        awarenessChange,
        favorabilityChange,
        enthusiasmChange,
        costPerVote,
        estimatedReach
    };
};

/**
 * Calculate final polling from three stats
 * 
 * Game Theory: Weighted combination
 * - Awareness: 30% (need to be known)
 * - Favorability: 40% (most important - do they like you?)
 * - Enthusiasm: 30% (will they actually vote?)
 */
export const calculatePollingFromStats = (stats: CampaignStats): number => {
    return (stats.awareness * 0.3) + (stats.favorability * 0.4) + (stats.enthusiasm * 0.3);
};

// ============================================================================
// STRATEGIC RECOMMENDATIONS
// ============================================================================

export interface CampaignRecommendation {
    constituencyId: ConstituencyId;
    priority: 'critical' | 'competitive' | 'safe';
    margin: number;
    recommendedAction: CampaignActionType;
    recommendedDemographic?: DemographicGroup;
    reasoning: string;
}

const getActionForDemographic = (demo: DemographicGroup): CampaignActionType => {
    switch (demo) {
        case 'youth': return 'social_media';
        case 'retirees': return 'newspaper';
        case 'workers': return 'radio';
        case 'upper_class': return 'newspaper';
    }
};

/**
 * Generate strategic recommendations based on polling margins and demographics
 */
export const generateRecommendations = (
    state: GameState
): CampaignRecommendation[] => {
    const recommendations: CampaignRecommendation[] = [];

    Object.keys(CONSTITUENCIES).forEach(constId => {
        const id = constId as ConstituencyId;
        const constituency = CONSTITUENCIES[id];
        const playerPolling = state.parties.player.constituencyPolling[id];

        // Find leading opponent
        const opponentPolling = Math.max(
            ...Object.values(state.parties)
                .filter(p => p.id !== 'player')
                .map(p => p.constituencyPolling[id] || 0)
        );

        const margin = Math.abs(playerPolling - opponentPolling);

        // Determine priority
        let priority: 'critical' | 'competitive' | 'safe';
        if (margin < 3) priority = 'critical';
        else if (margin < 7) priority = 'competitive';
        else priority = 'safe';

        // Recommend action based on demographics
        const demographics = constituency.demographics;
        // Find largest demographic group
        const largestDemo = (Object.entries(demographics) as [DemographicGroup, number][])
            .sort(([, a], [, b]) => b - a)[0][0];

        const recommendedAction = getActionForDemographic(largestDemo);

        recommendations.push({
            constituencyId: id,
            priority,
            margin,
            recommendedAction,
            recommendedDemographic: largestDemo,
            reasoning: `Target ${largestDemo} (${(demographics[largestDemo] * 100).toFixed(0)}% of voters)`
        });
    });

    // Sort by priority (critical first)
    return recommendations.sort((a, b) => {
        const priorityOrder = { critical: 0, competitive: 1, safe: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
};
