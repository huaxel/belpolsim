# Code Review: Phase 2 Implementation

**Date:** 2025-12-01
**Reviewer:** Lead Developer
**Status:** Phase 2 In Progress - Critical Integration Gaps Identified

## 1. Executive Summary

The implementation of Phase 2 (Coalition & Ideology) is well underway. The core data structures for Issues and Stances are in place, and the UI for the Coalition Interface is visually complete. However, there are **critical integration gaps** between the UI components and the game engine logic, particularly regarding the government formation process. The application will likely crash or behave unexpectedly in its current state due to type mismatches and missing state properties.

## 2. Critical Bugs & Errors

### 2.1. Missing `playerPartyId` in GameState
-   **Severity:** **CRITICAL** (Runtime Error)
-   **Location:** `src/components/CoalitionInterface.tsx` (Line 24) vs `src/types.ts`
-   **Issue:** The component attempts to access `gameState.playerPartyId`, but this property does not exist on the `GameState` interface.
-   **Fix:** Add `playerPartyId: PartyId;` to the `GameState` interface in `src/types.ts` and initialize it (likely to `'player'`) in `src/engine/state.ts`.

### 2.2. Government Formation Data Flow Disconnect
-   **Severity:** **CRITICAL** (Logic Failure)
-   **Location:** `src/components/CoalitionInterface.tsx` vs `src/hooks/useGameLogic.ts` vs `src/engine/coalition.ts`
-   **Issue:**
    -   **UI:** `CoalitionInterface` attempts to call `onProposeGovernment` with a full proposal object: `{ partners, policyStances, ministriesOffered }`.
    -   **Hook:** `useGameLogic` exposes `formGovernment` which takes **no arguments** and dispatches a `FORM_GOVERNMENT` action with no payload.
    -   **Engine:** `src/engine/coalition.ts` ignores any input and creates a placeholder proposal with empty ministers.
-   **Consequence:** The player's negotiated stances and ministry offers are completely lost. The government validation will fail or be meaningless (e.g., Cabinet Parity check will always see 0 ministers).
-   **Fix:**
    1.  Update `FORM_GOVERNMENT` action in `src/actions.ts` to include the proposal payload.
    2.  Update `formGovernment` in `src/engine/coalition.ts` to accept and use this payload.
    3.  Update `useGameLogic.ts` to pass the payload from the UI to the dispatcher.

### 2.3. Prop Name Mismatch
-   **Severity:** **HIGH** (Integration Error)
-   **Location:** `src/components/GameView.tsx` vs `src/components/CoalitionInterface.tsx`
-   **Issue:** `GameView` passes `onFormGovernment={formGovernment}`, but `CoalitionInterface` expects `onProposeGovernment`.
-   **Fix:** Rename the prop in `CoalitionInterface` to `onFormGovernment` or update `GameView` to match.

## 3. Logic & Architecture Improvements

### 3.1. `validateGovernment` Integration
-   **Observation:** The `validateGovernment` function exists but is currently checking an empty minister list.
-   **Recommendation:** Once the data flow (2.2) is fixed, ensure that the `ministers` array is correctly constructed from the `ministriesOffered` data before being passed to validation. The UI currently only offers a *count* of ministries, not specific politicians. The engine will need a logic step to auto-assign the most suitable politicians from partner parties to fill these slots, or the UI needs to be expanded to select specific ministers (which might be out of scope for MVP Phase 2).
-   **Proposed Simplification:** For Phase 2, we might want to abstract "Cabinet Parity" to just checking if the *parties* involved can theoretically provide the balance, or randomly assign ministers in the background to satisfy the check.

### 3.2. Hardcoded Player ID
-   **Observation:** The player's party ID is often hardcoded as `'player'` or assumed.
-   **Recommendation:** Formalizing `playerPartyId` in the state (as per 2.1) is the correct long-term solution to allow for potentially playing as other parties in the future.

## 4. Next Steps (Prioritized)

1.  **Fix Types:** Add `playerPartyId` to `GameState`.
2.  **Fix Actions:** Update `FORM_GOVERNMENT` to carry the proposal payload.
3.  **Connect UI:** Align `GameView` and `CoalitionInterface` props.
4.  **Implement Logic:** Update `src/engine/coalition.ts` to actually process the proposal (assign ministers, apply negotiated stances).
