# BelPolSim: QA Strategy & Test Plan

**Version:** 2.0
**Status:** Active

## 1. Guiding Principles

My goal is to ensure the BelPolSim engine is bug-free, robust, and that all logic behaves precisely as expected.

-   **Comprehensive Test Coverage:** Aim for high unit test coverage for all pure functions.
-   **Automated Testing:** All tests will be automated using `vitest`.
-   **Focus on Edge Cases:** Deliberately probe boundary conditions, invalid inputs, and unexpected scenarios.
-   **Behavioral Verification:** Ensure the simulation's mechanics accurately reflect the intended political realism.

## 2. Scope of Testing

This plan focuses on verifying the core engine logic.

### 2.1. Modules Under Test

-   **Electoral System:** `src/engine/simulations/election.ts` (`calculateDdHondtSeats`)
-   **Friction System:** `src/engine/simulations/coalition.ts` (`calculateFrictionForParty`, `calculateAllFrictions`)
-   **Government Validation:** `src/engine/government.ts` (`validateGovernment`)
-   **AI Decisions:** `src/engine/ai.ts` (`decideToJoinCoalition`)
-   **Core Game Loop Refactoring:** `src/engine/game.ts` (`handleAction`, `endTurn`)
-   **State Initialization:** `src/engine/state.ts` (`createInitialState`, `initParty`)
-   **Campaign Logic:** `src/engine/campaignLogic.ts` (`calculateCampaignEffect`, `generateRecommendations`)

## 3. Test Strategy

### 3.1. Unit Tests (`*.test.ts`)

-   For every pure function identified above, a dedicated unit test file will be created (e.g., `election.test.ts`, `coalition.test.ts`).
-   Tests will isolate the function under test, providing mocked inputs and asserting predictable outputs.

### 3.2. Integration Tests

-   Tests will verify the interaction between different engine modules (e.g., how `handleAction` affects polling, which then feeds into `calculateDdHondtSeats`).
-   These tests will simulate larger portions of the game loop to catch issues that unit tests might miss.

### 3.3. Edge Case Testing (Pedantic Focus)

-   **Zero/Empty Inputs:** What happens if a constituency has 0 votes, 0 seats, or no eligible parties?
-   **Boundary Conditions:** Polling numbers at 0% or 100%. Friction scores at 0 or 100.
-   **Unique Belgian Rules:**
    -   **Cordon Sanitaire:** Test attempts to form coalitions with `isExtremist` parties.
    -   **Cabinet Parity:** Test scenarios with unequal Dutch/French ministers.

## 4. Tooling & Execution

-   **Framework:** `vitest` will be used for all test suites.
-   **Location:** Test files will be co-located with their respective modules in `src/engine/` (e.g., `src/engine/simulations/election.test.ts`).
-   **Mocks:** Where necessary, parts of the `GameState` or external dependencies (like `Math.random`) will be mocked to ensure deterministic and isolated tests.
