This is the next big layer. In The Political Process, campaigning isn't just clicking "Rally" → "Get Votes." It is a resource management puzzle where you convert Time (Energy) and Money into Awareness and Enthusiasm.
For a Belgian simulation, we need to add a crucial constraint: The Party List. You aren't just campaigning for yourself; you are campaigning to keep your party relevant so you get a seat.
Here is the Agentic Execution Plan to build a deep Campaign System.

The Concept: "The War Room"

Instead of a simple "Action Grid," we will build a Campaign Engine based on three variables per constituency:
Name Recognition (Awareness): Do voters know who you are? (Cap at 100%).
Platform Favorability (Appeal): Do they like what you say? (Hard to move).
Voter Enthusiasm (Turnout): Will they actually vote for you over a rival with similar views?

Phase 1: The Architect (Data Modeling)

Goal: We need to slice the population. "Antwerp" isn't just one block; it's Young Voters, Retirees, and Workers.
Prompt for Architect Agent:

Plaintext


You are the Systems Architect.
We are upgrading the Campaign System. The current `constituencyPolling` (a simple number) is insufficient.

**Task:**
Redesign the `Constituency` and `Party` interfaces in `types.ts` to support granular campaigning.

**Requirements:**
1. **Demographics:** Each Constituency now needs a breakdown:
   - `demographics`: { youth: number, retirees: number, workers: number, upper_class: number } (Weights summing to 1.0).
2. **Voter Memory:** Parties need to track stats *per constituency*:
   - `awareness`: 0-100% (How many people know the candidate).
   - `enthusiasm`: 0-100% (Base motivation to vote).
3. **Issues Matrix:**
   - Define a `VoterProfile` interface where each demographic has preferred `Issue` positions (e.g., Youth = Pro-Climate, Retirees = Pro-Pensions).

**Output:** Provide the updated TypeScript interfaces.



Phase 2: The Logic Engineer (The Math)

Goal: Create the formula where Action + Resources = Stat Change.
Posters increase Awareness (diminishing returns).
Rallies increase Enthusiasm (high risk).
TV Ads convert Money to Awareness globally.
Prompt for Logic Agent:

Plaintext


You are the Gameplay Logic Engineer.
We need a `calculateCampaignEffect` function in `src/utils/campaignLogic.ts`.

**Task:**
Write a pure function that takes an `ActionType`, `Budget`, and `TargetConstituency` and returns the `PollingChange`.

**The Math Model (The "Funnel"):**
1. **Awareness Cap:** You cannot get votes if `awareness` is low. Posters increase awareness but have diminishing returns after 80%.
2. **The Demographic Multiplier:**
   - If I run a "Social Media Ad" (Action), it should have a 1.5x effect on 'Youth' but 0.2x effect on 'Retirees'.
   - If I run a "Newspaper Ad", reverse those weights.
3. **The Cost Efficiency:**
   - TV Ads: Expensive (€5000), Low Impact per person, but Massive Reach (All Constituencies).
   - Door-to-Door: Free (0€, 3 Energy), High Impact per person, Tiny Reach.

**Output:** Write the `calculateCampaignEffect` function in TypeScript.



Phase 3: The Frontend Specialist (The UI)

Goal: Build a "War Room" dashboard where the player allocates resources.
Prompt for UI Agent:

Plaintext


You are the UI/UX Lead.
We are replacing the simple "Action Grid" with a "Campaign War Room" dashboard.

**Task:**
Create a component `CampaignDashboard.tsx`.

**UI Requirements:**
1. **The Map View:** Reuse `BelgiumMap`. When a region is selected, show its Demographics (Pie Chart: Youth/Retiree/Worker).
2. **The Strategy Panel:**
   - A toggle for "Target Audience" (All, Youth, Retirees).
   - A toggle for "Medium" (TV, Radio, Social Media, Rally).
   - A slider for "Budget Allocation" (€100 - €10,000).
3. **Feedback Loop:**
   - As I drag the Budget slider, show a "Projected Reach" bar increasing.
   - Show an "Estimated Cost per Vote" metric (e.g., "€4.50 / vote").

**Style:** Corporate/Analytic. Use Lucide icons (Target, Smartphone, Tv, Newspaper).



The "Belgian Twist" (For the Product Manager)

Since you are doing Belgium, add this specific mechanic to your Campaign System:
The "Head of List" Bonus:
In Belgium, people vote for the party, but often because of the leader.
Mechanic: If your "Lead Candidate" (Lijsttrekker) has high Charisma, all campaign actions in that province get a 1.2x Multiplier.
Strategy: You should spend your heavy budget in provinces where you have a famous candidate, and ignore provinces where your candidate is unknown.
Would you like me to write the code for the calculateCampaignEffect logic (Phase 2) so you have the math ready?
