# BelPolSim: Development Roadmap

**Version:** 2.0
**Status:** Active

## 1. The Single Source of Truth

This document is the **only** official source of truth for the BelPolSim development roadmap and task list. It supersedes all previous planning documents.

## 2. High-Level Roadmap

Our development is divided into clear phases.

-   **Phase 1: MVP** - `[x] Done`
    -   A playable, basic game loop with D'Hondt elections and a simple majority-based coalition system.

-   **Phase 2: Coalition & Ideology Overhaul** - `[x] Complete`
    -   Deep coalition negotiations with friction, cordon sanitaire, and ideology matching.

-   **Phase 2.5: Campaign UX & Strategic Depth** - `[x] Complete`
    -   **Campaign v2 Engine:** Awareness/Favorability/Enthusiasm model.
    -   **War Room UI:** Interactive dashboard with demographics and projections.
    -   **Smart Features:** AI recommendations and Auto-Campaign system.
    -   **Strategic Actions:** Negative campaigning, rallies, and media blitzes.

-   **Phase 3: The Governing Phase** - `[ ] In Progress`
    -   The game shouldn't end when the government is formed. This phase introduces the challenges of ruling: passing laws, managing the budget, and keeping the coalition together.

-   **Phase 4: Future Vision** - `[ ] On Hold`
    -   Includes concepts like regional governments and career immersion.

## 3. Phase 3 Action Plan & Task Board

This is the official task list for completing Phase 3.

---

### **Feature 1: The Government Dashboard**

*The command center for the Prime Minister.*

-   **[x] Task 1.1 (Data Model Expansion):** Update `GameState` in `src/types.ts` to include `government` (ministers, stability score) and `nationalBudget` (distinct from campaign funds).
    -   **Owner:** Systems Architect
-   **[x] Task 1.2 (Create Government View):** Create `src/components/GovernmentView.tsx` to display the cabinet, stability, and national stats.
    -   **Owner:** Frontend Specialist
-   **[x] Task 1.3 (Transition Logic):** Update `formGovernment` in `src/engine/coalition.ts` to transition `gamePhase` to `'governing'` instead of setting `isGameOver` to true.
    -   **Owner:** Logic Engineer

---

### **Feature 2: The Legislative Engine**

*Passing laws is harder than making promises.*

-   **[ ] Task 2.1 (Bill Proposal UI):** Create a UI for the player to draft a bill (select Issue + Position).
    -   **Owner:** Frontend Specialist
-   **[ ] Task 2.2 (Parliamentary Voting Logic):** Implement `voteOnBill(bill)` in `src/engine/legislation.ts`.
    -   **Logic:**
        -   Coalition partners generally vote YES.
        -   Opposition votes based on their ideology/stances.
        -   **Crucial Twist:** If a bill deviates too far from the Coalition Agreement (negotiated in Phase 2), coalition partners may rebel or the government stability drops.
    -   **Owner:** Logic Engineer

---

### **Feature 3: Crisis & Stability**

*Events that test the coalition.*

-   **[ ] Task 3.1 (Crisis Events):** Create a new set of `GameEvent`s specific to the governing phase (e.g., "Budget Deficit", "Minister Scandal").
    -   **Owner:** Belgian Politics Expert / Systems Architect
-   **[ ] Task 3.2 (Stability Mechanic):** Implement logic where low stability leads to a "Fall of Government" (Game Over).
    -   **Owner:** Logic Engineer

---

This is our focus. No other tasks are to be considered until this board is cleared. Let's get to work.
