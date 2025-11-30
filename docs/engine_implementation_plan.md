# Engine Implementation Plan: A Logic-First Approach

**Authored by:** The Logic Engineer

## 1. Guiding Principles

My work is guided by the following principles, which have been adhered to throughout Phase 2 implementation:

-   **Purity:** All core logic has been implemented as pure functions in the format `(state, payload) => newState`. There are no side effects within the engine.
-   **Immutability:** The state object is always treated as sacred. The engine never mutates the state directly, always returning a new, updated copy.
-   **Modularity:** Logic is organized into modules by domain (e.g., `election.ts`, `coalition.ts`, `government.ts`, `ai.ts`).
-   **Testability:** Every logical function has been designed for comprehensive unit testing.

## 2. Current Engine State

The engine has a robust foundation, and its components have been updated and implemented according to the plan.
-   `engine/simulations/election.ts`: Contains the D'Hondt method for seat allocation, now fully implemented and pure.
-   `engine/simulations/coalition.ts`: Now contains the core Friction system logic.
-   `engine/game.ts`: Contains the core game loop functions, now fully refactored into pure, modular functions.

## 3. Phase 2 Implementation Summary

The following functions and algorithms have been **fully implemented** in Phase 2, fulfilling the requirements of the Master Plan.

### 3.1. Feature: The "Friction" System - **[x] Implemented**

-   **Location:** `src/engine/simulations/coalition.ts`
-   **Public Function:** `calculateAllFrictions(parties: Record<PartyId, Party>, proposal: Stance[]): Map<PartyId, number>` - **[x] Implemented**
-   **Private Function:** `calculateFrictionForParty(party: Party, proposal: Stance[]): number` - **[x] Implemented**
-   **Game Theory Note:** Included in the code for clarity.

### 3.2. Feature: Formal Government Formation - **[x] Implemented**

-   **Location:** `src/engine/government.ts` (New file created)
-   **Public Function:** `validateGovernment(proposal: { partners: PartyId[], ministers: Politician[] }, gameState: GameState): { isValid: boolean; reason: string; }` - **[x] Implemented**

### 3.3. Feature: AI Decision Making - **[x] Implemented**

-   **Location:** `src/engine/ai.ts` (New file created)
-   **Public Function:** `decideToJoinCoalition(party: Party, frictionScore: number): boolean` - **[x] Implemented**
    -   A recommendation for a `negotiationThreshold` property on the `Party` type has been noted for the Systems Architect.

### 3.4. Technical Refactoring - **[x] Mostly Implemented**

-   **Task 4.1 (Migrate `useGameLogic.ts` to Pure Reducer Calls):** The `gameReducer` now handles `ActionResult` types. A final verification audit is the only remaining step here.
-   **Task 4.2 (Isolate Engine Logic):**
    -   `handleAction` and `endTurn` in `src/engine/game.ts` have been refactored into smaller, pure functions. - **[x] Implemented**
    -   `alert()` calls have been removed from all engine functions. - **[x] Implemented**
    -   `src/engine/coalition.ts` has been updated to use the new `validateGovernment` and remove obsolete logic. - **[x] Implemented**
    -   `src/engine/state.ts`'s `initParty` has been updated to use the new `stances` model. - **[x] Implemented (by Systems Architect)**

## 4. New Files/Modules Created

-   `src/engine/government.ts` - **[x] Created**
-   `src/engine/ai.ts` - **[x] Created**

All significant logic implementation and refactoring for Phase 2, as outlined in this plan, have been successfully completed. The engine is now in a clean, robust, and functional state, ready for comprehensive testing and integration with the Frontend.