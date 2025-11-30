# QA Engineer's Test Plan - Phase 2 Engine Logic

**Authored by:** The QA Engineer (The "Guardian")

## 1. Guiding Principles

My goal is to ensure the BelPolSim engine is bug-free, robust, and that all logic behaves precisely as expected, adhering to the System Architect's data models and the Logic Engineer's pure function paradigm.

-   **Comprehensive Test Coverage:** Aim for high unit test coverage for all pure functions.
-   **Automated Testing:** All tests will be automated using `vitest`.
-   **Focus on Edge Cases:** Deliberately probe boundary conditions, invalid inputs, and unexpected scenarios.
-   **Behavioral Verification:** Ensure the simulation's mechanics accurately reflect the intended political realism.

## 2. Scope of Testing (Phase 2 Engine Logic)

This plan focuses on verifying the core engine logic implemented by the Logic Engineer for Phase 2.

### 2.1. Modules Under Test

-   **Electoral System:** `src/engine/simulations/election.ts` (`calculateDdHondtSeats`)
-   **Friction System:** `src/engine/simulations/coalition.ts` (`calculateFrictionForParty`, `calculateAllFrictions`)
-   **Government Validation:** `src/engine/government.ts` (`validateGovernment`)
-   **AI Decisions:** `src/engine/ai.ts` (`decideToJoinCoalition`)
-   **Core Game Loop Refactoring:** `src/engine/game.ts` (`handleAction` and its sub-functions, `endTurn` and its sub-functions)
-   **State Initialization:** `src/engine/state.ts` (`createInitialState`, `initParty`, `generateCandidates`)
-   **Hooks/Reducers:** `src/hooks/useGameLogic.ts` (`gameReducer`) - verifying correct state transitions based on pure engine outputs.

## 3. Test Strategy

### 3.1. Unit Tests (`*.test.ts`)

-   For every pure function identified above, a dedicated unit test file will be created (e.g., `election.test.ts`, `coalition.test.ts`, `government.test.ts`).
-   Tests will isolate the function under test, providing mocked inputs and asserting predictable outputs.

### 3.2. Integration Tests

-   Tests will verify the interaction between different engine modules (e.g., how `handleAction` affects polling, which then feeds into `calculateDdHondtSeats`, or how coalition proposals are processed through `calculateAllFrictions` and `validateGovernment`).
-   These tests will simulate larger portions of the game loop to catch issues that unit tests might miss.

### 3.3. Edge Case Testing (Pedantic Focus)

-   **Zero/Empty Inputs:** What happens if a constituency has 0 votes, 0 seats, or no eligible parties? What if a party has no stances?
-   **Boundary Conditions:**
    -   Polling numbers at 0% or 100%.
    -   Friction scores at 0 or 100.
    -   Exactly `MAJORITY_SEATS` needed for government.
    -   Min/Max values for `salience` (0-10) and `position` (0-100).
-   **Invalid States:** Although the types prevent many, explicitly test what happens with malformed data if possible (e.g., a party with no ID).
-   **Unique Belgian Rules:**
    -   **Cordon Sanitaire:** Test attempts to form coalitions with `isExtremist` parties.
    -   **Cabinet Parity:** Test scenarios with unequal Dutch/French ministers, ensuring the Prime Minister is correctly excluded from the count.

## 4. Detailed Test Cases (Examples for Implementation)

### 4.1. Electoral System: `src/engine/simulations/election.ts`

-   **Function:** `calculateDdHondtSeats`
-   **Test Cases:**
    -   **Basic Allocation:** `test('should correctly allocate seats in a simple scenario')`
        -   Input: 2 parties, 100 votes each, 10 seats, 0% threshold.
        -   Expected: 5 seats each.
    -   **Threshold Effect:** `test('should exclude parties below electoral threshold')`
        -   Input: 3 parties (60%, 35%, 5%), 10 seats, 5% threshold.
        -   Expected: 6 seats, 4 seats, 0 seats.
    -   **Multiple Seats:** `test('should correctly apply DdHondt successive division')`
        -   Input: 3 parties (40000, 30000, 20000 votes), 8 seats, 0% threshold.
        -   Expected: (e.g., 4, 3, 1 seats based on D'Hondt table).
    -   **Edge: Zero Votes/Seats:** `test('should handle zero votes or zero seats gracefully')`
        -   Input: All parties 0 votes; 0 seats.
        -   Expected: 0 seats for all.

### 4.2. Friction System: `src/engine/simulations/coalition.ts`

-   **Functions:** `calculateFrictionForParty`, `calculateAllFrictions`
-   **Test Cases:**
    -   **Perfect Alignment:** `test('should yield zero friction for identical stances')`
        -   Input: Party stances match proposal stances exactly.
        -   Expected: 0 friction.
    -   **Opposite Stances:** `test('should yield high friction for diametrically opposed stances')`
        -   Input: Party position 0, proposed 100, high salience.
        -   Expected: High friction.
    -   **Salience Impact:** `test('should weigh friction higher for high salience issues')`
        -   Input: Same position difference, but varying salience.
        -   Expected: Higher friction for higher salience.
    -   **Partial Overlap:** `test('should calculate friction only for issues with matching stances')`
        -   Input: Party has stance on only some issues in proposal.
        -   Expected: Friction only calculated for overlapping issues.
    -   **Edge: No Common Issues:** `test('should return zero friction if no common issues')`
        -   Input: Party and proposal have no issues in common.
        -   Expected: 0 friction.

### 4.3. Government Validation: `src/engine/government.ts`

-   **Function:** `validateGovernment`
-   **Test Cases:**
    -   **Valid Government:** `test('should return valid for a legitimate coalition')`
        -   Input: Majority seats, no extremists, cabinet parity met.
        -   Expected: `isValid: true`.
    -   **Insufficient Majority:** `test('should reject coalition without majority seats')`
        -   Input: Total seats < 76.
        -   Expected: `isValid: false`, appropriate reason.
    -   **Cordon Sanitaire Violation:** `test('should reject coalition with extremist party')`
        -   Input: Proposal includes `isExtremist: true` party.
        -   Expected: `isValid: false`, appropriate reason.
    -   **Cabinet Parity Violation:** `test('should reject coalition with unequal language ministers')`
        -   Input: Unequal Dutch/French ministers (excluding PM).
        -   Expected: `isValid: false`, appropriate reason.
    -   **Edge: No Ministers:** `test('should validate government with no ministers if parity is not applicable')`
        -   Input: Valid majority, no extremists, empty minister list.
        -   Expected: `isValid: true`.

### 4.4. AI Decisions: `src/engine/ai.ts`

-   **Function:** `decideToJoinCoalition`
-   **Test Cases:**
    -   **Below Threshold:** `test('should accept proposal if friction is below threshold')`
        -   Input: Friction = 40, Threshold = 50.
        -   Expected: `true`.
    -   **Above Threshold:** `test('should reject proposal if friction is above threshold')`
        -   Input: Friction = 60, Threshold = 50.
        -   Expected: `false`.
    -   **At Threshold:** `test('should reject proposal if friction is exactly at threshold')`
        -   Input: Friction = 50, Threshold = 50.
        -   Expected: `false`. (Based on `frictionScore < threshold`)

### 4.5. Core Game Loop Refactoring: `src/engine/game.ts`

-   **Functions:** `handleAction` (and its sub-functions), `endTurn` (and its sub-functions)
-   **Test Cases:**
    -   **Successful Action:** `test('should correctly apply action effects and update state for successful action')`
        -   Input: Valid `GameState`, `actionType` (e.g., 'canvas').
        -   Expected: Budget/Energy reduced, Polling changed, `eventLog` updated, `ActionResult.success = true`.
    -   **Resource Insufficiency:** `test('should return failure for insufficient resources')`
        -   Input: `GameState` with low budget/energy.
        -   Expected: `ActionResult.success = false`, state unchanged, appropriate message.
    -   **Polling Normalization:** `test('should ensure total polling always sums to 100% after action')`
        -   Input: Various actions changing polling.
        -   Expected: Sum of polling for eligible parties in constituency is 100%.
    -   **End Turn Progression:** `test('should advance week, reset energy, and update log on endTurn')`
        -   Input: `GameState`.
        -   Expected: `week` incremented, `energy` reset, `eventLog` updated, `parties` polling updated by AI.
    -   **Event Triggering:** `test('should trigger random event occasionally on endTurn')`
        -   Input: `GameState`.
        -   Expected: `currentEvent` is not null (probabilistic test, may need mocks).

## 5. Tooling & Execution

-   **Framework:** `vitest` will be used for all test suites.
-   **Location:** Test files will be co-located with their respective modules in `src/engine/` (e.g., `src/engine/simulations/election.test.ts`).
-   **Mocks:** Where necessary, parts of the `GameState` or external dependencies (like `Math.random`) will be mocked to ensure deterministic and isolated tests.

This plan will serve as the blueprint for ensuring the quality of the BelPolSim engine.
