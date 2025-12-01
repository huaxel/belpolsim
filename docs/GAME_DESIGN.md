# BelPolSim: Game Design Document

**Version:** 2.0
**Status:** Active

## 1. Introduction: The Belgian Labyrinth

To create a compelling and realistic simulation of Belgian politics, we must embrace its complexity. Belgium is a consociational democracy, meaning it is designed to manage deep societal divisions—primarily linguistic and ideological. This results in a political system characterized by power-sharing, multi-level governance, and a perpetual search for consensus. The game's core challenge should not be "winning" in a traditional sense, but navigating this complex web of interests to form a stable government and achieve policy goals.

## 2. The Core Gameplay Loop: The Electoral Cycle

The game will be turn-based, with each turn representing one week. The gameplay will be structured around the 4-year federal electoral cycle.

1.  **Pre-Campaign Phase (1-2 years):** Governing, managing the coalition, passing policies, and preparing for the election.
2.  **Campaign Phase (3-6 months):** Actively campaigning, participating in debates, and trying to influence public opinion.
3.  **Election Day (1 turn):** The election takes place. Seats are allocated based on the results.
4.  **Coalition Formation Phase (can take months):** The heart of the game. Negotiating with other parties to form a new government. This phase is crucial and should be detailed.

## 3. Key Feature Requirements

### 3.1. The Electoral System: Proportional Representation

-   **The D'Hondt Method:** The simulation must use the D'Hondt method to allocate seats in a multi-member constituency. This is non-negotiable for realism.
-   **Electoral Threshold:** A 5% electoral threshold (`kiesdrempel`) must be implemented in each constituency. Parties failing to meet this threshold do not get any seats.
-   **Constituencies:** The game must include the 11 federal constituencies (e.g., Antwerp, Hainaut, Brussels-Capital). Each constituency has a specific number of seats.
-   **Party Lists:** Parties present lists of candidates in each constituency. The player, as party leader, should have some influence over the composition of these lists (e.g., by giving preference to certain candidates).

### 3.2. The Party System: A Fragmented Landscape

-   **Ideological Dimensions:** Each party must be defined by more than a single left-right axis. I recommend at least three dimensions:
    -   **Economic:** Left (pro-intervention) vs. Right (pro-market)
    -   **Socio-cultural:** Progressive vs. Conservative
    -   **Institutional:** Pro-unitary state vs. Pro-confederalism/separatism
-   **Party Families:** Parties should be grouped into "families" (socialists, liberals, greens, Christian-democrats, nationalists). Parties within the same family are more likely to agree on policy but are also each other's main electoral competitors.
-   **Linguistic Divide:** Crucially, there are no national parties, only Flemish and Francophone parties. The simulation must enforce this. A Flemish party cannot run in Wallonia, and vice-versa (with the exception of Brussels).

### 3.3. Coalition Formation: The Art of the Possible

This must be the most detailed and in-depth part of the game.

-   **The Role of the King:** After the election, the King (a non-playable character) consults with party leaders and appoints an "Informateur".
-   **The Informateur:** This person (usually a respected senior politician) is tasked with exploring possible coalition options. The player might be chosen as Informateur.
-   **The Formateur:** Once a viable coalition seems possible, the King appoints a "Formateur" (usually the leader of the largest party in the proposed coalition) to lead the detailed negotiations. This is a key role the player should aspire to.
-   **Coalition Agreement (`Regeerakkoord`):** The negotiations should be represented by a system where parties propose and debate specific policy points (see the "Policy Sliders" example). The final agreement is a compromise between the coalition partners.
-   **Ministerial Posts:** The distribution of ministerial posts should be a key part of the negotiation. More powerful ministries (e.g., Prime Minister, Finance, Foreign Affairs) should be more valuable.

#### 3.3.1. Coalition Mechanics Improvements (Implemented)
The coalition negotiation interface has been enhanced to provide better visual feedback:
-   **Visual Policy Alignment Indicators:** Policy sliders show colored dots representing where each coalition partner stands on each issue.
-   **Friction Breakdown Display:** For selected partners or parties with high friction (>20), the interface shows the top 3 most contentious issues.
-   **Real-time Feedback:** Mood emojis update as you adjust policy sliders, and friction scores recalculate instantly.
-   **Friction Algorithm:** `friction = Σ(|your_position - their_position| × their_salience)`

### 3.4. The Cordon Sanitaire

-   **Definition:** A formal agreement between mainstream parties to never enter into a coalition with extremist parties (historically, the far-right Vlaams Belang and the far-left PTB/PVDA).
-   **Implementation:** In the game, parties should have a hard-coded "red line" against forming a coalition with parties designated as "extremist". Attempting to do so should result in a massive loss of public support and internal party revolt. This is a fundamental constraint of the Belgian system.

### 3.5. The Player's Role: Party Leader

-   The player should take on the role of the leader of one of the major parties (e.g., N-VA, PS, MR).
-   The player's actions should be focused on:
    -   Setting the party's ideological course.
    -   Managing the party's candidates and internal factions.
    -   Acting as the party's main spokesperson in the media.
    -   Leading coalition negotiations.

## 4. Campaign System v2 (The War Room)

In BelPolSim, campaigning isn't just clicking "Rally" → "Get Votes." It is a resource management puzzle where you convert Time (Energy) and Money into Awareness and Enthusiasm.

### 4.1. Core Mechanics
-   **Three-Stat System:**
    -   **Awareness (Name Recognition):** Do voters know who you are? (Cap at 100%).
    -   **Favorability (Appeal):** Do they like what you say? (Hard to move).
    -   **Enthusiasm (Turnout):** Will they actually vote for you over a rival with similar views?
-   **Demographics:** Each Constituency has a breakdown (Youth, Retirees, Workers, Upper Class).
-   **Voter Profiles:** Each demographic has preferred Issue positions (e.g., Youth = Pro-Climate).

### 4.2. The Funnel Model
1.  **Awareness Cap:** You cannot get votes if `awareness` is low. Posters increase awareness but have diminishing returns.
2.  **Demographic Multiplier:**
    -   "Social Media Ad" -> 1.5x effect on 'Youth', 0.2x effect on 'Retirees'.
    -   "Newspaper Ad" -> Reverse those weights.
3.  **Cost Efficiency:**
    -   TV Ads: Expensive, Low Impact per person, Massive Reach.
    -   Door-to-Door: Free (Energy cost), High Impact per person, Tiny Reach.

### 4.3. The "Head of List" Bonus
In Belgium, people vote for the party, but often because of the leader.
-   **Mechanic:** If your "Lead Candidate" (Lijsttrekker) has high Charisma, all campaign actions in that province get a multiplier (e.g., 1.2x).
-   **Strategy:** Spend heavy budget in provinces where you have a famous candidate.

### 4.4. Smart Recommendations & Auto-Campaign
-   **Smart Recommendations:** The system analyzes polling margins to identify "Critical" (<3%), "Competitive" (<7%), and "Safe" regions. It suggests the optimal action based on the largest demographic group.
-   **Auto-Campaign:** Players can configure a strategy (budget limit, priority targets) to automatically execute campaign actions at the end of each turn, reducing micromanagement.

## 5. Winning and Losing

-   **Winning:** There is no single "win" condition. Success should be measured by:
    -   Being in government and holding key ministerial posts.
    -   Successfully implementing your party's key policies.
    -   Increasing your party's seat count in the election.
-   **Losing:** Failure can come in many forms:
    -   Being excluded from government.
    -   A collapse of your government.
    -   A major election defeat.
    -   Losing the leadership of your party.

## 6. Implementation Status

### Implemented Features
- [x] **Electoral System:** D'Hondt method, 5% threshold, and constituency-based seat allocation are fully functional.
- [x] **Party System:** Parties have ideologies, stances, and are restricted by language/region.
- [x] **Cordon Sanitaire:** Hard-coded blocking of extremist parties in coalition formation.
- [x] **Basic Coalition Formation:** Ability to select partners and form a government if majority is reached.
- [x] **Cabinet Parity:** Logic exists to enforce equal Dutch/French representation.
- [x] **Campaign System:** Deep campaign mechanics with demographics, awareness/enthusiasm stats, and strategic actions.
- [x] **Party List Management:** Players can reorder candidates on their lists.
- [x] **Smart Recommendations & Auto-Campaign:** AI-driven assistance for the campaign phase.

### Missing / In-Progress Features
- [ ] **The King & Informateur:** Currently, the game skips these steps. The player immediately acts as Formateur.
- [ ] **Detailed Coalition Agreement:** The negotiation of specific policy points is simplified. A "slider" or "minigame" mechanic is needed here.
- [ ] **Minister Assignment UI:** The logic for assigning ministers exists, but the UI for selecting specific politicians for specific posts is a placeholder.
- [ ] **Governing Phase:** Passing laws, managing budget, and stability (Phase 3 of Roadmap).
