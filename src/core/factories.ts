/**
 * Entity Factories for Hybrid ECS
 * 
 * Factory functions to create entities with their component data.
 * Each factory:
 *   1. Creates a unique EntityId
 *   2. Adds the entity to state.entities
 *   3. Populates relevant component tables
 *   4. Returns the updated GameState
 */

import type {
  EntityId,
  GameState,
  Identity,
  Stats,
  Relations,
  Resources,
  TransientStatus,
  PartyPlatform,
  ConstituencyData,
  IssueData,
} from './types';
import { createEntityId } from './types';

// ============================================================================
// FACTORY RESULT TYPE
// ============================================================================

export interface FactoryResult {
  state: GameState;
  entityId: EntityId;
}

// ============================================================================
// PARTY FACTORY
// ============================================================================

export interface CreatePartyOptions {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  color?: string;
  ideology?: string;
  isExtremist?: boolean;
  
  // Initial stats
  nationalPolling?: number;
  seats?: number;
  momentum?: number;
  
  // Resources
  money?: number;
  politicalCapital?: number;
  
  // Platform
  positions?: Record<EntityId, number>;
  priorityIssues?: EntityId[];
}

export function createParty(state: GameState, options: CreatePartyOptions): FactoryResult {
  const entityId = createEntityId('party', options.id);
  
  // Add to entities list
  const entities = [...state.entities, entityId];
  
  // Create identity
  const identity: Identity = {
    name: options.name,
    displayName: options.displayName ?? options.name,
    description: options.description,
    type: 'party',
    tags: options.isExtremist ? ['extremist'] : [],
  };
  
  // Create stats
  const stats: Stats = {
    nationalPolling: options.nationalPolling ?? 10,
    seats: options.seats ?? 0,
    momentum: options.momentum ?? 0,
    constituencyPolling: {},
  };
  
  // Create resources
  const resources: Resources = {
    money: options.money ?? 100000,
    politicalCapital: options.politicalCapital ?? 50,
    actionPoints: 3,
  };
  
  // Create relations
  const relations: Relations = {
    sentiment: {},
    alliances: [],
    rivalries: [],
  };
  
  // Create transient status
  const transientStatus: TransientStatus = {
    modifiers: [],
    isUnderCordonSanitaire: options.isExtremist ?? false,
  };
  
  // Create platform
  const partyPlatform: PartyPlatform = {
    positions: options.positions ?? {},
    priorityIssues: options.priorityIssues ?? [],
  };
  
  return {
    state: {
      ...state,
      entities,
      components: {
        ...state.components,
        identity: { ...state.components.identity, [entityId]: identity },
        stats: { ...state.components.stats, [entityId]: stats },
        resources: { ...state.components.resources, [entityId]: resources },
        relations: { ...state.components.relations, [entityId]: relations },
        transientStatus: { ...state.components.transientStatus, [entityId]: transientStatus },
        partyPlatform: { ...state.components.partyPlatform, [entityId]: partyPlatform },
      },
    },
    entityId,
  };
}

// ============================================================================
// POLITICIAN FACTORY
// ============================================================================

export interface CreatePoliticianOptions {
  id: string;
  name: string;
  partyId: EntityId;
  constituencyId?: EntityId;
  
  // Stats
  charisma?: number;
  competence?: number;
  loyalty?: number;
  ambition?: number;
  popularity?: number;
  
  // Role
  isLeader?: boolean;
  listPosition?: number;
}

export function createPolitician(state: GameState, options: CreatePoliticianOptions): FactoryResult {
  const entityId = createEntityId('politician', options.id);
  
  const entities = [...state.entities, entityId];
  
  const identity: Identity = {
    name: options.name,
    type: 'politician',
    tags: options.isLeader ? ['leader'] : [],
  };
  
  const stats: Stats = {
    charisma: options.charisma ?? 50,
    competence: options.competence ?? 50,
    loyalty: options.loyalty ?? 70,
    ambition: options.ambition ?? 50,
    popularity: options.popularity ?? 50,
  };
  
  const relations: Relations = {
    memberOf: options.partyId,
    leaderOf: options.isLeader ? options.partyId : undefined,
    sentiment: {},
  };
  
  return {
    state: {
      ...state,
      entities,
      components: {
        ...state.components,
        identity: { ...state.components.identity, [entityId]: identity },
        stats: { ...state.components.stats, [entityId]: stats },
        relations: { ...state.components.relations, [entityId]: relations },
      },
    },
    entityId,
  };
}

// ============================================================================
// CONSTITUENCY FACTORY
// ============================================================================

export interface CreateConstituencyOptions {
  id: string;
  name: string;
  region: 'flanders' | 'wallonia' | 'brussels';
  language: 'dutch' | 'french' | 'bilingual';
  seats: number;
  population: number;
  swingFactor?: number;
}

export function createConstituency(state: GameState, options: CreateConstituencyOptions): FactoryResult {
  const entityId = createEntityId('constituency', options.id);
  
  const entities = [...state.entities, entityId];
  
  const identity: Identity = {
    name: options.name,
    type: 'constituency',
    tags: [options.region, options.language],
  };
  
  const constituencyData: ConstituencyData = {
    region: options.region,
    language: options.language,
    seats: options.seats,
    population: options.population,
    swingFactor: options.swingFactor ?? 1.0,
    historicalResults: {},
  };
  
  return {
    state: {
      ...state,
      entities,
      components: {
        ...state.components,
        identity: { ...state.components.identity, [entityId]: identity },
        constituencyData: { ...state.components.constituencyData, [entityId]: constituencyData },
      },
    },
    entityId,
  };
}

// ============================================================================
// ISSUE FACTORY
// ============================================================================

export interface CreateIssueOptions {
  id: string;
  name: string;
  description?: string;
  category: 'economic' | 'social' | 'cultural' | 'environmental' | 'institutional';
  salience?: number;
  volatility?: number;
  polarization?: number;
}

export function createIssue(state: GameState, options: CreateIssueOptions): FactoryResult {
  const entityId = createEntityId('issue', options.id);
  
  const entities = [...state.entities, entityId];
  
  const identity: Identity = {
    name: options.name,
    description: options.description,
    type: 'issue',
    tags: [options.category],
  };
  
  const issueData: IssueData = {
    category: options.category,
    salience: options.salience ?? 50,
    volatility: options.volatility ?? 30,
    polarization: options.polarization ?? 50,
  };
  
  return {
    state: {
      ...state,
      entities,
      components: {
        ...state.components,
        identity: { ...state.components.identity, [entityId]: identity },
        issueData: { ...state.components.issueData, [entityId]: issueData },
      },
    },
    entityId,
  };
}

// ============================================================================
// EMPTY STATE FACTORY
// ============================================================================

export function createEmptyState(): GameState {
  return {
    entities: [],
    components: {
      identity: {},
      stats: {},
      relations: {},
      resources: {},
      transientStatus: {},
      partyPlatform: {},
      constituencyData: {},
      issueData: {},
      billData: {},
    },
    globals: {
      currentTurn: 1,
      currentPhase: 'setup',
      playerParty: '' as EntityId,
      electionHistory: [],
      coalitionHistory: [],
      difficulty: 'normal',
      autoCampaign: false,
    },
  };
}

// ============================================================================
// BATCH CREATION HELPERS
// ============================================================================

/**
 * Create multiple entities in sequence
 */
export function createEntities<T extends Record<string, unknown>>(
  state: GameState,
  factory: (state: GameState, options: T) => FactoryResult,
  optionsList: T[]
): { state: GameState; entityIds: EntityId[] } {
  const entityIds: EntityId[] = [];
  let currentState = state;
  
  for (const options of optionsList) {
    const result = factory(currentState, options);
    currentState = result.state;
    entityIds.push(result.entityId);
  }
  
  return { state: currentState, entityIds };
}
