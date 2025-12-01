/**
 * Query Functions for Hybrid ECS
 * 
 * Pure functions to query the GameState.
 * All queries are O(1) or O(n) where n is the number of entities.
 * 
 * Naming convention:
 *   - get* : Returns a single value or undefined
 *   - getAll* : Returns an array of all matching entities
 *   - find* : Returns the first match or undefined
 *   - has* : Returns boolean
 *   - can* : Returns boolean (for ability checks)
 *   - calculate* : Returns computed value
 */

import type {
  EntityId,
  EntityType,
  GameState,
  GamePhase,
  Identity,
  Stats,
  Resources,
  PartyPlatform,
  ConstituencyData,
} from './types';
import { getEntityType as extractEntityType } from './types';

// ============================================================================
// ENTITY QUERIES
// ============================================================================

/**
 * Check if an entity exists in the game state
 */
export function entityExists(state: GameState, entityId: EntityId): boolean {
  return state.entities.includes(entityId);
}

/**
 * Get the type of an entity from its ID
 */
export function getEntityType(entityId: EntityId): EntityType | null {
  return extractEntityType(entityId);
}

/**
 * Get entity identity component
 */
export function getIdentity(state: GameState, entityId: EntityId): Identity | undefined {
  return state.components.identity[entityId];
}

/**
 * Get entity name from identity
 */
export function getEntityName(state: GameState, entityId: EntityId): string {
  return state.components.identity[entityId]?.name ?? entityId;
}

/**
 * Get all entities of a specific type
 */
export function getEntitiesOfType(state: GameState, type: EntityType): EntityId[] {
  return state.entities.filter((id) => {
    const identity = state.components.identity[id];
    return identity?.type === type;
  });
}

/**
 * Get all entities with a specific tag
 */
export function getEntitiesWithTag(state: GameState, tag: string): EntityId[] {
  return state.entities.filter((id) => {
    const identity = state.components.identity[id];
    return identity?.tags?.includes(tag) ?? false;
  });
}

// ============================================================================
// PARTY QUERIES
// ============================================================================

/**
 * Get all party entities
 */
export function getAllParties(state: GameState): EntityId[] {
  return getEntitiesOfType(state, 'party');
}

/**
 * Get party stats
 */
export function getPartyStats(state: GameState, partyId: EntityId): Stats | undefined {
  return state.components.stats[partyId];
}

/**
 * Get party resources
 */
export function getPartyResources(state: GameState, partyId: EntityId): Resources | undefined {
  return state.components.resources[partyId];
}

/**
 * Get party platform
 */
export function getPartyPlatform(state: GameState, partyId: EntityId): PartyPlatform | undefined {
  return state.components.partyPlatform[partyId];
}

/**
 * Get party's national polling percentage
 */
export function getPartyPolling(state: GameState, partyId: EntityId): number {
  return state.components.stats[partyId]?.nationalPolling ?? 0;
}

/**
 * Get party's seat count
 */
export function getPartySeats(state: GameState, partyId: EntityId): number {
  return state.components.stats[partyId]?.seats ?? 0;
}

/**
 * Check if party is under Cordon Sanitaire
 */
export function isUnderCordonSanitaire(state: GameState, partyId: EntityId): boolean {
  return state.components.transientStatus[partyId]?.isUnderCordonSanitaire ?? false;
}

/**
 * Get parties eligible for coalition (not under Cordon Sanitaire)
 */
export function getEligibleParties(state: GameState): EntityId[] {
  return getAllParties(state).filter((id) => !isUnderCordonSanitaire(state, id));
}

/**
 * Get parties above electoral threshold
 */
export function getPartiesAboveThreshold(state: GameState, threshold: number = 5): EntityId[] {
  return getAllParties(state).filter((id) => getPartyPolling(state, id) >= threshold);
}

/**
 * Get party's position on an issue
 */
export function getPartyIssuePosition(
  state: GameState,
  partyId: EntityId,
  issueId: EntityId
): number | undefined {
  return state.components.partyPlatform[partyId]?.positions[issueId];
}

/**
 * Get the leading party by polling
 */
export function getLeadingParty(state: GameState): EntityId | undefined {
  const parties = getAllParties(state);
  if (parties.length === 0) return undefined;
  
  return parties.reduce((leader, party) => {
    const leaderPolling = getPartyPolling(state, leader);
    const partyPolling = getPartyPolling(state, party);
    return partyPolling > leaderPolling ? party : leader;
  }, parties[0]);
}

// ============================================================================
// POLITICIAN QUERIES
// ============================================================================

/**
 * Get all politician entities
 */
export function getAllPoliticians(state: GameState): EntityId[] {
  return getEntitiesOfType(state, 'politician');
}

/**
 * Get politicians belonging to a party
 */
export function getPartyPoliticians(state: GameState, partyId: EntityId): EntityId[] {
  return getAllPoliticians(state).filter((id) => {
    const relations = state.components.relations[id];
    return relations?.memberOf === partyId;
  });
}

/**
 * Get party leader
 */
export function getPartyLeader(state: GameState, partyId: EntityId): EntityId | undefined {
  return getAllPoliticians(state).find((id) => {
    const relations = state.components.relations[id];
    return relations?.leaderOf === partyId;
  });
}

/**
 * Get politician's party
 */
export function getPoliticianParty(state: GameState, politicianId: EntityId): EntityId | undefined {
  return state.components.relations[politicianId]?.memberOf;
}

// ============================================================================
// CONSTITUENCY QUERIES
// ============================================================================

/**
 * Get all constituency entities
 */
export function getAllConstituencies(state: GameState): EntityId[] {
  return getEntitiesOfType(state, 'constituency');
}

/**
 * Get constituency data
 */
export function getConstituencyData(
  state: GameState,
  constituencyId: EntityId
): ConstituencyData | undefined {
  return state.components.constituencyData[constituencyId];
}

/**
 * Get constituencies by region
 */
export function getConstituenciesByRegion(
  state: GameState,
  region: 'flanders' | 'wallonia' | 'brussels'
): EntityId[] {
  return getAllConstituencies(state).filter((id) => {
    const data = state.components.constituencyData[id];
    return data?.region === region;
  });
}

/**
 * Get total seats in all constituencies
 */
export function getTotalSeats(state: GameState): number {
  return getAllConstituencies(state).reduce((total, id) => {
    const data = state.components.constituencyData[id];
    return total + (data?.seats ?? 0);
  }, 0);
}

// ============================================================================
// ISSUE QUERIES
// ============================================================================

/**
 * Get all issue entities
 */
export function getAllIssues(state: GameState): EntityId[] {
  return getEntitiesOfType(state, 'issue');
}

/**
 * Get issues by category
 */
export function getIssuesByCategory(
  state: GameState,
  category: string
): EntityId[] {
  return getAllIssues(state).filter((id) => {
    const data = state.components.issueData[id];
    return data?.category === category;
  });
}

/**
 * Get most salient issues
 */
export function getMostSalientIssues(state: GameState, count: number = 5): EntityId[] {
  return getAllIssues(state)
    .map((id) => ({ id, salience: state.components.issueData[id]?.salience ?? 0 }))
    .sort((a, b) => b.salience - a.salience)
    .slice(0, count)
    .map(({ id }) => id);
}

// ============================================================================
// RELATION QUERIES
// ============================================================================

/**
 * Get sentiment between two entities
 */
export function getSentiment(
  state: GameState,
  fromId: EntityId,
  toId: EntityId
): number {
  return state.components.relations[fromId]?.sentiment?.[toId] ?? 0;
}

/**
 * Check if two parties are coalition partners
 */
export function areCoalitionPartners(
  state: GameState,
  partyA: EntityId,
  partyB: EntityId
): boolean {
  const coalition = state.globals.currentCoalition;
  if (!coalition) return false;
  return coalition.parties.includes(partyA) && coalition.parties.includes(partyB);
}

// ============================================================================
// COALITION QUERIES
// ============================================================================

/**
 * Get total seats held by a coalition
 */
export function getCoalitionSeats(state: GameState, parties: EntityId[]): number {
  return parties.reduce((total, partyId) => total + getPartySeats(state, partyId), 0);
}

/**
 * Check if coalition has majority
 */
export function hasMajority(state: GameState, parties: EntityId[]): boolean {
  const totalSeats = getTotalSeats(state);
  const coalitionSeats = getCoalitionSeats(state, parties);
  return coalitionSeats > totalSeats / 2;
}

/**
 * Calculate ideological distance between two parties
 */
export function calculateIdeologicalDistance(
  state: GameState,
  partyA: EntityId,
  partyB: EntityId
): number {
  const platformA = state.components.partyPlatform[partyA];
  const platformB = state.components.partyPlatform[partyB];
  
  if (!platformA || !platformB) return 100;
  
  const issues = getAllIssues(state);
  if (issues.length === 0) return 0;
  
  let totalDistance = 0;
  let issueCount = 0;
  
  for (const issueId of issues) {
    const posA = platformA.positions[issueId];
    const posB = platformB.positions[issueId];
    
    if (posA !== undefined && posB !== undefined) {
      totalDistance += Math.abs(posA - posB);
      issueCount++;
    }
  }
  
  return issueCount > 0 ? totalDistance / issueCount : 0;
}

/**
 * Calculate coalition friction based on ideological distance
 */
export function calculateCoalitionFriction(state: GameState, parties: EntityId[]): number {
  if (parties.length < 2) return 0;
  
  let totalFriction = 0;
  let pairCount = 0;
  
  for (let i = 0; i < parties.length; i++) {
    for (let j = i + 1; j < parties.length; j++) {
      totalFriction += calculateIdeologicalDistance(state, parties[i], parties[j]);
      pairCount++;
    }
  }
  
  return pairCount > 0 ? totalFriction / pairCount : 0;
}

// ============================================================================
// RESOURCE QUERIES
// ============================================================================

/**
 * Get player party resources
 */
export function getPlayerResources(state: GameState): Resources | undefined {
  return state.components.resources[state.globals.playerParty];
}

/**
 * Check if player can afford an action
 */
export function canAfford(
  state: GameState,
  cost: { money?: number; politicalCapital?: number; actionPoints?: number }
): boolean {
  const resources = getPlayerResources(state);
  if (!resources) return false;
  
  if (cost.money && (resources.money ?? 0) < cost.money) return false;
  if (cost.politicalCapital && (resources.politicalCapital ?? 0) < cost.politicalCapital) return false;
  if (cost.actionPoints && (resources.actionPoints ?? 0) < cost.actionPoints) return false;
  
  return true;
}

// ============================================================================
// PHASE QUERIES
// ============================================================================

/**
 * Check if game is in a specific phase
 */
export function isInPhase(state: GameState, phase: GamePhase): boolean {
  return state.globals.currentPhase === phase;
}

/**
 * Check if game is in campaign phase
 */
export function isInCampaign(state: GameState): boolean {
  return isInPhase(state, 'campaign');
}

/**
 * Check if game is in governing phase
 */
export function isInGoverning(state: GameState): boolean {
  return isInPhase(state, 'governing');
}

// ============================================================================
// ELECTORAL QUERIES
// ============================================================================

/**
 * Get the player's margin over the leading opponent
 */
export function getPlayerMargin(state: GameState): number {
  const playerParty = state.globals.playerParty;
  const playerPolling = getPartyPolling(state, playerParty);
  
  const opponents = getAllParties(state).filter((id) => id !== playerParty);
  const maxOpponentPolling = Math.max(
    ...opponents.map((id) => getPartyPolling(state, id)),
    0
  );
  
  return playerPolling - maxOpponentPolling;
}

/**
 * Project seats for a party based on polling (simple proportional)
 */
export function projectSeats(state: GameState, partyId: EntityId): number {
  const totalSeats = getTotalSeats(state);
  const polling = getPartyPolling(state, partyId);
  const totalPolling = getAllParties(state).reduce(
    (sum, id) => sum + getPartyPolling(state, id),
    0
  );
  
  if (totalPolling === 0) return 0;
  return Math.round((polling / totalPolling) * totalSeats);
}
