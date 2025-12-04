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
  PartyTrait,
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
  traits?: PartyTrait[];
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
    color: options.color,
  };

  // Create stats
  const stats: Stats = {
    nationalPolling: options.nationalPolling ?? 10,
    seats: options.seats ?? 0,
    momentum: options.momentum ?? 0,
    constituencyPolling: {},
    campaignStats: {},
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
    traits: options.traits ?? [],
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
    representedConstituency: options.constituencyId,
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
  demographics?: {
    youth: number;
    retirees: number;
    workers: number;
    upper_class: number;
  };
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
    demographics: options.demographics ?? {
      youth: 0.25,
      retirees: 0.25,
      workers: 0.3,
      upper_class: 0.2,
    },
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

// ============================================================================
// SCENARIO FACTORY
// ============================================================================

export interface ScenarioOptions {
  playerPartyId: string; // The ID of the party the player selected (e.g. 'socialist', 'liberal')
}

export function createScenarioState(options: ScenarioOptions): GameState {
  let state = createEmptyState();

  // 1. Create Issues
  const issueResult = createEntities(state, createIssue, [
    { id: 'economy', name: 'Economic Growth', category: 'economic' as const, salience: 80 },
    { id: 'environment', name: 'Climate Action', category: 'environmental' as const, salience: 60 },
    { id: 'immigration', name: 'Immigration Control', category: 'social' as const, salience: 70 },
  ]);
  state = issueResult.state;

  // 2. Create Constituencies
  const constResult = createEntities(state, createConstituency, [
    { id: 'brussels', name: 'Brussels-Capital', region: 'brussels' as const, language: 'bilingual' as const, seats: 15, population: 1200000 },
    { id: 'antwerp', name: 'Antwerp', region: 'flanders' as const, language: 'dutch' as const, seats: 20, population: 1800000 },
    { id: 'liege', name: 'Liège', region: 'wallonia' as const, language: 'french' as const, seats: 15, population: 1100000 },
  ]);
  state = constResult.state;

  // 3. Create Parties
  // We define the presets here. The player will take control of one of them.
  // 3. Create Parties
  // We define the presets here. The player will take control of one of them.
  const partyOptions: CreatePartyOptions[] = [
    {
      id: 'socialist',
      name: 'Socialist Party',
      color: '#ef4444',
      ideology: 'left',
      seats: 28,
      money: 60000,
      traits: [{ id: 'pillar', name: 'The Pillar', description: 'Strong union ties', effect: { stat: 'grassrootsStrength', value: 20 } }],
      positions: { economy: -60, environment: 40, immigration: 20 },
    },
    {
      id: 'liberal',
      name: 'Liberal Reformists',
      color: '#3b82f6',
      ideology: 'center-right',
      seats: 32,
      money: 90000,
      traits: [{ id: 'blue_factory', name: 'Blue Factory', description: 'High fundraising', effect: { stat: 'fundraising', value: 20 } }],
      positions: { economy: 80, environment: 0, immigration: -10 },
    },
    {
      id: 'flemish',
      name: 'Flemish Alliance',
      color: '#f59e0b',
      ideology: 'conservative-regionalist',
      seats: 35,
      money: 70000,
      traits: [{ id: 'community_first', name: 'Community First', description: 'High popularity in Flanders', effect: { stat: 'momentum', value: 10 } }],
      positions: { economy: 60, environment: -20, immigration: -40 },
    },
    {
      id: 'green',
      name: 'The Ecologists',
      color: '#22c55e',
      ideology: 'green',
      seats: 18,
      money: 35000,
      traits: [{ id: 'climate_vanguard', name: 'Climate Vanguard', description: 'Bonus from environmental issues', effect: { stat: 'momentum', value: 10 } }],
      positions: { economy: -30, environment: 90, immigration: 60 },
    },
    {
      id: 'far_right',
      name: 'Flemish Interest',
      color: '#000000', // Often black or yellow/black
      ideology: 'far-right',
      isExtremist: true,
      seats: 22,
      money: 45000,
      traits: [{ id: 'secure_borders', name: 'Secure Borders', description: 'High populist appeal', effect: { stat: 'momentum', value: 20 } }],
      positions: { economy: 40, environment: -40, immigration: -90 },
    },
    {
      id: 'workers',
      name: 'Workers\' Party',
      color: '#7f1d1d',
      ideology: 'radical-left',
      isExtremist: true,
      seats: 15,
      money: 20000,
      traits: [{ id: 'class_struggle', name: 'Class Struggle', description: 'High volatility', effect: { stat: 'momentum', value: 20 } }],
      positions: { economy: -90, environment: 60, immigration: 40 },
    }
  ];

  const partyResult = createEntities(state, createParty as any, partyOptions as any);
  state = partyResult.state;

  // 4. Set Player Party
  // We look for the party that matches the selected ID.
  // Note: createParty prefixes IDs with 'party:'.
  const targetId = `party:${options.playerPartyId}`;
  if (state.entities.includes(targetId)) {
    state.globals.playerParty = targetId;
  } else {
    // Fallback if ID not found (should not happen if UI is correct)
    console.error(`Player party ${targetId} not found, defaulting to first party.`);
    state.globals.playerParty = partyResult.entityIds[0];
  }

  // 5. Create Politicians (Leaders)
  const politicians: CreatePoliticianOptions[] = partyResult.entityIds.map((partyId, index) => ({
    id: `leader_${index}`,
    name: `Leader of ${state.components.identity[partyId].name}`,
    partyId: partyId,
    isLeader: true,
    charisma: 50 + Math.floor(Math.random() * 30),
  }));

  const polResult = createEntities(state, createPolitician as any, politicians as any);
  state = polResult.state;

  // 6. Set Phase & Defaults
  state.globals.currentPhase = 'campaign'; // Start game in campaign mode
  state.globals.selectedConstituency = constResult.entityIds[0]; // Default to first constituency (Brussels)

  return state;
}
