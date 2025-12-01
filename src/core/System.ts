/**
 * Abstract System Base Class
 * 
 * Implements the Template Method Pattern for game systems.
 * Each system follows a consistent lifecycle:
 *   1. validate() - Check if system should run
 *   2. preProcess() - Setup before main logic
 *   3. process() - Main system logic (abstract, must implement)
 *   4. postProcess() - Cleanup and event generation
 * 
 * Systems are stateless - they take GameState and return new GameState.
 * This enables:
 *   - Easy testing (pure functions)
 *   - Time travel debugging
 *   - Hot-swapping via Strategy Pattern
 */

import type {
  GameState,
  GamePhase,
  GameAction,
  ActionResult,
  GameEvent,
  EntityId,
  ISystem,
  IActionProcessor,
} from './types';

/**
 * Abstract base class for all game systems
 * Uses Template Method pattern for consistent system lifecycle
 */
export abstract class System implements ISystem {
  abstract readonly name: string;
  
  /**
   * Phases during which this system is active
   * Override in subclass to customize
   */
  protected abstract readonly activePhases: GamePhase[];

  /**
   * Template Method - Main entry point
   * Orchestrates the system lifecycle
   */
  public update(state: GameState): GameState {
    // Step 1: Validate
    if (!this.validate(state)) {
      return state;
    }

    // Step 2: Pre-process
    let processedState = this.preProcess(state);

    // Step 3: Main processing
    processedState = this.process(processedState);

    // Step 4: Post-process
    processedState = this.postProcess(processedState);

    return processedState;
  }

  /**
   * Check if this system should run in the current phase
   */
  public shouldRun(phase: GamePhase): boolean {
    return this.activePhases.includes(phase);
  }

  /**
   * Validate whether the system should execute
   * Override for custom validation logic
   */
  protected validate(state: GameState): boolean {
    return this.shouldRun(state.globals.currentPhase);
  }

  /**
   * Pre-processing hook
   * Override for setup logic before main processing
   */
  protected preProcess(state: GameState): GameState {
    return state;
  }

  /**
   * Main processing logic - MUST be implemented by subclasses
   */
  protected abstract process(state: GameState): GameState;

  /**
   * Post-processing hook
   * Override for cleanup or event generation
   */
  protected postProcess(state: GameState): GameState {
    return state;
  }

  // ============================================================================
  // HELPER METHODS FOR SUBCLASSES
  // ============================================================================

  /**
   * Safely update a component for an entity
   * Returns new state with updated component (immutable)
   */
  protected updateComponent<K extends keyof GameState['components']>(
    state: GameState,
    componentKey: K,
    entityId: EntityId,
    updates: Partial<GameState['components'][K][EntityId]>
  ): GameState {
    const currentComponent = state.components[componentKey][entityId];
    
    return {
      ...state,
      components: {
        ...state.components,
        [componentKey]: {
          ...state.components[componentKey],
          [entityId]: {
            ...currentComponent,
            ...updates,
          },
        },
      },
    };
  }

  /**
   * Update global state
   */
  protected updateGlobals(
    state: GameState,
    updates: Partial<GameState['globals']>
  ): GameState {
    return {
      ...state,
      globals: {
        ...state.globals,
        ...updates,
      },
    };
  }

  /**
   * Get all entities of a specific type
   */
  protected getEntitiesOfType(
    state: GameState,
    type: string
  ): EntityId[] {
    return state.entities.filter((id) => {
      const identity = state.components.identity[id];
      return identity?.type === type;
    });
  }

  /**
   * Check if entity has all required components
   */
  protected hasComponents(
    state: GameState,
    entityId: EntityId,
    ...componentKeys: (keyof GameState['components'])[]
  ): boolean {
    return componentKeys.every(
      (key) => state.components[key][entityId] !== undefined
    );
  }

  /**
   * Create a new event
   */
  protected createEvent(
    id: string,
    type: string,
    turn: number,
    title: string,
    description: string
  ): GameEvent {
    return {
      id: `event:${id}`,
      type,
      turn,
      title,
      description,
      effects: [],
      resolved: false,
    };
  }
}

/**
 * Abstract base class for systems that process player/AI actions
 * Extends System with action handling capabilities
 */
export abstract class ActionSystem extends System implements IActionProcessor {
  /**
   * Process an action and return the result
   */
  public processAction(state: GameState, action: GameAction): ActionResult {
    // Validate the action first
    const validation = this.validateAction(state, action);
    if (!validation.valid) {
      return {
        success: false,
        newState: state,
        events: [],
        error: validation.reason,
      };
    }

    // Deduct costs
    const newState = this.deductCosts(state, action);

    // Execute the action
    const result = this.executeAction(newState, action);

    return result;
  }

  /**
   * Get available actions for an actor
   */
  public abstract getAvailableActions(
    state: GameState,
    actor: EntityId
  ): GameAction[];

  /**
   * Validate if an action can be performed
   */
  public validateAction(
    state: GameState,
    action: GameAction
  ): { valid: boolean; reason?: string } {
    // Check if actor exists
    if (!state.entities.includes(action.actor)) {
      return { valid: false, reason: 'Actor does not exist' };
    }

    // Check if actor has required resources
    if (action.cost) {
      const resources = state.components.resources[action.actor];
      if (!resources) {
        return { valid: false, reason: 'Actor has no resources' };
      }

      if (action.cost.money && (resources.money ?? 0) < action.cost.money) {
        return { valid: false, reason: 'Insufficient funds' };
      }

      if (
        action.cost.politicalCapital &&
        (resources.politicalCapital ?? 0) < action.cost.politicalCapital
      ) {
        return { valid: false, reason: 'Insufficient political capital' };
      }

      if (
        action.cost.actionPoints &&
        (resources.actionPoints ?? 0) < action.cost.actionPoints
      ) {
        return { valid: false, reason: 'No action points remaining' };
      }
    }

    // Subclass-specific validation
    return this.validateActionSpecific(state, action);
  }

  /**
   * Subclass-specific action validation
   * Override to add custom validation rules
   */
  protected validateActionSpecific(
    state: GameState,
    action: GameAction
  ): { valid: boolean; reason?: string } {
    // Default implementation - override in subclasses
    void state;
    void action;
    return { valid: true };
  }

  /**
   * Execute the action - MUST be implemented by subclasses
   */
  protected abstract executeAction(
    state: GameState,
    action: GameAction
  ): ActionResult;

  /**
   * Deduct action costs from actor's resources
   */
  protected deductCosts(state: GameState, action: GameAction): GameState {
    if (!action.cost) {
      return state;
    }

    const resources = state.components.resources[action.actor];
    if (!resources) {
      return state;
    }

    const updatedResources = { ...resources };

    if (action.cost.money) {
      updatedResources.money = (updatedResources.money ?? 0) - action.cost.money;
    }

    if (action.cost.politicalCapital) {
      updatedResources.politicalCapital =
        (updatedResources.politicalCapital ?? 0) - action.cost.politicalCapital;
    }

    if (action.cost.actionPoints) {
      updatedResources.actionPoints =
        (updatedResources.actionPoints ?? 0) - action.cost.actionPoints;
    }

    return this.updateComponent(state, 'resources', action.actor, updatedResources);
  }
}

/**
 * PhaseTransitionSystem - Handles game phase transitions
 * Useful as a base for systems that trigger phase changes
 */
export abstract class PhaseTransitionSystem extends System {
  /**
   * Check if conditions are met to transition to next phase
   */
  protected abstract checkTransitionConditions(state: GameState): boolean;

  /**
   * Get the next phase to transition to
   */
  protected abstract getNextPhase(state: GameState): GamePhase;

  /**
   * Perform any cleanup before transitioning
   */
  protected onPhaseExit(state: GameState): GameState {
    return state;
  }

  /**
   * Perform any setup when entering new phase
   */
  protected onPhaseEnter(state: GameState, newPhase: GamePhase): GameState {
    void newPhase;
    return state;
  }

  protected postProcess(state: GameState): GameState {
    if (this.checkTransitionConditions(state)) {
      const nextPhase = this.getNextPhase(state);
      let newState = this.onPhaseExit(state);
      newState = this.updateGlobals(newState, { currentPhase: nextPhase });
      newState = this.onPhaseEnter(newState, nextPhase);
      return newState;
    }
    return state;
  }
}

/**
 * CompositeSystem - Runs multiple systems in sequence
 * Useful for grouping related systems
 */
export class CompositeSystem implements ISystem {
  readonly name: string;
  private readonly systems: ISystem[];

  constructor(name: string, systems: ISystem[]) {
    this.name = name;
    this.systems = systems;
  }

  public update(state: GameState): GameState {
    return this.systems.reduce(
      (currentState, system) => system.update(currentState),
      state
    );
  }

  public shouldRun(phase: GamePhase): boolean {
    return this.systems.some((system) => system.shouldRun(phase));
  }
}

/**
 * ConditionalSystem - Runs a system only if a condition is met
 * Decorator pattern for conditional execution
 */
export class ConditionalSystem implements ISystem {
  readonly name: string;
  private readonly system: ISystem;
  private readonly condition: (state: GameState) => boolean;

  constructor(
    system: ISystem,
    condition: (state: GameState) => boolean
  ) {
    this.name = `Conditional(${system.name})`;
    this.system = system;
    this.condition = condition;
  }

  public update(state: GameState): GameState {
    if (this.condition(state)) {
      return this.system.update(state);
    }
    return state;
  }

  public shouldRun(phase: GamePhase): boolean {
    return this.system.shouldRun(phase);
  }
}
