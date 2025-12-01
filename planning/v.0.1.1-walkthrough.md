# Walkthrough - v0.1.1: The Governing Phase

**Status:** ✅ Complete
**Version:** v0.1.1

## 1. Overview
This update introduces the **Governing Phase**, allowing players to transition from coalition formation to active governance. The core feature is the **Government Dashboard** and the **Legislative Engine**.

## 2. Key Features

### 2.1. Government Dashboard
A new dedicated view for the Prime Minister.
-   **Cabinet View:** Displays the PM and Ministers.
-   **Stability Meter:** Tracks government stability (starts at 50% or based on coalition friction).
-   **Budget Tracker:** Shows National Revenue, Expenses, and Deficit.
-   **Action Panel:** Allows proposing new legislation.

### 2.2. Legislative Engine
A system for passing laws.
-   **Bill Proposal:** Players select an Issue and a Target Position.
-   **Voting Logic:**
    -   Coalition partners vote YES (party discipline).
    -   Opposition votes based on ideological proximity.
    -   Requires 76 votes to pass.
-   **Consequences:**
    -   **Pass:** Public Approval increases, Policy changes.
    -   **Fail:** Government Stability drops (-10%).

## 3. Technical Changes

### 3.1. Architecture (`src/types.ts`)
-   Added `Bill` interface.
-   Updated `GameState` with `bills`, `nationalBudget`, `governmentStability`.

### 3.2. Logic (`src/engine/legislation.ts`)
-   Implemented `calculateVote(bill, state)`: Determines how each party votes.
-   Implemented `applyBillEffects(bill, state)`: Updates state after a bill passes.

### 3.3. UI (`src/components/GovernmentDashboard.tsx`)
-   Created the dashboard component with Lucide icons.
-   Integrated into `GameView.tsx` with conditional rendering for `gamePhase === 'governing'`.

## 4. Verification Results

### 4.1. Build Status
-   `npm run build`: **SUCCESS** (Clean build, no lint errors).

### 4.2. Manual Test Plan
1.  **Start Game:** Play through Campaign (or load save).
2.  **Election:** Finish turn 8.
3.  **Formation:** Form a coalition with >76 seats.
4.  **Transition:** Click "Form Government". Verify transition to Government Dashboard.
5.  **Legislation:**
    -   Propose a bill (e.g., Taxation -> 80).
    -   Verify vote count (should pass if coalition is strong).
    -   Verify "Bill Passed" message and Stability/Approval update.
