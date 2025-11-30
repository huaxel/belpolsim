# System Design: Belgian Political Simulator

## 1. Overview
The **Belgian Political Simulator** is a turn-based strategy game where the player leads a political party through a federal election campaign and subsequent coalition formation. The game aims to realistically simulate the complexity of the Belgian federal system, including regional fragmentation, the D'Hondt method, and coalition negotiations.

## 2. Core Architecture
-   **Frontend**: React (Vite) + TypeScript.
-   **Styling**: Tailwind CSS (v4) for a clean, modern, "corporate dashboard" aesthetic.
-   **State Management**: Monolithic `GameState` object managed via `useState` in `App.tsx`.
-   **Persistence**: (Planned) LocalStorage for save games.

## 3. Data Models

### 3.1 Geography & Constituencies
The game models Belgium's 11 electoral constituencies, grouped by region.

**Total Seats**: 150 (Federal Parliament)

| Region | Constituency | Seats |
| :--- | :--- | :--- |
| **Flanders** | Antwerp | 24 |
| | East Flanders | 20 |
| | West Flanders | 16 |
| | Flemish Brabant | 15 |
| | Limburg | 12 |
| **Wallonia** | Hainaut | 17 |
| | Liège | 14 |
| | Namur | 7 |
| | Walloon Brabant | 5 |
| | Luxembourg | 4 |
| **Brussels** | Brussels-Capital | 16 |

### 3.2 Parties
Parties are the primary actors.
-   **Regional Exclusivity**: Parties are defined by which *Constituencies* (or Regions) they can run in.
-   **Ideology**:
    -   `isExtremist`: Boolean. If true, triggers "Cordon Sanitaire" (democratic parties refuse coalition).
-   **Polling**: Tracked *per constituency*.
-   **Candidates**: Each party has a list of candidates *per constituency*.

### 3.3 Game Loop
1.  **Campaign Phase (12 Weeks)**:
    -   Player spends **Budget** and **Energy** on actions (Canvassing, Posters, Rallies).
    -   Actions target a specific **Constituency**.
    -   **Polling Update**: Actions affect polling in that constituency. Changes are normalized (sum = 100%) among eligible parties.
    -   **AI Turn**: AI parties perform randomized or strategic moves to gain votes.
2.  **Election Day**:
    -   **D'Hondt Method**: Applied independently in *each of the 11 constituencies* to allocate seats.
    -   **Federal Sum**: Total seats are summed up to determine the federal parliament composition.
3.  **Coalition Phase**:
    -   **Majority Check**: Goal is 76 seats (50% + 1 of 150).
    -   **Negotiation**: Player invites parties to form a government.
    -   **Constraints**: Cordon Sanitaire blocks extremists. Future: Policy demands.

## 4. Key Mechanics

### 4.1 The D'Hondt Method
The seat allocation algorithm used in Belgium.
For each constituency:
1.  Calculate quotients: $V / (S + 1)$ where $V$ is votes (polling %) and $S$ is seats currently allocated.
2.  Award seat to party with highest quotient.
3.  Repeat until all seats in constituency are filled.

### 4.2 Linguistic Friction (Implicit)
By splitting constituencies and parties, the linguistic divide is enforced naturally. A Flemish party (N-VA) simply does not exist in the `Hainaut` data structure, making it impossible for them to get votes there.

### 4.3 Cordon Sanitaire
A hard rule preventing democratic parties from entering a coalition with parties marked `isExtremist: true`.

## 5. Future Features (Phase 6+)
-   **Policy Negotiation**: Coalition partners will demand specific policy concessions (e.g., "Wealth Tax", "Nuclear Exit").
-   **Interactive Events**: Modal popups with choices that affect budget, polling, or integrity.
-   **Candidate Traits**: Candidates with specific bonuses (e.g., "Local Celebrity: +5% in Antwerp").
