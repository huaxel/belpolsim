# Development Roadmap: Phase 2 (Coalition & Realism)

**Authored by:** The Product Manager
**Date:** 2025-12-01
**Status:** Active

This document outlines the development plan to bridge the gap between our current MVP (Phase 1) and the "Realistic Simulation" requirements (Phase 2).

---

## 1. System Architect

**Focus:** Data structures, State Management, and Scalability.

### ✅ Done
*   **Core Types:** Defined `GameState`, `Party`, `Politician`, `Constituency`.
*   **Event System:** Basic structure for `GameEvent` and `EventChoice`.
*   **Module Architecture:** Separation of concerns between `engine/`, `components/`, and `hooks/`.

### 🚧 To Do (High Priority)
*   **[ ] Define "Government Formation" State Machine:**
    *   Current: `campaign` -> `election` -> `coalition_formation` -> `governing`.
    *   New: `campaign` -> `election` -> `consultation` (King) -> `formation` (Informateur/Formateur) -> `governing`.
*   **[ ] Design "Coalition Agreement" Data Structure:**
    *   Need a robust way to store "agreed policies" vs "party stances" to calculate government stability over time.
*   **[ ] Refactor `Politician` for List Management:**
    *   Add `listPosition` (mutable) vs `originalListPosition` (immutable).

---

## 2. Logic Engine Developer

**Focus:** Game Rules, Algorithms, and AI Behavior.

### ✅ Done
*   **Electoral Logic:** D'Hondt method, 5% threshold, seat allocation.
*   **Basic Coalition Logic:** `toggleCoalitionPartner` with Cordon Sanitaire check.
*   **Government Validation:** Majority check, Cabinet Parity check.

### 🚧 To Do (High Priority)
*   **[ ] Implement "The King's Consultation":**
    *   Logic to determine who the King appoints as Informateur based on election results (usually winner, but not always).
*   **[ ] Implement "Informateur" Mechanics:**
    *   Calculate "Friction Score" between potential partners.
    *   Success condition: Find a combination of parties with >76 seats and <Threshold friction.
*   **[ ] Implement "Coalition Agreement" Logic:**
    *   Calculate "Policy Distance" between partners.
    *   Logic for "Compromise": How much stability is lost when a party agrees to a policy far from their stance?
*   **[ ] Refine Campaign Actions (Realism):**
    *   **Language Split:** Restrict TV Ads to specific regions.
    *   **Preference Votes:** New action to boost specific candidate popularity.

---

## 3. Frontend Developer

**Focus:** User Interface, UX Flow, and Visual Feedback.

### ✅ Done
*   **Main Game Loop:** `GameView` switching between Dashboard, Map, Parliament.
*   **Visuals:** Dark theme, "Paradox-style" dashboard.
*   **Basic Interaction:** Action buttons, Event modal, Simple Coalition toggle.

### 🚧 To Do (High Priority)
*   **[ ] "King's Palace" Interface:**
    *   A dedicated view for the post-election consultation phase.
    *   Narrative-heavy, distinct from the main dashboard.
*   **[ ] "Coalition Negotiation" Table:**
    *   **Policy Sliders:** UI to negotiate specific issues (e.g., "Tax Rate: Left vs Right").
    *   **Minister Assignment:** Drag-and-drop interface to assign specific politicians to ministries (Prime Minister, Finance, etc.).
*   **[ ] "Party List" Editor:**
    *   UI to view and reorder candidates in each constituency before the election.
*   **[ ] Region-Specific Campaigning:**
    *   Update `ActionGrid` to force region selection for media actions.

---

## 4. QA & Balancing

**Focus:** Bug hunting and "Fun Factor".

### 🚧 To Do
*   **[ ] Verify "Cordon Sanitaire" Stability:** Ensure AI never breaks it.
*   **[ ] Balance "Campaign Costs":** Ensure money/energy economy feels tight but fair.
*   **[ ] Test "Government Collapse":** Verify that low stability actually leads to early elections.
