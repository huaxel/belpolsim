# BelPolSim Version History

## [v0.3.0] - The Legislative Engine (Current)
**Status:** 🟡 In Progress
**Focus:** Governing Phase, Legislation

**Key Features:**
- **Legislative System:** Bill proposal and voting logic.
- **Parliament UI:** Visualizing the democratic process.
- **Coalition Friction:** Balancing ideology vs. power.

**Documentation:**
- See `planning/v0.3.0-legislative-engine.md`.

---

## [v0.2.2] - Optimizations & Fixes
**Released:** 2025-12-02
**Status:** ✅ Stable

**Key Changes:**
- **Optimization:** Implemented cooldowns in `CampaignSystem` to prevent AI spam.
- **Fixes:** Refactored `VictoryWidget` to use safe ECS queries.
- **Stability:** Addressed architectural feedback from `issues.md`.

**Documentation:**
- See `planning/v0.2.2-optimizations.md`.

---

## [v0.2.1] - UI Verification & Stabilization
**Released:** 2025-12-01
**Status:** ✅ Stable

**Key Changes:**
- **Bug Fixes:** Resolved crash in `CampaignDashboard` (missing `demographics`).
- **Verification:** Validated "New Campaign" flow and `GameView` rendering.
- **Refinement:** Ensuring UI components correctly consume ECS `GameState`.

**Documentation:**
- See `planning/v0.2.1-ui-verification.md`.

---

## [v0.2.0] - Hybrid ECS Architecture
**Released:** 2025-12-01
**Status:** ✅ Stable

**Key Changes:**
- **Architecture:** Complete rewrite from OOP to Hybrid ECS
- **Core Engine:** Flat `Record<EntityId, T>` data storage for O(1) lookups
- **Systems:** Template Method pattern with `System`, `ActionSystem`, `PhaseTransitionSystem` base classes
- **Structure:** Feature-based folder organization (`src/core/`, `src/features/`, `src/shared/`)
- **Components:** Identity, Stats, Relations, Resources, TransientStatus + domain-specific

**Documentation:**
- See `planning/v0.2.0-hybrid-ecs.md` for full details.

---

## [v0.1.2] - Brand Identity ("Formateur")
**Released:** 2025-12-01
**Status:** ✅ Stable

**Key Features:**
- **Naming:** Rebranded to "Formateur"
- **Design System:** "Elegant Bureaucracy" (Charcoal/Gold/Cream)
- **UI:** Refactored Shell (Sidebar, TopBar, Layout)

**Documentation:**
- See `planning/v0.1.2-branding.md` for details.

---

## [v0.1.1] - The Governing Phase
**Released:** 2025-12-01
**Status:** ✅ Stable

**Key Features:**
- **Government Dashboard:** Cabinet View, Stability Meter, Budget Tracker
- **Legislative Engine:** Bill proposal, voting logic, pass/fail consequences

**Documentation:**
- See `planning/v0.1.1-governing_phase.md` for details.

---

## [v0.1.0] - MVP
**Released:** 2025-12-01
**Status:** ✅ Stable

**Key Features:**
- **Electoral Engine:** D'Hondt method, 5% threshold, 11 constituencies
- **Party System:** 11 Belgian parties with ideologies and regional restrictions
- **Coalition Builder:** Basic majority formation logic with Cordon Sanitaire
- **Campaign v1:** Basic action grid (TV, Radio, Posters)
- **UI:** Main dashboard, Map view, Parliament seating chart

**Documentation:**
- See `docs/README.md` for the current baseline.