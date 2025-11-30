# BelPolSim: Definitive System Architecture & Data Models

**Authored by:** The Systems Architect

## 1. Overview

This document provides the single source of truth for the BelPolSim system architecture and core data models. It is designed to be modular, scalable, and provide a clear blueprint for development, incorporating the requirements for Phase 2 and beyond.

The core design separates the **Engine (logic)** from the **View (UI)**, with a central **State Management** layer acting as the intermediary.

## 2. High-Level Architecture

The system is divided into three primary layers:

1.  **UI Layer (React Components)**: Renders the game state and captures user input.
2.  **State Management Layer (React Hooks / `useReducer`)**: Holds the monolithic `GameState` and processes actions.
3.  **Engine Layer (Pure TypeScript Modules)**: Contains all core game logic, rules, and simulation algorithms.

```
+-------------------------------------------------------------+
|                     UI Layer (React)                        |
| <Header/> <Map/> <ActionGrid/> <CoalitionInterface/> ...    |
|       +                                                     |
|       | Dispatches actions (e.g., "FORM_COALITION")         |
|       v                                                     |
+-------------------------------------------------------------+
|             State Management Layer (useReducer)             |
|                                                             |
|   +-----------------+      +-----------------------------+  |
|   |   GameState     | <--> | Reducer & Action Dispatcher |  |
|   | (Single Object) |      | (Processes actions)         |  |
|   +-----------------+      +-----------------------------+  |
|             ^                           +                   |
|             | Updates State             | Calls Engine Logic|
|             +---------------------------+                   |
|                                         v                   |
+-------------------------------------------------------------+
|                Engine Layer (Pure TypeScript)               |
|                                                             |
|   +------------------+   +------------------+   +---------+ |
|   | Simulation       |   | Game Loop        |   | Event   | |
|   | (D'Hondt,         |   | (Turn/Phase Mgmt)|   | System  | |
|   |  Friction)       |   |                  |   |         | |
|   +------------------+   +------------------+   +---------+ |
+-------------------------------------------------------------+
```

## 3. Core Data Models (`src/types.ts`)

This is the definitive schema for the game's state. All development must adhere to these interfaces.

### 3.1. Foundational Types

```typescript
export type PartyId = 'nva' | 'ps' | 'mr' | 'vooruit' | 'vb' | 'ptb' | 'cdv' | 'lesengages' | 'groen' | 'ecolo' | 'openvld';
export type ConstituencyId = 'antwerp' | 'east_flanders' | 'west_flanders' | 'flemish_brabant' | 'limburg' | 'hainaut' | 'liege' | 'luxembourg' | 'namur' | 'walloon_brabant' | 'brussels_capital';
export type RegionId = 'flanders' | 'wallonia' | 'brussels';
export type Language = 'dutch' | 'french' | 'german';
export type CompetencyLevel = 'Federal' | 'Regional' | 'Community';
export type IssueId = 'taxation' | 'immigration' | 'environment' | 'security' | 'social_welfare' | 'state_reform';
```

### 3.2. Core Game State

```typescript
export interface GameState {
    turn: number; // Represents one week
    gamePhase: 'campaign' | 'election' | 'coalition_formation' | 'governing';
    playerPartyId: PartyId;
    
    // Game Resources
    budget: number;
    energy: number;
    
    // World State
    parties: Record<PartyId, Party>;
    constituencies: Record<ConstituencyId, Constituency>;
    issues: Record<IssueId, Issue>;
    
    // Government & Parliament
    government: Government | null; // The current ruling coalition
    parliament: Parliament;       // The 150 elected politicians

    // Event System
    eventLog: GameLogEntry[];
    currentEvent: GameEvent | null;
}

export interface Government {
    primeMinister: Politician;
    ministers: Politician[];
    coalitionPartners: PartyId[];
    agreement: Stance[]; // The negotiated policy positions
}

export interface Parliament {
    seats: Politician[]; // Length should always be 150
}
```

### 3.3. Actors: Parties & Politicians

```typescript
// Represents a political party
export interface Party {
    id: PartyId;
    name: string;
    color: string;
    ideology: {
        economic: number; // 0 (Left) to 100 (Right)
        social: number;   // 0 (Progressive) to 100 (Conservative)
    };
    isExtremist: boolean; // For Cordon Sanitaire
    
    // Core of the "Friction" system for Phase 2
    stances: Stance[];
    
    // Link to politicians
    candidates: Record<ConstituencyId, Politician[]>;
    totalSeats: number;
}

// Represents an individual politician
export interface Politician {
    id: string;
    name: string;
    partyId: PartyId;
    language: Language; // Crucial for Cabinet Parity
    constituency: ConstituencyId;
    
    // Stats for gameplay
    charisma: number;
    expertise: number;
    popularity: number; // Used for preference votes
    
    // Position in government
    isElected: boolean;
    ministerialRole: string | null;
}
```

### 3.4. Issues and Stances (For Phase 2 Friction System)

```typescript
// A political issue
export interface Issue {
    id: IssueId;
    name: string;
    description: string;
    competency: CompetencyLevel; // For future phases
}

// A party's position on an issue
export interface Stance {
    issueId: IssueId;
    position: number;  // 0-100, representing the party's ideal policy
    salience: number;  // 0-10, how important this issue is to the party
}
```

## 4. Architectural Constraints & Key Concepts

This architecture is designed to enforce the unique rules of the Belgian political system.

-   **Cordon Sanitaire**: Enforced in the `engine/coalition.ts` module. Any coalition proposal including a party with `isExtremist: true` will be rejected.
-   **Cabinet Parity**: Enforced when forming a `Government` object. The creation logic must validate that the number of `Politician` objects with `language: 'dutch'` equals the number with `language: 'french'`.
-   **Competency Limits**: The `Issue` data model includes a `competency` field. In future phases, the `engine/game.ts` `performAction` function will check if the acting minister's `competencyLevel` matches the issue's `competency` before allowing a policy change.

## 5. Data Flow Example for Phase 2: Coalition Negotiation

This example demonstrates how the new data models will work.

1.  **User Interaction**: In the `CoalitionInterface.tsx`, the player adjusts a slider for the 'taxation' issue.
2.  **Dispatch Action**: The component calls `dispatch({ type: 'UPDATE_COALITION_PROPOSAL', payload: { issueId: 'taxation', position: 45 } })`.
3.  **Reducer**: The `useGameLogic` reducer receives the action.
4.  **Engine Call**: The reducer calls a new function, `calculateAllFrictions(gameState, newProposal)`, from `src/engine/simulations/coalition.ts`.
5.  **Logic Execution**: The `calculateAllFrictions` function:
    -   Loops through all potential coalition partners.
    -   For each partner, it calculates a `frictionScore` by comparing the `newProposal` stances against the party's own `stances` array, weighted by `salience`.
    -   It returns a map of `{[partyId]: frictionScore}`.
6.  **State Update**: The reducer receives the friction scores and updates a `negotiationState` object within the main `GameState`.
7.  **UI Re-render**: The `CoalitionInterface.tsx` reads the updated friction scores and changes the "mood" emoji next to each party leader in real-time.

## 6. Directory Structure

The proposed directory structure from the previous version of this document remains valid. All new data models will reside in `src/types.ts` (or `src/types/index.ts`), and all new engine logic will be in the appropriate module within `src/engine/`.

