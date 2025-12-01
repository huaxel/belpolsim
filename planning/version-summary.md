# BelPolSim Version History

## [v0.2.0] - Hybrid ECS Architecture (Current)
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