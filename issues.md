1. Establish User Intent:
The user is interacting with a complex software architecture conversation about migrating a political simulation game (BelPolSim / Formateur) from an Object-Oriented Programming (OOP) structure to a Hybrid Entity Component System (ECS).
The user has just uploaded a large number of files representing the current state of their codebase after an initial migration attempt. They specifically asked "feedback?".
This implies the user wants me to review the uploaded code against the architectural goals discussed previously (Hybrid ECS, flat data, OOP systems, specific file structures) and identify issues, "ghost component" risks, race conditions, or deviations from the plan.
2. Identify Relevant Files:
src/core/types.ts: This is the most critical file. It defines the data model. I need to check if it's truly flat (Record<Id, Data>) or if nesting remains.
src/core/System.ts: This defines the base System class. I need to verify if it implements the Template Method pattern correctly (update, process, etc.) and if it remains stateless.
src/core/systems/*.ts (campaign.ts, election.ts, etc.): These are the concrete implementations. I need to see if they follow the pattern, if they store state (bad), and how they query data.
src/core/queries.ts: This is the "Index" layer discussed. Does it provide safe accessors?
src/shared/hooks/useGameLogic.ts: This is the "Bridge" between React and ECS. I need to check how it dispatches actions and if it mutates state directly or uses the systems.
src/features/*/components/*.tsx: These are the UI components. Do they access data safely using IDs and queries, or do they rely on object references that might become "ghosts"?
3. Analysis & Critique Plan:
Architecture Check:
ECS Data: src/core/types.ts looks mostly good. GameState has entities and components. Components are Record<EntityId, T>. Good.
Hybrid Systems: src/core/System.ts defines System and ActionSystem. This aligns with the plan.
Ghost Components: The UI components (e.g., CampaignDashboard.tsx) seem to accept a GameState prop. This is a "Snapshot", which is good, but are they looking up data via IDs or traversing arrays? VictoryWidget.tsx has placeholder functions (calculateSeatProjections) that take GameState. This suggests the logic migration isn't fully hooked up yet.
Specific Issues to Look For:
Incomplete Migration: Many files have comments like // Placeholder functions - need to be implemented in core or // Type aliases for backwards compatibility. This is a major finding. The codebase is in a "half-migrated" state where the UI still expects old types but the core is new.
Type mismatches: useGameLogic.ts imports from @/core but also defines local type aliases that might conflict or hide issues.
Direct State Mutation: In useGameLogic.ts, the reducer calls handleAction (imported as coreHandleAction?). I need to check if coreHandleAction (which maps to ActionSystem) returns a new state or mutates. The ActionSystem in System.ts returns ActionResult with newState, which is correct (immutable).
"God Object" remnants: src/features/campaign/components/CampaignDashboard.tsx accesses gameState.parties.player.campaignStats. In the new types.ts, parties is not in GameState root; it's in components. This is a breaking error. The UI code is still written for the old architecture!
Actionable Feedback:
Critical Mismatch: The UI components are broken. They are trying to read gameState.parties but the new GameState (in src/core/types.ts) only has entities, components, and globals.
Bridge Repair: The useGameLogic hook needs to use selectors or queries to map the flat ECS state into the shape the UI expects, OR the UI needs to be rewritten to use useEntity(id) hooks.
Ghost Component Risk in UI: The UI is still iterating arrays (sortedParties.map). If a party is deleted from components but remains in a local state list, it will crash.
4. Synthesis:
The user has successfully scaffolded the backend (ECS Core), but the frontend is completely disconnected and will crash because it references properties (gameState.parties) that no longer exist on the root state object. The "Bridge" logic in useGameLogic.ts is also trying to polyfill types instead of converting data.
I will structure the response as a "Code Review" highlighting the success of the Core migration vs the critical failure of the UI integration.

Thought Process for Response Generation:

Acknowledge Success: The src/core folder is excellent. System.ts and types.ts exactly match the Hybrid ECS architecture we discussed.
Identify the "Breaking Change": The UI components (CampaignDashboard, etc.) are importing World (aliased as GameState) but accessing properties like gameState.parties. In the new types.ts, GameState has components, not parties. The parties data is hidden inside state.components.identity and state.components.stats.
Explain the "Bridge" Problem: The user hasn't updated the UI to query the ECS. They are trying to treat the ECS state like the old OOP state.
Provide the Fix (The Selector Pattern): Show how to write a useParty hook or a selector function that safely extracts data from the flat ECS state for the UI to consume.
Highlight "Ghost Components" in the new code: Point out that CampaignDashboard relies on selectedConstituency ID. If that ID isn't validated against state.entities every render, it could crash if the constituency is removed.
This looks like a solid plan. The user needs to know their UI is currently incompatible with their Engine.

Analysis of specific files:

src/core/types.ts: GameState has entities, components, globals. Correct.
src/shared/hooks/useGameLogic.ts:
Imports World (which is GameState).
In UPDATE_AUTO_CAMPAIGN, it tries to do ...state.parties. ERROR: state.parties does not exist on the new GameState.
src/features/campaign/components/CampaignDashboard.tsx:
Accesses gameState.parties.player. ERROR.
src/core/queries.ts: Contains helper functions like getPartyPolling. These are the correct way to access data. The UI should be using these!
Conclusion: The user has the tools (queries.ts) but isn't using them in the UI or Hooks layer. They are mixing paradigms. I need to guide them to use the queries in the UI.

Final Output Structure:

The Good: Praise the System class and types.ts.
The Critical Error: The "Disconnect" between UI and Engine.
The Solution: How to use queries.ts in React components.
Refined Task: Fix useGameLogic and one UI component as an example.

Diagram Opportunity:

A diagram showing the data flow [ECS State] -> [Selectors/Queries] -> [React Components] would be very helpful here to explain why direct access fails.
Trigger:
Let's write the response.

Response Construction

User Intent: The user wants feedback on their Hybrid ECS implementation for a political simulation game.
Identified Files: src/core/types.ts, src/core/System.ts, src/core/queries.ts, src/shared/hooks/useGameLogic.ts, src/features/campaign/components/CampaignDashboard.tsx.
Insufficient Info? No, the code provided is sufficient to spot the architectural mismatch.
Key Insight: The backend is ECS, but the frontend is still OOP. The GameState interface in core does not match what useGameLogic and components are accessing.
Plan:
Validate the Core (Good job).
Identify the UI Crash (Breaking changes).
Teach the "Selector Pattern" using their own queries.ts.
Challenge the "Placeholder" functions in components.
(Self-Correction during drafting): Make sure to point out src/core/systems/campaign.ts uses process correctly. It modifies state immutably. This is good.
I will focus heavily on src/shared/hooks/useGameLogic.ts because that is where the "Bridge" is failing. It tries to manually mutate state.parties which doesn't exist.
Let's go.
This is a huge step forward. Your backend (src/core/) is a textbook implementation of the Hybrid ECS pattern we discussed.
You have successfully:
Flattened the Data: src/core/types.ts correctly defines ComponentTable<T> and a flat GameState.
Decoupled Logic: System.ts uses the Template Method perfectly (update calls process).
Implemented Strategy: The campaignSystem is stateless and operates purely on the state passed to it.
However, you have a critical architectural disconnect. Your UI (Frontend) is still trying to speak OOP, while your Engine (Backend) is speaking ECS. Your application will crash immediately because your React components are trying to read properties that no longer exist.
Here is the critique and the bridge you need to build.

1. The "Breaking Change" You Missed

Look at src/core/types.ts. Your GameState structure is:

TypeScript


export interface GameState {
  entities: EntityId[];
  components: Components; // <--- The data is here
  globals: Globals;
}


Now look at src/shared/hooks/useGameLogic.ts (and your UI components):

TypeScript


// ERROR: 'parties' does not exist on GameState! 
// It is inside state.components.identity and state.components.stats
case 'UPDATE_AUTO_CAMPAIGN': {
    return {
        ...state,
        parties: { ... } // <--- THIS WILL CRASH
    };
}


You have successfully migrated the engine, but your UI and Hooks are still expecting the old "God Object" structure (state.parties.player).

2. The Solution: The "Selector" Bridge

Do not rewrite your UI to read state.components.stats['party:nva'] directly. That is fragile.
Instead, use the Queries you already wrote in src/core/queries.ts as Selectors.
Refactoring CampaignDashboard.tsx:
Bad (Current):

TypeScript


// Tries to access non-existent deep property
const currentStats = gameState.parties.player.campaignStats[selectedConstituency];


Good (The Bridge):

TypeScript


import { getPartyStats, getPartyResources } from '@/core';

// ... inside component ...
const CampaignDashboard = ({ gameState, playerId }) => {
    // 1. Use the Query function to safely extract data
    // This handles the "Ghost Component" check internally!
    const partyStats = getPartyStats(gameState, playerId);
    const resources = getPartyResources(gameState, playerId);

    // 2. Guard Clause for React
    if (!partyStats || !resources) return <div>Loading Party Data...</div>;

    return (
        <div>Budget: {resources.money}</div>
    );
}



3. The "Ghost Component" Trap in Your Queries

I reviewed src/core/queries.ts. You have a subtle risk here:

TypeScript


export function getPartyPolling(state: GameState, partyId: EntityId): number {
  // Risk: If stats component was removed (e.g., party banned), this returns 0.
  // Is 0 a valid polling number, or an error state?
  return state.components.stats[partyId]?.nationalPolling ?? 0;
}


Critique: For a UI, 0 and undefined are very different. undefined means "Don't render this widget." 0 means "Render a bar with 0% width."
Fix: Your queries should return number | undefined for optional data, forcing the UI to handle the "Ghost" case (entity exists, but data is missing).

4. Optimization: The ActionSystem Loop

In src/core/System.ts, your ActionSystem handles validation beautifully.
However, look at src/core/systems/campaign.ts:

TypeScript


// This loops over ALL parties every single tick
for (const partyId of aiParties) {
   newState = this.runAICampaign(newState, partyId);
}


Architecture Challenge:
As your game grows, iterating over every entity in process() will kill performance.
Optimization: Use a Dirty Flag or a Cooldown Component.
Add lastActionTurn to TransientStatus component.
In runAICampaign, check: if (currentTurn - lastActionTurn < 1) return state;
This turns your O(N) operation into a sparsely executed operation.

5. Next Step: The "Grand Wiring"

You need to fix useGameLogic.ts. It is currently a mix of Redux-style manual updates and ECS system calls.
Your Task:
Rewrite useGameLogic.ts so the gameReducer ONLY calls Systems. It should never manually touch the state tree.
Current (Mixed/Bad):

TypeScript


case 'UPDATE_AUTO_CAMPAIGN': 
    // Manual state mutation in the hook - ANTI-PATTERN in ECS
    return { ...state, parties: ... } 


Refactored (Pure System Call):

TypeScript


case 'UPDATE_AUTO_CAMPAIGN':
    // Dispatch an ACTION to the system
    return campaignSystem.processAction(state, {
        type: 'UPDATE_SETTINGS',
        actor: state.globals.playerParty,
        payload: action.payload.settings
    }).newState;


This forces all logic into src/core/systems/campaign.ts, keeping your architecture pure.
Do you want me to generate the refactored CampaignDashboard.tsx that correctly uses your new ECS Queries?
