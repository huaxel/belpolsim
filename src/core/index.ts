/**
 * BelPolSim Hybrid ECS Architecture
 * 
 * Main entry point for the game engine.
 * 
 * Architecture: Flat ECS data + OOP Systems (Strategy/Template Method patterns)
 * 
 * Usage:
 * ```typescript
 * import { 
 *   createEmptyState, 
 *   createParty, 
 *   System, 
 *   getAllParties 
 * } from '@/core';
 * 
 * // Initialize state
 * let state = createEmptyState();
 * 
 * // Create entities
 * const { state: newState, entityId } = createParty(state, { 
 *   id: 'nva', 
 *   name: 'N-VA' 
 * });
 * 
 * // Query state
 * const parties = getAllParties(newState);
 * ```
 */

// =============================================================================
// TYPES - All type definitions for the Hybrid ECS
// =============================================================================
export type {
  // Core Entity System
  EntityId,
  EntityType,
  
  // Components
  Identity,
  Stats,
  Relations,
  Resources,
  TransientStatus,
  Modifier,
  ModifierEffect,
  
  // Domain Components
  PartyPlatform,
  ConstituencyData,
  IssueData,
  BillData,
  
  // Component Storage
  ComponentTable,
  Components,
  
  // Game State
  GamePhase,
  ElectionResult,
  Coalition,
  Globals,
  GameState,
  
  // Actions & Events
  GameAction,
  CampaignActionType,
  CampaignAction,
  GameEvent,
  EventChoice,
  EventRequirement,
  GameEffect,
  ActionResult,
  
  // System Interfaces
  ISystem,
  IActionProcessor,
  
  // Query Types
  EntityWithComponents,
  PartyQuery,
  PoliticianQuery,
  ConstituencyQuery,
  
  // Utility Types
  DeepPartial,
  Immutable,
  StateUpdater,
  Middleware,
} from './types';

// Helper functions from types
export { createEntityId, getEntityType as getEntityTypeFromId } from './types';

// =============================================================================
// SYSTEM BASE CLASSES - Template Method + Strategy Pattern
// =============================================================================
export {
  System,
  ActionSystem,
  PhaseTransitionSystem,
  CompositeSystem,
  ConditionalSystem,
} from './System';

// =============================================================================
// FACTORIES - Entity creation functions
// =============================================================================
export {
  createEmptyState,
  createParty,
  createPolitician,
  createConstituency,
  createIssue,
  createEntities,
} from './factories';

export type {
  FactoryResult,
  CreatePartyOptions,
  CreatePoliticianOptions,
  CreateConstituencyOptions,
  CreateIssueOptions,
} from './factories';

// =============================================================================
// QUERIES - Pure functions to query GameState
// =============================================================================
export {
  // Entity queries
  entityExists,
  getEntityType,
  getIdentity,
  getEntityName,
  getEntitiesOfType,
  getEntitiesWithTag,
  
  // Party queries
  getAllParties,
  getPartyStats,
  getPartyResources,
  getPartyPlatform,
  getPartyPolling,
  getPartySeats,
  isUnderCordonSanitaire,
  getEligibleParties,
  getPartiesAboveThreshold,
  getPartyIssuePosition,
  getLeadingParty,
  
  // Politician queries
  getAllPoliticians,
  getPartyPoliticians,
  getPartyLeader,
  getPoliticianParty,
  
  // Constituency queries
  getAllConstituencies,
  getConstituencyData,
  getConstituenciesByRegion,
  getTotalSeats,
  
  // Issue queries
  getAllIssues,
  getIssuesByCategory,
  getMostSalientIssues,
  
  // Relation queries
  getSentiment,
  areCoalitionPartners,
  
  // Coalition queries
  getCoalitionSeats,
  hasMajority,
  calculateIdeologicalDistance,
  calculateCoalitionFriction,
  
  // Resource queries
  getPlayerResources,
  canAfford,
  
  // Phase queries
  isInPhase,
  isInCampaign,
  isInGoverning,
  
  // Electoral queries
  getPlayerMargin,
  projectSeats,
} from './queries';

// =============================================================================
// SYSTEMS - Game logic systems
// =============================================================================
export {
  // Campaign
  CampaignSystem,
  campaignSystem,
  ACTION_CONFIGS,
  
  // Election
  ElectionSystem,
  electionSystem,
  ELECTORAL_THRESHOLD,
  TOTAL_PARLIAMENT_SEATS,
  
  // Coalition
  CoalitionSystem,
  coalitionSystem,
  MAJORITY_THRESHOLD,
  
  // Governing
  GoverningSystem,
  governingSystem,
} from './systems';

export type { ActionConfig } from './systems';
