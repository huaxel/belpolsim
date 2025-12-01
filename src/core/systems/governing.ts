/**
 * Governing System - Hybrid ECS Implementation
 * 
 * Handles governing phase mechanics:
 * - Government stability and approval tracking
 * - Crisis management
 * - Legislation processing
 * - Coalition friction and potential collapse
 * - Budget management
 * 
 * Implements Template Method pattern via ActionSystem.
 */

import type {
  GameState,
  GamePhase,
  GameAction,
  ActionResult,
  EntityId,
  BillData,
} from '../types';
import { ActionSystem } from '../System';
import {
  getPartySeats,
} from '../queries';

// ============================================================================
// GOVERNING ACTIONS
// ============================================================================

type GoverningActionType = 
  | 'proposeBill'
  | 'voteBill'
  | 'reshuffleCabinet'
  | 'callEarlyElection'
  | 'addressCrisis'
  | 'adjustBudget';

interface GoverningAction extends GameAction {
  type: GoverningActionType;
  billId?: EntityId;
  vote?: 'for' | 'against' | 'abstain';
  crisisId?: EntityId;
}

// ============================================================================
// GOVERNING SYSTEM
// ============================================================================

export class GoverningSystem extends ActionSystem {
  readonly name = 'GoverningSystem';
  protected readonly activePhases: GamePhase[] = ['governing', 'crisis'];

  /**
   * Main processing - update government state each turn
   */
  protected process(state: GameState): GameState {
    let newState = state;

    // Update government approval
    newState = this.updateApproval(newState);

    // Check for crisis triggers
    newState = this.checkCrisisTriggers(newState);

    // Process coalition friction
    newState = this.processCoalitionFriction(newState);

    // Check for government collapse
    newState = this.checkGovernmentCollapse(newState);

    return newState;
  }

  /**
   * Get available governing actions
   */
  public getAvailableActions(state: GameState, actor: EntityId): GameAction[] {
    const actions: GoverningAction[] = [];
    const coalition = state.globals.currentCoalition;

    // Only coalition parties can govern
    if (!coalition?.parties.includes(actor)) {
      return [];
    }

    // Propose legislation
    actions.push({
      type: 'proposeBill',
      actor,
    });

    // Vote on pending bills
    const pendingBills = this.getPendingBills(state);
    for (const billId of pendingBills) {
      actions.push({
        type: 'voteBill',
        actor,
        billId,
        vote: 'for',
      });
      actions.push({
        type: 'voteBill',
        actor,
        billId,
        vote: 'against',
      });
    }

    // PM-only actions
    if (actor === coalition.primeMinister) {
      actions.push({
        type: 'reshuffleCabinet',
        actor,
      });
      actions.push({
        type: 'callEarlyElection',
        actor,
      });
    }

    return actions;
  }

  /**
   * Execute a governing action
   */
  protected executeAction(state: GameState, action: GameAction): ActionResult {
    const govAction = action as GoverningAction;

    switch (govAction.type) {
      case 'proposeBill':
        return this.handleProposeBill(state, govAction);
      case 'voteBill':
        return this.handleVoteBill(state, govAction);
      case 'reshuffleCabinet':
        return this.handleReshuffle(state, govAction);
      case 'callEarlyElection':
        return this.handleEarlyElection(state, govAction);
      case 'addressCrisis':
        return this.handleAddressCrisis(state, govAction);
      default:
        return {
          success: false,
          newState: state,
          events: [],
          error: `Unknown governing action: ${action.type}`,
        };
    }
  }

  /**
   * Update government approval rating
   */
  private updateApproval(state: GameState): GameState {
    const coalition = state.globals.currentCoalition;
    if (!coalition) return state;

    // Approval influenced by stability, friction, and random events
    const currentApproval = state.globals.governmentApproval ?? 50;
    const stabilityFactor = (coalition.stabilityScore - 50) / 100;
    const frictionPenalty = coalition.frictionLevel / 200;
    
    const approvalChange = stabilityFactor - frictionPenalty + (Math.random() - 0.5) * 5;
    const newApproval = Math.max(0, Math.min(100, currentApproval + approvalChange));

    return {
      ...state,
      globals: {
        ...state.globals,
        governmentApproval: newApproval,
      },
    };
  }

  /**
   * Check for potential crisis triggers
   */
  private checkCrisisTriggers(state: GameState): GameState {
    const coalition = state.globals.currentCoalition;
    if (!coalition) return state;

    // Low approval can trigger crisis
    const approval = state.globals.governmentApproval ?? 50;
    if (approval < 25 && Math.random() < 0.3) {
      return this.triggerCrisis(state, 'Low Approval Crisis', 
        'Government approval has dropped dangerously low');
    }

    // High friction can trigger crisis
    if (coalition.frictionLevel > 75 && Math.random() < 0.2) {
      return this.triggerCrisis(state, 'Coalition Dispute',
        'Tensions between coalition partners have reached a breaking point');
    }

    return state;
  }

  /**
   * Trigger a government crisis
   */
  private triggerCrisis(
    state: GameState,
    title: string,
    description: string
  ): GameState {
    // Create crisis event (stored for UI to handle)
    void title;
    void description;

    return {
      ...state,
      globals: {
        ...state.globals,
        currentPhase: 'crisis',
      },
    };
  }

  /**
   * Process coalition friction
   */
  private processCoalitionFriction(state: GameState): GameState {
    const coalition = state.globals.currentCoalition;
    if (!coalition) return state;

    // Friction increases slightly each turn
    const newFriction = Math.min(100, coalition.frictionLevel + 0.5);
    const newStability = Math.max(0, 100 - newFriction);

    return {
      ...state,
      globals: {
        ...state.globals,
        currentCoalition: {
          ...coalition,
          frictionLevel: newFriction,
          stabilityScore: newStability,
        },
      },
    };
  }

  /**
   * Check if government should collapse
   */
  private checkGovernmentCollapse(state: GameState): GameState {
    const coalition = state.globals.currentCoalition;
    if (!coalition) return state;

    // Collapse if stability too low
    if (coalition.stabilityScore < 10 || 
        (state.globals.governmentApproval ?? 50) < 10) {
      return {
        ...state,
        globals: {
          ...state.globals,
          currentCoalition: undefined,
          currentPhase: 'campaign', // New election
        },
      };
    }

    return state;
  }

  /**
   * Get pending bills awaiting vote
   */
  private getPendingBills(state: GameState): EntityId[] {
    return state.entities.filter(id => {
      const bill = state.components.billData[id];
      return bill && bill.status === 'vote';
    });
  }

  /**
   * Handle proposing a bill
   */
  private handleProposeBill(
    state: GameState,
    action: GoverningAction
  ): ActionResult {
    const billId = `bill:${state.globals.currentTurn}-${Date.now()}` as EntityId;
    
    const billData: BillData = {
      title: 'New Legislation',
      description: 'A proposed bill',
      status: 'proposed',
      sponsor: action.actor,
      relatedIssues: [],
    };

    const newState: GameState = {
      ...state,
      entities: [...state.entities, billId],
      components: {
        ...state.components,
        billData: {
          ...state.components.billData,
          [billId]: billData,
        },
        identity: {
          ...state.components.identity,
          [billId]: {
            name: billData.title,
            type: 'bill',
          },
        },
      },
    };

    return {
      success: true,
      newState,
      events: [{
        id: `event:bill-proposed-${billId}`,
        type: 'legislation',
        turn: state.globals.currentTurn,
        title: 'Bill Proposed',
        description: `${action.actor} proposed new legislation`,
        effects: [],
        resolved: true,
      }],
      message: 'Bill proposed successfully',
    };
  }

  /**
   * Handle voting on a bill
   */
  private handleVoteBill(
    state: GameState,
    action: GoverningAction
  ): ActionResult {
    const billId = action.billId;
    if (!billId) {
      return {
        success: false,
        newState: state,
        events: [],
        error: 'No bill specified for vote',
      };
    }

    const bill = state.components.billData[billId];
    if (!bill) {
      return {
        success: false,
        newState: state,
        events: [],
        error: 'Bill not found',
      };
    }

    // Record vote
    const votes = bill.votes ?? { for: [], against: [], abstain: [] };
    const voteType = action.vote ?? 'abstain';
    votes[voteType] = [...(votes[voteType] ?? []), action.actor];

    // Check if all coalition parties have voted
    const coalition = state.globals.currentCoalition;
    const allVotes = [...votes.for, ...votes.against, ...votes.abstain];
    const allVoted = coalition?.parties.every(p => allVotes.includes(p)) ?? false;

    // Determine outcome if all voted
    let newStatus = bill.status;
    if (allVoted) {
      const forSeats = votes.for.reduce((sum, p) => sum + getPartySeats(state, p), 0);
      const againstSeats = votes.against.reduce((sum, p) => sum + getPartySeats(state, p), 0);
      newStatus = forSeats > againstSeats ? 'passed' : 'rejected';
    }

    const newState: GameState = {
      ...state,
      components: {
        ...state.components,
        billData: {
          ...state.components.billData,
          [billId]: {
            ...bill,
            votes,
            status: newStatus,
          },
        },
      },
    };

    return {
      success: true,
      newState,
      events: [],
      message: `Vote recorded: ${voteType}`,
    };
  }

  /**
   * Handle cabinet reshuffle
   */
  private handleReshuffle(
    state: GameState,
    action: GoverningAction
  ): ActionResult {
    void action;
    // Reshuffle logic - simplified for now
    return {
      success: true,
      newState: state,
      events: [{
        id: `event:reshuffle-${state.globals.currentTurn}`,
        type: 'government',
        turn: state.globals.currentTurn,
        title: 'Cabinet Reshuffle',
        description: 'The Prime Minister has reshuffled the cabinet',
        effects: [],
        resolved: true,
      }],
      message: 'Cabinet reshuffled',
    };
  }

  /**
   * Handle calling early election
   */
  private handleEarlyElection(
    state: GameState,
    action: GoverningAction
  ): ActionResult {
    void action;
    const newState: GameState = {
      ...state,
      globals: {
        ...state.globals,
        currentCoalition: undefined,
        currentPhase: 'campaign',
        nextElectionTurn: state.globals.currentTurn + 5, // 5 turns of campaigning
      },
    };

    return {
      success: true,
      newState,
      events: [{
        id: `event:early-election-${state.globals.currentTurn}`,
        type: 'election',
        turn: state.globals.currentTurn,
        title: 'Early Election Called',
        description: 'The government has fallen. New elections will be held.',
        effects: [],
        resolved: true,
      }],
      message: 'Early election called',
    };
  }

  /**
   * Handle addressing a crisis
   */
  private handleAddressCrisis(
    state: GameState,
    action: GoverningAction
  ): ActionResult {
    void action;
    // Crisis resolution logic
    return {
      success: true,
      newState: {
        ...state,
        globals: {
          ...state.globals,
          currentPhase: 'governing', // Return to governing
        },
      },
      events: [{
        id: `event:crisis-resolved-${state.globals.currentTurn}`,
        type: 'crisis',
        turn: state.globals.currentTurn,
        title: 'Crisis Resolved',
        description: 'The government has successfully addressed the crisis',
        effects: [],
        resolved: true,
      }],
      message: 'Crisis addressed',
    };
  }
}

// Export singleton instance
export const governingSystem = new GoverningSystem();
