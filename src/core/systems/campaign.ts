/**
 * Campaign System - Hybrid ECS Implementation
 * 
 * Handles all campaign-phase game logic:
 * - Processing campaign actions (rally, advertisement, etc.)
 * - Updating polling based on campaign effectiveness
 * - Managing campaign resources and action points
 * - AI campaign behavior
 * 
 * Implements Template Method pattern via ActionSystem base class.
 */

import type {
  GameState,
  GamePhase,
  GameAction,
  ActionResult,
  EntityId,
  CampaignAction,
  CampaignActionType,
  Stats,
  GameEvent,
} from '../types';
import { ActionSystem } from '../System';
import {
  getAllParties,
  getPartyResources,
  getPartyStats,
  getAllConstituencies,
} from '../queries';

// ============================================================================
// CAMPAIGN ACTION CONFIGURATIONS
// ============================================================================

interface ActionConfig {
  type: CampaignActionType;
  name: string;
  description: string;
  cost: {
    money: number;
    actionPoints: number;
    politicalCapital?: number;
  };
  effects: {
    nationalPolling?: number;
    momentum?: number;
    mediaPresence?: number;
    grassrootsStrength?: number;
  };
  scope: 'constituency' | 'regional' | 'national';
}

const ACTION_CONFIGS: Record<CampaignActionType, ActionConfig> = {
  rally: {
    type: 'rally',
    name: 'Hold Rally',
    description: 'Organize a political rally to energize supporters',
    cost: { money: 5000, actionPoints: 1 },
    effects: { nationalPolling: 0.5, momentum: 5, grassrootsStrength: 3 },
    scope: 'constituency',
  },
  advertisement: {
    type: 'advertisement',
    name: 'Run Advertisement',
    description: 'Run TV/radio ads to increase visibility',
    cost: { money: 15000, actionPoints: 1 },
    effects: { nationalPolling: 1, mediaPresence: 5 },
    scope: 'regional',
  },
  doorToDoor: {
    type: 'doorToDoor',
    name: 'Door-to-Door Campaign',
    description: 'Grassroots canvassing in local neighborhoods',
    cost: { money: 2000, actionPoints: 1 },
    effects: { nationalPolling: 0.3, grassrootsStrength: 5 },
    scope: 'constituency',
  },
  mediaAppearance: {
    type: 'mediaAppearance',
    name: 'Media Appearance',
    description: 'Appear on news programs and talk shows',
    cost: { money: 0, actionPoints: 1, politicalCapital: 10 },
    effects: { nationalPolling: 0.8, mediaPresence: 8, momentum: 2 },
    scope: 'national',
  },
  debate: {
    type: 'debate',
    name: 'Participate in Debate',
    description: 'Join a political debate with other party leaders',
    cost: { money: 0, actionPoints: 2 },
    effects: { nationalPolling: 1.5, momentum: 10, mediaPresence: 10 },
    scope: 'national',
  },
  fundraise: {
    type: 'fundraise',
    name: 'Fundraising Event',
    description: 'Organize event to raise campaign funds',
    cost: { money: 1000, actionPoints: 1 },
    effects: { grassrootsStrength: 2 },
    scope: 'constituency',
  },
  attackAd: {
    type: 'attackAd',
    name: 'Attack Advertisement',
    description: 'Run negative ads against opponents',
    cost: { money: 10000, actionPoints: 1, politicalCapital: 15 },
    effects: { mediaPresence: 3, momentum: -2 },
    scope: 'regional',
  },
  policyAnnouncement: {
    type: 'policyAnnouncement',
    name: 'Policy Announcement',
    description: 'Announce new policy position to voters',
    cost: { money: 3000, actionPoints: 1 },
    effects: { nationalPolling: 0.6, momentum: 3, mediaPresence: 2 },
    scope: 'national',
  },
};

// ============================================================================
// CAMPAIGN SYSTEM
// ============================================================================

export class CampaignSystem extends ActionSystem {
  readonly name = 'CampaignSystem';
  protected readonly activePhases: GamePhase[] = ['campaign'];

  /**
   * Main processing - runs AI campaigns and updates polling
   */
  protected process(state: GameState): GameState {
    let newState = state;

    // Run AI campaigns for non-player parties
    const aiParties = getAllParties(state).filter(
      (id) => id !== state.globals.playerParty
    );
    
    for (const partyId of aiParties) {
      newState = this.runAICampaign(newState, partyId);
    }

    // Update polling based on momentum and other factors
    newState = this.updatePolling(newState);

    return newState;
  }

  /**
   * Get available campaign actions for a party
   */
  public getAvailableActions(state: GameState, actor: EntityId): GameAction[] {
    const resources = getPartyResources(state, actor);
    if (!resources) return [];

    const actions: CampaignAction[] = [];

    for (const [type, config] of Object.entries(ACTION_CONFIGS)) {
      // Check if party can afford this action
      if ((resources.money ?? 0) >= config.cost.money &&
          (resources.actionPoints ?? 0) >= config.cost.actionPoints &&
          (!config.cost.politicalCapital || (resources.politicalCapital ?? 0) >= config.cost.politicalCapital)) {
        
        if (config.scope === 'constituency') {
          // Add action for each constituency
          for (const constituencyId of getAllConstituencies(state)) {
            actions.push({
              type: type as CampaignActionType,
              actor,
              constituency: constituencyId,
              cost: config.cost,
            });
          }
        } else {
          actions.push({
            type: type as CampaignActionType,
            actor,
            cost: config.cost,
          });
        }
      }
    }

    return actions;
  }

  /**
   * Execute a campaign action
   */
  protected executeAction(state: GameState, action: GameAction): ActionResult {
    const campaignAction = action as CampaignAction;
    const config = ACTION_CONFIGS[campaignAction.type as CampaignActionType];
    
    if (!config) {
      return {
        success: false,
        newState: state,
        events: [],
        error: `Unknown campaign action: ${action.type}`,
      };
    }

    // Apply effects to party stats
    const newState = this.applyActionEffects(state, action.actor, config);

    // Generate event
    const event = this.createCampaignEvent(
      state.globals.currentTurn,
      action.actor,
      config
    );

    return {
      success: true,
      newState,
      events: [event],
      message: `${config.name} executed successfully`,
    };
  }

  /**
   * Apply campaign action effects to party stats
   */
  private applyActionEffects(
    state: GameState,
    partyId: EntityId,
    config: ActionConfig
  ): GameState {
    const currentStats = getPartyStats(state, partyId) ?? {};
    const effects = config.effects;

    const updatedStats: Stats = {
      ...currentStats,
      nationalPolling: (currentStats.nationalPolling ?? 0) + (effects.nationalPolling ?? 0),
      momentum: Math.max(-100, Math.min(100, 
        (currentStats.momentum ?? 0) + (effects.momentum ?? 0)
      )),
      mediaPresence: Math.min(100, 
        (currentStats.mediaPresence ?? 0) + (effects.mediaPresence ?? 0)
      ),
      grassrootsStrength: Math.min(100,
        (currentStats.grassrootsStrength ?? 0) + (effects.grassrootsStrength ?? 0)
      ),
    };

    return {
      ...state,
      components: {
        ...state.components,
        stats: {
          ...state.components.stats,
          [partyId]: updatedStats,
        },
      },
    };
  }

  /**
   * Run AI campaign logic for a party
   */
  private runAICampaign(state: GameState, partyId: EntityId): GameState {
    const resources = getPartyResources(state, partyId);
    if (!resources || (resources.actionPoints ?? 0) <= 0) {
      return state;
    }

    // Simple AI: pick a random affordable action
    const availableActions = this.getAvailableActions(state, partyId);
    if (availableActions.length === 0) return state;

    const randomAction = availableActions[Math.floor(Math.random() * availableActions.length)];
    const result = this.processAction(state, randomAction);
    
    return result.newState;
  }

  /**
   * Update polling based on momentum and other factors
   */
  private updatePolling(state: GameState): GameState {
    let newState = state;
    const parties = getAllParties(state);

    for (const partyId of parties) {
      const stats = getPartyStats(state, partyId);
      if (!stats) continue;

      // Momentum affects polling
      const momentumEffect = (stats.momentum ?? 0) * 0.01;
      
      // Media presence affects polling
      const mediaEffect = (stats.mediaPresence ?? 0) * 0.005;
      
      const pollingChange = momentumEffect + mediaEffect;
      const newPolling = Math.max(0, Math.min(100,
        (stats.nationalPolling ?? 0) + pollingChange
      ));

      // Decay momentum slightly each turn
      const newMomentum = (stats.momentum ?? 0) * 0.9;

      newState = {
        ...newState,
        components: {
          ...newState.components,
          stats: {
            ...newState.components.stats,
            [partyId]: {
              ...stats,
              nationalPolling: newPolling,
              momentum: newMomentum,
            },
          },
        },
      };
    }

    return newState;
  }

  /**
   * Create a game event for a campaign action
   */
  private createCampaignEvent(
    turn: number,
    actor: EntityId,
    config: ActionConfig
  ): GameEvent {
    return {
      id: `event:campaign-${turn}-${Date.now()}`,
      type: 'campaign',
      turn,
      title: config.name,
      description: `${actor} performed: ${config.description}`,
      effects: [],
      resolved: true,
    };
  }
}

// Export singleton instance for convenience
export const campaignSystem = new CampaignSystem();

// Export action configurations for UI
export { ACTION_CONFIGS };
export type { ActionConfig };
