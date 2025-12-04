/**
 * Hybrid ECS Type System for Belgian Political Simulator
 * 
 * Architecture: Flat data structures (ECS-inspired) + OOP systems (Strategy/Template Method patterns)
 * 
 * Key Principles:
 * 1. EntityId: Simple string identifier for all game entities
 * 2. Flat Components: Record<EntityId, ComponentData> for O(1) lookups
 * 3. Stateless Systems: OOP classes that transform GameState -> GameState
 * 4. Strategy Pattern: Hot-swappable systems via interface contracts
 */

// ============================================================================
// ENTITY SYSTEM
// ============================================================================

/**
 * EntityId - A string type alias for all entity identifiers.
 * Examples: "party:nva", "politician:de-croo", "constituency:brussels"
 */
export type EntityId = string;

/**
 * Entity Type Prefixes - Convention for entity ID namespacing
 */
export type EntityType = 'party' | 'politician' | 'constituency' | 'issue' | 'bill' | 'event' | 'crisis';

/**
 * Helper to create typed entity IDs
 */
export const createEntityId = (type: EntityType, id: string): EntityId => `${type}:${id}`;

/**
 * Helper to extract entity type from ID
 */
export const getEntityType = (entityId: EntityId): EntityType | null => {
  const [type] = entityId.split(':');
  return ['party', 'politician', 'constituency', 'issue', 'bill', 'event', 'crisis'].includes(type)
    ? (type as EntityType)
    : null;
};

// ============================================================================
// CORE COMPONENTS
// ============================================================================

/**
 * Identity Component - Who/what the entity is
 * Every entity should have an Identity component
 */
export interface Identity {
  name: string;
  displayName?: string;
  description?: string;
  type: EntityType;
  tags?: string[];
  color?: string;
}

/**
 * Stats Component - Numerical attributes that change over time
 * Used for polling, approval, effectiveness, etc.
 */
export interface Stats {
  // Polling & Electoral
  nationalPolling?: number;          // 0-100, percentage
  constituencyPolling?: Record<EntityId, number>;  // Per-constituency polling
  seats?: number;                    // Current seat count
  projectedSeats?: number;           // Projected seats

  // Campaign Stats
  momentum?: number;                 // -100 to 100
  mediaPresence?: number;            // 0-100
  grassrootsStrength?: number;       // 0-100
  fundraising?: number;              // 0-100

  // Politician Stats
  charisma?: number;                 // 0-100
  competence?: number;               // 0-100
  loyalty?: number;                  // 0-100
  ambition?: number;                 // 0-100
  popularity?: number;               // 0-100

  // Campaign Stats (Per Constituency)
  campaignStats?: Record<EntityId, {
    awareness: number;
    favorability: number;
    enthusiasm: number;
  }>;

  // Government Stats
  approval?: number;                 // 0-100
  stability?: number;                // 0-100
  effectiveness?: number;            // 0-100
  cohesion?: number;                 // 0-100
}

/**
 * Relations Component - Relationships between entities
 * Supports party-party, politician-politician, party-politician relations
 */
export interface Relations {
  // Positive/negative sentiment toward other entities (-100 to 100)
  sentiment?: Record<EntityId, number>;

  // Coalition/alliance relationships
  coalitionPartner?: boolean;
  coalitionFriction?: number;         // 0-100, tension level

  // Hierarchical relationships
  memberOf?: EntityId;                // e.g., politician belongs to party
  representedConstituency?: EntityId; // e.g., politician runs in constituency
  leaderOf?: EntityId;                // e.g., politician leads party

  // Historical relationships
  formerCoalitionWith?: EntityId[];
  rivalries?: EntityId[];
  alliances?: EntityId[];
}

/**
 * Resources Component - Expendable assets
 * Money, political capital, influence, etc.
 */
export interface Resources {
  money?: number;                     // Campaign/party funds
  politicalCapital?: number;          // Spendable influence points
  actionPoints?: number;              // Per-turn actions
  influence?: number;                 // General influence level

  // Resource generation rates
  incomePerTurn?: number;
  capitalGenerationRate?: number;
}

/**
 * TransientStatus Component - Temporary states and effects
 * Modifiers, events, crises that expire
 */
export interface TransientStatus {
  // Active modifiers with expiration
  modifiers?: Modifier[];

  // Current state flags
  isInCrisis?: boolean;
  isUnderInvestigation?: boolean;
  isInCampaignMode?: boolean;
  isNegotiating?: boolean;

  // Cordon Sanitaire (Belgian-specific)
  isUnderCordonSanitaire?: boolean;

  // Temporary boosts/penalties
  pollingBoost?: number;
  approvalPenalty?: number;

  // Cooldowns
  lastActionTurn?: number;            // Turn number of last action
  negotiationCooldown?: number;       // Turns remaining
}

/**
 * Modifier - A temporary effect on an entity
 */
export interface Modifier {
  id: string;
  name: string;
  description?: string;
  effect: ModifierEffect;
  duration: number;                   // Turns remaining, -1 for permanent
  source?: EntityId;                  // What caused this modifier
  stackable?: boolean;
}

export interface ModifierEffect {
  stat?: keyof Stats;
  value?: number;
  multiplier?: number;                // 1.0 = no change, 1.5 = +50%
}

// ============================================================================
// DOMAIN-SPECIFIC COMPONENTS
// ============================================================================

/**
 * PartyPlatform - Policy positions for parties
 */
export interface PartyPlatform {
  // Position on issues (-100 to 100, left to right / against to for)
  positions: Record<EntityId, number>;

  // Priority issues
  priorityIssues: EntityId[];

  // Manifesto promises
  manifestoPromises?: string[];

  // Party Traits
  traits?: PartyTrait[];
}

/**
 * ConstituencyData - Electoral district information
 */
export interface ConstituencyData {
  region: 'flanders' | 'wallonia' | 'brussels';
  language: 'dutch' | 'french' | 'bilingual';
  seats: number;
  population: number;

  // Voting patterns
  historicalResults?: Record<EntityId, number>;  // Party -> vote share
  swingFactor?: number;                          // How volatile the constituency is

  // Demographics
  demographics?: {
    youth: number;
    retirees: number;
    workers: number;
    upper_class: number;
  };
}

/**
 * IssueData - Political issue information
 */
export interface IssueData {
  category: 'economic' | 'social' | 'cultural' | 'environmental' | 'institutional';
  salience: number;                              // 0-100, how important to voters
  volatility: number;                            // 0-100, how much it changes
  polarization: number;                          // 0-100, how divisive
}

/**
 * BillData - Legislation information
 */
export interface BillData {
  title: string;
  description: string;
  status: 'proposed' | 'committee' | 'debate' | 'vote' | 'passed' | 'rejected';
  sponsor: EntityId;
  cosponsors?: EntityId[];
  relatedIssues: EntityId[];
  votes?: {
    for: EntityId[];
    against: EntityId[];
    abstain: EntityId[];
  };
  voteBreakdown?: Record<EntityId, 'for' | 'against' | 'abstain'>; // Detailed record
}

// ============================================================================
// COMPONENT TABLES (FLAT STORAGE)
// ============================================================================

/**
 * ComponentTable - Flat storage for a component type
 * O(1) lookup by EntityId
 */
export type ComponentTable<T> = Record<EntityId, T>;

/**
 * All component tables in the game
 */
export interface Components {
  identity: ComponentTable<Identity>;
  stats: ComponentTable<Stats>;
  relations: ComponentTable<Relations>;
  resources: ComponentTable<Resources>;
  transientStatus: ComponentTable<TransientStatus>;

  // Domain-specific
  partyPlatform: ComponentTable<PartyPlatform>;
  constituencyData: ComponentTable<ConstituencyData>;
  issueData: ComponentTable<IssueData>;
  billData: ComponentTable<BillData>;
}

// ============================================================================
// GAME STATE
// ============================================================================

export interface PartyTrait {
  id: string;
  name: string;
  description: string;
  effect: ModifierEffect;
}

/**
 * GamePhase - Current phase of the game
 */
export type GamePhase =
  | 'setup'          // New: Party selection
  | 'campaign'
  | 'election'
  | 'consultation'   // King consults with parties
  | 'formation'      // Coalition negotiation
  | 'governing'
  | 'crisis'
  | 'gameOver';

/**
 * ElectionResult - Results from an election
 */
export interface ElectionResult {
  date: number;                                  // Turn number
  seats: Record<EntityId, number>;               // Party -> seats won
  votes: Record<EntityId, number>;               // Party -> vote count
  voteShare: Record<EntityId, number>;           // Party -> percentage
  constituencyResults: Record<EntityId, {
    seats: Record<EntityId, number>;
    voteShare: Record<EntityId, number>;
  }>;
  turnout: number;
}

/**
 * Coalition - Active governing coalition
 */
export interface Coalition {
  parties: EntityId[];
  primeMinister: EntityId;                       // Politician
  formationDate: number;                         // Turn number
  agreementText?: string;
  policyCompromises: Record<EntityId, number>;   // Issue -> agreed position
  portfolioAllocation: Record<string, EntityId>; // Ministry -> Party
  frictionLevel: number;                         // 0-100
  stabilityScore: number;                        // 0-100
  governmentStability?: number;                  // 0-100, overall health of the government
}

/**
 * Globals - Game-wide state not tied to entities
 */
export interface Globals {
  currentTurn: number;
  currentPhase: GamePhase;
  playerParty: EntityId;

  // Election state
  lastElectionResult?: ElectionResult;
  nextElectionTurn?: number;

  // Government state
  currentCoalition?: Coalition;
  governmentApproval?: number;

  // Consultation/Formation state
  informateur?: EntityId;
  formateur?: EntityId;
  consultationRound?: number;

  // Historical data
  electionHistory: ElectionResult[];
  coalitionHistory: Coalition[];

  // Game settings
  difficulty: 'easy' | 'normal' | 'hard';
  autoCampaign: boolean;
  selectedConstituency?: EntityId;
}

/**
 * GameState - The complete game state
 * This is what systems read and write
 */
export interface GameState {
  entities: EntityId[];                          // All active entity IDs
  components: Components;                        // All component tables
  globals: Globals;                              // Global game state
}

// ============================================================================
// ACTIONS & EVENTS
// ============================================================================

/**
 * GameAction - Player or AI action
 */
export interface GameAction {
  type: string;
  actor: EntityId;
  target?: EntityId;
  payload?: Record<string, unknown>;
  cost?: {
    money?: number;
    politicalCapital?: number;
    actionPoints?: number;
  };
}

/**
 * CampaignAction - Specific campaign actions
 */
export type CampaignActionType =
  | 'rally'
  | 'advertisement'
  | 'doorToDoor'
  | 'mediaAppearance'
  | 'debate'
  | 'fundraise'
  | 'attackAd'
  | 'policyAnnouncement';

export interface CampaignAction extends GameAction {
  type: CampaignActionType;
  constituency?: EntityId;
  issue?: EntityId;
}

/**
 * GameEvent - Something that happened in the game
 */
export interface GameEvent {
  id: EntityId;
  type: string;
  turn: number;
  title: string;
  description: string;
  effects: GameEffect[];
  choices?: EventChoice[];
  resolved: boolean;
}

export interface EventChoice {
  id: string;
  text: string;
  effects: GameEffect[];
  requirements?: EventRequirement[];
}

export interface EventRequirement {
  type: 'resource' | 'stat' | 'relation';
  target: EntityId;
  field: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  value: number;
}

export interface GameEffect {
  type: 'stat' | 'resource' | 'relation' | 'modifier' | 'event';
  target: EntityId;
  field?: string;
  value?: number;
  modifier?: Modifier;
  eventId?: EntityId;
}

/**
 * ActionResult - Result of processing an action
 */
export interface ActionResult {
  success: boolean;
  newState: GameState;
  events: GameEvent[];
  message?: string;
  error?: string;
}

// ============================================================================
// SYSTEM INTERFACE (for Strategy Pattern)
// ============================================================================

/**
 * System - Interface for all game systems
 * Enables hot-swapping via Strategy Pattern
 */
export interface ISystem {
  readonly name: string;

  /**
   * Update the game state for this system
   * Pure function: same input always produces same output
   */
  update(state: GameState): GameState;

  /**
   * Check if this system should run in the current phase
   */
  shouldRun(phase: GamePhase): boolean;
}

/**
 * ActionProcessor - Interface for systems that handle actions
 */
export interface IActionProcessor {
  /**
   * Process a player/AI action
   */
  processAction(state: GameState, action: GameAction): ActionResult;

  /**
   * Get available actions for an entity
   */
  getAvailableActions(state: GameState, actor: EntityId): GameAction[];

  /**
   * Validate if an action can be performed
   */
  validateAction(state: GameState, action: GameAction): { valid: boolean; reason?: string };
}

// ============================================================================
// QUERY HELPERS
// ============================================================================

/**
 * Query result with optional component data
 */
export interface EntityWithComponents<T extends Partial<Components>> {
  id: EntityId;
  components: {
    [K in keyof T]: T[K] extends ComponentTable<infer V> ? V | undefined : never;
  };
}

/**
 * Common query patterns
 */
export type PartyQuery = EntityWithComponents<Pick<Components, 'identity' | 'stats' | 'resources' | 'partyPlatform'>>;
export type PoliticianQuery = EntityWithComponents<Pick<Components, 'identity' | 'stats' | 'relations'>>;
export type ConstituencyQuery = EntityWithComponents<Pick<Components, 'identity' | 'constituencyData'>>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * DeepPartial - Recursively make all properties optional
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Immutable - Make all properties readonly recursively
 */
export type Immutable<T> = {
  readonly [P in keyof T]: T[P] extends object ? Immutable<T[P]> : T[P];
};

/**
 * StateUpdater - Function that transforms game state
 */
export type StateUpdater = (state: GameState) => GameState;

/**
 * Middleware - Function that wraps a state updater
 */
export type Middleware = (next: StateUpdater) => StateUpdater;
