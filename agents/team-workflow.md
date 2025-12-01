# The Agentic Development Team & Workflow

This document outlines the roles, responsibilities, and operational workflow of the AI development team for BelPolSim.

## 1. The Team

- **[The Belgian Politics Expert](./belgian_politics_expert.md):** The "Oracle". Provides requirements, historical context, and expert knowledge on the Belgian political system.
- **[The Product Manager](./product_manager.md):** The "Vision". Oversees the roadmap, prioritizes features, manages **Narrative Design**, and ensures the "Game Feel" is authentic.
- **[The Systems Architect](./systems_architect.md):** The "Blueprint". Responsible for data modeling (`src/types.ts`), defining interfaces, and maintaining `docs/TECHNICAL_ARCHITECTURE.md`.
- **[The Logic Engineer](./logic_engineer.md):** The "Engine". Writes the core game logic, algorithms, and mathematical functions in `src/engine/`.
- **[The Frontend Specialist](./frontend_specialist.md):** The "Face". Builds the UI components, designs **UX Flows**, and manages **Visual Assets**.
- **[The QA Engineer](./qa_engineer.md):** The "Guardian". Writes tests (`*.test.ts`), finds bugs, and maintains `docs/QA_STRATEGY.md`.
- **[The Playtester](./playtester.md):** The "Gamer". Focuses on **fun factor**, pacing, balance, and the overall **Player Experience**.

---

## 2. The Methodology

We follow a structured **Agentic Workflow** to ensure quality and consistency.

### Phase 1: Alignment (The "Board Meeting")
Before writing code, we align on the objective.
1.  **Review Status:** Check `docs/ROADMAP.md` and `docs/FEEDBACK_LOG.md`.
2.  **Define Goal:** What is the specific user value we are delivering?
3.  **Update Design:** If the feature is complex, update `docs/GAME_DESIGN.md` first.

### Phase 2: Planning
1.  **Create Plan:** Generate `implementation_plan.md`.
2.  **Architecture Check:** Systems Architect reviews if new types are needed.
3.  **UX/Narrative Check:** Product Manager & Frontend Specialist define the "flow" and "tone" before logic is written.

### Phase 3: Execution
1.  **Foundation:** Systems Architect updates `types.ts` and `state.ts`.
2.  **Logic:** Logic Engineer implements pure functions in `engine/`.
3.  **Verification (Logic):** QA Engineer writes unit tests.
4.  **Interface:** Frontend Specialist builds components using the new logic.

### Phase 4: Review & Documentation
1.  **Verify:** Run tests and manual checks.
2.  **Update Docs:** Update `docs/TECHNICAL_ARCHITECTURE.md` if models changed.
3.  **Log Feedback:** Update `docs/FEEDBACK_LOG.md` if items were addressed.
4.  **Walkthrough:** Create a `walkthrough.md` artifact to demonstrate the work.

---

## 3. The Feature Lifecycle (Step-by-Step)

**0. Feature Definition**
   - **Politics Expert** proposes mechanic (e.g., "Coalition Friction").
   - **Product Manager** approves and defines the *Narrative* (e.g., "Negotiations should feel tense").

**1. Design & UX**
   - **Frontend Specialist** outlines the *User Flow* (e.g., "Slider interaction -> Real-time emoji update").
   - **Systems Architect** defines the *Data Model* in `types.ts`.

**2. Core Implementation**
   - **Logic Engineer** implements the math in `engine/` (e.g., `calculateFriction()`).
   - **QA Engineer** writes unit tests for the math.

**3. UI Implementation**
   - **Frontend Specialist** connects the logic to React components.

**4. Integration & Polish**
   - **Integrator** (You) merges code.
   - **Playtester** simulates a session to check pacing and fun.
   - **Product Manager** reviews for "Game Feel".
