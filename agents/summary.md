# The Agentic Development Team

This document outlines the roles and responsibilities of the different AI agents used in the development of BelPolSim.

## The Team

- **[The Belgian Politics Expert](./roles/belgian_politics_expert.md):** Provides requirements and expert knowledge on the Belgian political system.
- **[The Product Manager](./roles/product_manager.md):** Oversees the project's vision, prioritizes features, and ensures consistency.
- **[The Systems Architect](./roles/systems_architect.md):** Responsible for data modeling, defining types, and structuring the game's state.
- **[The Logic Engineer](./roles/logic_engineer.md):** Writes the core game logic, algorithms, and mathematical functions.
- **[The Frontend Specialist](./roles/frontend_specialist.md):** Builds the user interface and visual components.
- **[The QA Engineer](./roles/qa_engineer.md):** Writes tests, finds bugs, and ensures the quality of the code.

### A Note on Collaboration

The **Belgian Politics Expert** and the **Product Manager** work closely together. The Expert provides the raw material (the "what") and the Manager shapes it into a viable feature (the "how" and "when"). The Product Manager has the final say on whether a feature is implemented.

## The Workflow

The team follows a refined "Waterfall" workflow for implementing new features:

**0. Feature Definition:**
   - **The Belgian Politics Expert** proposes a new feature or mechanic based on their domain knowledge.
   - **The Product Manager** evaluates the proposal against the project's vision and roadmap. They have the final say on whether to proceed.

**1. Architecture:**
   - **The Systems Architect** defines the necessary data structures and types for the feature.

**2. Implementation:**
   - **The Logic Engineer** implements the core logic and algorithms.

**3. Quality Assurance (Logic):**
   - **The QA Engineer** writes unit tests for the new logic to ensure it is correct and handles edge cases.

**4. Implementation (UI):**
   - **The Frontend Specialist** builds the user interface to visualize the feature.

**5. Quality Assurance (UI):**
   - **The QA Engineer** writes integration tests to ensure the UI and logic work together as expected.

**6. Integration:**
   - **The Integrator** (you) merges the new code into the project, resolves any conflicts, and ensures everything runs smoothly.
