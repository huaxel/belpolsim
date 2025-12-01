/**
 * Election System - Hybrid ECS Implementation
 * 
 * Handles election mechanics:
 * - D'Hondt seat allocation (Belgian proportional system)
 * - 5% electoral threshold
 * - Constituency-level vote counting
 * - Election result calculation
 * 
 * Implements Template Method pattern via PhaseTransitionSystem.
 */

import type {
  GameState,
  GamePhase,
  EntityId,
  ElectionResult,
  Stats,
} from '../types';
import { PhaseTransitionSystem } from '../System';
import {
  getAllParties,
  getAllConstituencies,
  getPartyPolling,
  getPartyStats,
  getConstituencyData,
  getPartiesAboveThreshold,
} from '../queries';

// Belgian electoral constants
const ELECTORAL_THRESHOLD = 5; // 5% threshold to gain seats
const TOTAL_PARLIAMENT_SEATS = 150;

// ============================================================================
// ELECTION SYSTEM
// ============================================================================

export class ElectionSystem extends PhaseTransitionSystem {
  readonly name = 'ElectionSystem';
  protected readonly activePhases: GamePhase[] = ['election'];

  /**
   * Main processing - calculate election results
   */
  protected process(state: GameState): GameState {
    const electionResult = this.calculateElectionResult(state);
    
    // Update party seats based on results
    let newState = this.applyElectionResults(state, electionResult);
    
    // Store election result in history
    newState = {
      ...newState,
      globals: {
        ...newState.globals,
        lastElectionResult: electionResult,
        electionHistory: [...newState.globals.electionHistory, electionResult],
      },
    };

    return newState;
  }

  /**
   * Check if we should transition to next phase
   */
  protected checkTransitionConditions(state: GameState): boolean {
    // Election is complete after processing
    return state.globals.currentPhase === 'election';
  }

  /**
   * Get the next phase after election
   */
  protected getNextPhase(): GamePhase {
    return 'consultation';
  }

  /**
   * Calculate full election results
   */
  private calculateElectionResult(state: GameState): ElectionResult {
    const parties = getPartiesAboveThreshold(state, ELECTORAL_THRESHOLD);
    const constituencies = getAllConstituencies(state);
    
    // Calculate national vote shares
    const voteShare: Record<EntityId, number> = {};
    const votes: Record<EntityId, number> = {};
    const seats: Record<EntityId, number> = {};
    
    // Initialize all parties
    for (const partyId of getAllParties(state)) {
      voteShare[partyId] = getPartyPolling(state, partyId);
      votes[partyId] = 0;
      seats[partyId] = 0;
    }

    // Calculate constituency results
    const constituencyResults: ElectionResult['constituencyResults'] = {};
    
    for (const constituencyId of constituencies) {
      const constituencyData = getConstituencyData(state, constituencyId);
      if (!constituencyData) continue;
      
      const constituencySeats = constituencyData.seats;
      
      // D'Hondt allocation for this constituency
      const constituencyAllocation = this.dHondtAllocation(
        state,
        parties,
        constituencySeats
      );
      
      constituencyResults[constituencyId] = {
        seats: constituencyAllocation,
        voteShare: Object.fromEntries(
          parties.map(p => [p, getPartyPolling(state, p)])
        ),
      };
      
      // Accumulate national totals
      for (const [partyId, partySeats] of Object.entries(constituencyAllocation)) {
        seats[partyId] = (seats[partyId] ?? 0) + partySeats;
        votes[partyId] = (votes[partyId] ?? 0) + (constituencyData.population * (voteShare[partyId] ?? 0) / 100);
      }
    }

    return {
      date: state.globals.currentTurn,
      seats,
      votes,
      voteShare,
      constituencyResults,
      turnout: 85 + Math.random() * 10, // 85-95% turnout (Belgium has compulsory voting)
    };
  }

  /**
   * D'Hondt method for seat allocation
   * Belgian proportional representation system
   */
  private dHondtAllocation(
    state: GameState,
    eligibleParties: EntityId[],
    seatsToAllocate: number
  ): Record<EntityId, number> {
    const allocation: Record<EntityId, number> = {};
    const quotients: Array<{ party: EntityId; quotient: number }> = [];
    
    // Initialize
    for (const partyId of eligibleParties) {
      allocation[partyId] = 0;
    }

    // Allocate seats one by one
    for (let seat = 0; seat < seatsToAllocate; seat++) {
      // Calculate quotients
      quotients.length = 0;
      for (const partyId of eligibleParties) {
        const votes = getPartyPolling(state, partyId);
        const currentSeats = allocation[partyId] ?? 0;
        const quotient = votes / (currentSeats + 1);
        quotients.push({ party: partyId, quotient });
      }
      
      // Award seat to highest quotient
      quotients.sort((a, b) => b.quotient - a.quotient);
      if (quotients.length > 0) {
        allocation[quotients[0].party]++;
      }
    }

    return allocation;
  }

  /**
   * Apply election results to game state
   */
  private applyElectionResults(
    state: GameState,
    results: ElectionResult
  ): GameState {
    let newState = state;

    for (const [partyId, seatCount] of Object.entries(results.seats)) {
      const currentStats = getPartyStats(state, partyId as EntityId) ?? {};
      const updatedStats: Stats = {
        ...currentStats,
        seats: seatCount,
        projectedSeats: seatCount,
      };

      newState = {
        ...newState,
        components: {
          ...newState.components,
          stats: {
            ...newState.components.stats,
            [partyId]: updatedStats,
          },
        },
      };
    }

    return newState;
  }
}

// Export singleton instance
export const electionSystem = new ElectionSystem();

// Export constants
export { ELECTORAL_THRESHOLD, TOTAL_PARLIAMENT_SEATS };
