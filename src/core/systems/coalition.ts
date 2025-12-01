/**
 * Coalition System - Hybrid ECS Implementation
 * 
 * Handles coalition formation mechanics:
 * - Belgian consultation process (King appoints informateur/formateur)
 * - Coalition negotiation
 * - Policy compromise calculation
 * - Cordon Sanitaire enforcement
 * - Linguistic parity requirements
 * 
 * Implements Template Method pattern via PhaseTransitionSystem.
 */

import type {
  GameState,
  GamePhase,
  GameAction,
  ActionResult,
  EntityId,
  Coalition,
} from '../types';
import { ActionSystem } from '../System';
import {
  getAllParties,
  getPartySeats,
  getEligibleParties,
  hasMajority,
  calculateCoalitionFriction,
  isUnderCordonSanitaire,
} from '../queries';

// Belgian government constants
const MAJORITY_THRESHOLD = 76; // 76 out of 150 seats needed for majority

// ============================================================================
// COALITION ACTIONS
// ============================================================================

interface CoalitionAction extends GameAction {
  type: 'proposeCoalition' | 'acceptCoalition' | 'rejectCoalition' | 'negotiatePolicy';
  proposedPartners?: EntityId[];
  policyProposals?: Record<EntityId, number>;
}

// ============================================================================
// COALITION SYSTEM
// ============================================================================

export class CoalitionSystem extends ActionSystem {
  readonly name = 'CoalitionSystem';
  protected readonly activePhases: GamePhase[] = ['consultation', 'formation'];

  /**
   * Main processing - check formation progress
   */
  protected process(state: GameState): GameState {
    // If we're in consultation, check if informateur has been appointed
    if (state.globals.currentPhase === 'consultation') {
      return this.processConsultation(state);
    }
    
    // If we're in formation, check negotiation progress
    if (state.globals.currentPhase === 'formation') {
      return this.processFormation(state);
    }

    return state;
  }

  /**
   * Get available coalition actions
   */
  public getAvailableActions(state: GameState, actor: EntityId): GameAction[] {
    const actions: CoalitionAction[] = [];
    const eligibleParties = getEligibleParties(state);

    // Can propose coalition with any combination of eligible parties
    if (state.globals.currentPhase === 'formation') {
      // Generate possible coalition combinations
      const otherParties = eligibleParties.filter(p => p !== actor);
      
      // Propose 2-party coalitions
      for (const partner of otherParties) {
        const coalition = [actor, partner];
        if (hasMajority(state, coalition)) {
          actions.push({
            type: 'proposeCoalition',
            actor,
            proposedPartners: coalition,
          });
        }
      }

      // Propose 3-party coalitions
      for (let i = 0; i < otherParties.length; i++) {
        for (let j = i + 1; j < otherParties.length; j++) {
          const coalition = [actor, otherParties[i], otherParties[j]];
          if (hasMajority(state, coalition)) {
            actions.push({
              type: 'proposeCoalition',
              actor,
              proposedPartners: coalition,
            });
          }
        }
      }
    }

    return actions;
  }

  /**
   * Execute a coalition action
   */
  protected executeAction(state: GameState, action: GameAction): ActionResult {
    const coalitionAction = action as CoalitionAction;

    switch (coalitionAction.type) {
      case 'proposeCoalition':
        return this.handleProposalAction(state, coalitionAction);
      case 'acceptCoalition':
        return this.handleAcceptAction(state, coalitionAction);
      case 'rejectCoalition':
        return this.handleRejectAction(state, coalitionAction);
      case 'negotiatePolicy':
        return this.handleNegotiateAction(state, coalitionAction);
      default:
        return {
          success: false,
          newState: state,
          events: [],
          error: `Unknown coalition action: ${action.type}`,
        };
    }
  }

  /**
   * Process consultation phase
   */
  private processConsultation(state: GameState): GameState {
    // Appoint informateur if not already done
    if (!state.globals.informateur) {
      const largestParty = this.getLargestParty(state);
      return {
        ...state,
        globals: {
          ...state.globals,
          informateur: largestParty,
          consultationRound: 1,
        },
      };
    }

    // After consultation rounds, appoint formateur and move to formation
    if ((state.globals.consultationRound ?? 0) >= 3) {
      return {
        ...state,
        globals: {
          ...state.globals,
          formateur: state.globals.informateur,
          currentPhase: 'formation',
        },
      };
    }

    return state;
  }

  /**
   * Process formation phase
   */
  private processFormation(state: GameState): GameState {
    // Formation logic handled by actions
    return state;
  }

  /**
   * Handle coalition proposal
   */
  private handleProposalAction(
    state: GameState,
    action: CoalitionAction
  ): ActionResult {
    const partners = action.proposedPartners ?? [];
    
    // Validate: no Cordon Sanitaire parties
    for (const party of partners) {
      if (isUnderCordonSanitaire(state, party)) {
        return {
          success: false,
          newState: state,
          events: [],
          error: 'Cannot form coalition with party under Cordon Sanitaire',
        };
      }
    }

    // Validate: must have majority
    if (!hasMajority(state, partners)) {
      return {
        success: false,
        newState: state,
        events: [],
        error: 'Coalition does not have parliamentary majority',
      };
    }

    // Calculate friction
    const friction = calculateCoalitionFriction(state, partners);
    
    // Form the coalition
    const coalition: Coalition = {
      parties: partners,
      primeMinister: action.actor, // Simplified: proposer becomes PM
      formationDate: state.globals.currentTurn,
      policyCompromises: {},
      portfolioAllocation: {},
      frictionLevel: friction,
      stabilityScore: Math.max(0, 100 - friction),
    };

    const newState: GameState = {
      ...state,
      globals: {
        ...state.globals,
        currentCoalition: coalition,
        coalitionHistory: [...state.globals.coalitionHistory, coalition],
        currentPhase: 'governing',
      },
    };

    return {
      success: true,
      newState,
      events: [{
        id: `event:coalition-formed-${state.globals.currentTurn}`,
        type: 'coalition',
        turn: state.globals.currentTurn,
        title: 'Coalition Formed',
        description: `New government formed with ${partners.length} parties`,
        effects: [],
        resolved: true,
      }],
      message: 'Coalition successfully formed',
    };
  }

  /**
   * Handle coalition acceptance
   */
  private handleAcceptAction(
    state: GameState,
    action: CoalitionAction
  ): ActionResult {
    void action; // Reserved for future use
    // Simplified: immediate acceptance
    return {
      success: true,
      newState: state,
      events: [],
      message: 'Coalition proposal accepted',
    };
  }

  /**
   * Handle coalition rejection
   */
  private handleRejectAction(
    state: GameState,
    action: CoalitionAction
  ): ActionResult {
    void action; // Reserved for future use
    return {
      success: true,
      newState: state,
      events: [],
      message: 'Coalition proposal rejected',
    };
  }

  /**
   * Handle policy negotiation
   */
  private handleNegotiateAction(
    state: GameState,
    action: CoalitionAction
  ): ActionResult {
    void action; // Reserved for future use
    // Policy negotiation logic
    return {
      success: true,
      newState: state,
      events: [],
      message: 'Policy negotiation in progress',
    };
  }

  /**
   * Get the largest party by seats
   */
  private getLargestParty(state: GameState): EntityId {
    const parties = getAllParties(state);
    return parties.reduce((largest, party) => {
      return getPartySeats(state, party) > getPartySeats(state, largest)
        ? party
        : largest;
    }, parties[0]);
  }
}

// Export singleton instance
export const coalitionSystem = new CoalitionSystem();

// Export constants
export { MAJORITY_THRESHOLD };
