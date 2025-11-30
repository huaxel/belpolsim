# BelPolSim: The Master Plan

**Authored by:** The Product Manager (The "Vision")

## 1. The Single Source of Truth

This document is the **only** official source of truth for the BelPolSim development roadmap and task list. It supersedes all previous planning documents.

**The following documents are now obsolete and have been deleted:**
-   `docs/agile_plan.md`
-   `docs/tasks.md`
-   `docs/TODO.md`
-   `docs/project_status_and_roadmap.md`
-   `docs/consolidated_design.md` (superseded by `SYSTEM_ARCHITECTURE.md`)

Having multiple sources of truth leads to confusion and wasted effort. From now on, we work from this plan.

## 2. High-Level Roadmap

Our development is divided into clear phases.

-   **Phase 1: MVP** - `[x] Done`
    -   A playable, basic game loop with D'Hondt elections and a simple majority-based coalition system.

-   **Phase 2: Coalition & Ideology Overhaul** - `[x] Engine Logic & Data Model Complete`
    -   Our current and sole focus. The goal is to make negotiations deep, strategic, and engaging. The core engine logic and data models for this phase are now robustly implemented.

-   **Phase 3 & 4: Future Vision** - `[ ] On Hold`
    -   Includes concepts like enhanced legislative mechanics and career immersion. These are not to be worked on until Phase 2 is complete.

## 3. Phase 2 Action Plan & Task Board

This is the official task list for completing Phase 2.

---

### **Feature 1: The "Friction" System (Top Priority)**

*The core of Phase 2. This feature introduces a deep negotiation model.*

-   **[x] Task 1.1 (Refactor Data Model):** Refactor the `Party` data model in `src/types.ts` to use a `stances` array (with `position` and `salience`) instead of simple `demands`.
    -   **Owner:** Systems Architect
-   **[x] Task 1.2 (Create Issue Data):** Create and populate the data for key political `Issues` (e.g., Taxes, Nuclear, State Reform) for all parties in `src/constants.ts`.
    -   **Owner:** Belgian Politics Expert (providing data), Systems Architect (implementing)
-   **[x] Task 1.3 (Build Friction Algorithm):** Build and unit-test the `calculateFriction` algorithm as a pure function in `src/engine/simulations/coalition.ts`.
    -   **Owner:** Logic Engineer
    -   **QA:** QA Engineer (to write unit tests)
-   **[x] Task 1.4 (Build Negotiation UI):** Overhaul the `CoalitionInterface.tsx` to include policy sliders and display the real-time "mood" and friction score of potential partners.
    -   **Owner:** Frontend Specialist

---

### **Feature 2: Dynamic Ideologies**

*Visualizing the political landscape.*

-   **[x] Task 2.1 (Implement 2D Compass):** Create a UI component to display parties and politicians on a 2D political compass (Economic & Social axes).
    -   **Owner:** Frontend Specialist
-   **[x] Task 2.2 (Integrate Ideology):** Use the ideology data in the game logic, particularly for AI decision-making during negotiations.
    -   **Owner:** Logic Engineer

---

### **Feature 3: Formal Government Formation**

*Adding procedural realism to the final step of forming a government.*

-   **[x] Task 3.1 (Implement Informateur/Formateur):** Add a simple UI flow (e.g., a modal with text from the King) to represent the *Informateur* and *Formateur* stages of the coalition phase.
    -   **Owner:** Frontend Specialist
-   **[x] Task 3.2 (Enforce Cabinet Parity):** Add the **Cabinet Parity** rule (equal numbers of Dutch and French-speaking ministers) as a final validation check when a government is formed.
    -   **Owner:** Logic Engineer
    -   **QA:** QA Engineer (to write tests for this specific rule)

---

### **Feature 4: Technical Refactoring**

*Improving the codebase to support future development.*

-   **[ ] Task 4.1 (Migrate to useReducer):** Refactor the main game state management in `useGameLogic.ts` from `useState` to `useReducer` to better handle complex actions.
    -   **Owner:** Logic Engineer / Integrator
    -   **Status:** `useReducer` pattern is in place, but a final audit is needed to ensure *all* called functions are pure and immutable.
-   **[x] Task 4.2 (Isolate Engine Logic):** Ensure all core game logic is moved out of React components and into pure TypeScript functions within the `/src/engine` directory. This included:
    -   `handleAction` and `endTurn` refactoring.
    -   Removal of `alert()` calls.
    -   Replacement of `src/engine/coalition.ts` logic.
    -   `src/engine/state.ts` update for `stances`.
    -   **Owner:** Logic Engineer / Integrator

---

### **New Architectural Task (Post-Logic Implementation Feedback)**

*Addressing a recommendation from the Logic Engineer for enhanced AI tunability.*

-   **[ ] Task 5.1 (Add `negotiationThreshold` to Party):** Add a `negotiationThreshold: number` property to the `Party` interface in `src/types.ts`. This will allow Product Management and the Belgian Politics Expert to tune AI party personalities.
    -   **Owner:** Systems Architect

---

This is our focus. No other tasks are to be considered until this board is cleared. Let's get to work.