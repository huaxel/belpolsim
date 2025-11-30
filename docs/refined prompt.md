Role: You are a Senior Frontend Game Developer and System Architect.

Task: Build a "Phase 1" MVP for a Belgian Political Simulator game using React, Tailwind CSS, and TypeScript.

Game Context: The game is a turn-based strategy set in a fictional Belgian municipality. The player runs a local election campaign for one party against two AI rivals.

Core Constraints:

    Single Component File: Put all logic and UI in one file for now (for portability).

    State Management: Use useReducer or complex useState to handle game state.

    No External Assets: Use Lucide-React for icons and standard Tailwind colors.

Functional Requirements (The Engine):

    Game Loop: The game lasts exactly 12 turns (Weeks). At the end of Week 12, an "Election Day" calculation runs.

    Resources:

        Budget (€): Used to buy ads/posters.

        Energy (AP): Refills every week. Used for actions.

        Polling (%): The score. Must sum to 100% across all parties.

    Parties:

        Player: "The Progressives" (Green).

        Rival 1: "The Conservatives" (Blue) - Passive growth.

        Rival 2: "The Socialists" (Red) - Aggressive variation.

    Actions: Create 4 distinct actions with different costs/risks:

        Canvassing (Door-to-door): Low cost, high energy, small reliable gain.

        Posters: High cost, low energy, passive gain over time.

        Rally: High cost, high energy, big gain but chance of "Gaffe" (losing votes).

        Fundraise: Gain money, lose small popularity.

UI Requirements:

    Header: Current Week, Budget, Energy.

    Main Area: A "Dashboard" showing current polling numbers (visual bar charts).

    Action Area: A grid of cards for the actions. Disable buttons if insufficient resources.

    Log: A scrolling text box showing what happened last turn (e.g., "Socialists gained 2% from a union strike").

Tone: Clean, corporate dashboard aesthetic. Not "cartoony."