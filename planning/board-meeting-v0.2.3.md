# Board Meeting: Planning v0.3.0 (The Governing Phase)

**Date:** 2025-12-02
**Attendees:** Product Manager (PM), Systems Architect (SA), Logic Engineer (LE), Frontend Specialist (FE), Belgian Politics Expert (BPE), Playtester (PT)

---

## 1. Review of v0.2.2
**PM:** "Great work on v0.2.2. The optimizations were crucial. The Campaign System is no longer a performance hog, and the Victory Widget actually works. We are now on a stable ECS foundation."

**SA:** "Agreed. The `TransientStatus` cooldown was a clean solution. The architecture is holding up well."

## 2. The Goal: v0.3.0 (The Governing Phase)
**PM:** "Now we need to deliver on the promise of the game: **Governing**. Getting elected is only half the battle. We need to implement the Legislative Engine."

**BPE:** "Correct. In Belgium, the government is formed by a coalition. Their stability depends on passing the 'Regeerakkoord' (Coalition Agreement). If they fail to pass laws, the government falls."

**PT:** "Wait, just voting on laws sounds boring. 'Click Vote -> Pass -> Next'. Where is the drama?"

**BPE:** "The drama comes from the **Coalition Friction**. If a law is proposed that goes against a partner's ideology, do they vote for it to save the government, or against it to please their voters?"

**LE:** "So we need a `LegislativeSystem` that calculates:
1.  **Vote Outcome:** Who votes Yes/No/Abstain.
2.  **Consequences:** Impact on Government Stability and Party Popularity."

## 3. Technical Requirements
**SA:** "We need to expand the Data Model in `types.ts`.
-   **Entities:** `Bill` (already exists in types, but unused).
-   **Components:** `BillData` (status, sponsor, votes).
-   **Systems:** `LegislativeSystem` (handles proposing, debating, voting)."

**FE:** "I'll need a 'Parliament View'. We have the seating chart, but we need a 'Bill Proposal' interface and a 'Voting Session' animation."

**PM:** "Let's keep the scope tight.
1.  **Bill Proposal:** Player selects an Issue and a Stance.
2.  **Voting:** AI parties vote based on Ideology + Coalition Loyalty.
3.  **Result:** Pass/Fail + Stats update."

## 4. The "Crisis" Factor
**PT:** "Can we add random events? Like a budget crisis or a scandal?"

**PM:** "That's Phase 3.1. Let's get the core **Legislative Loop** working first (v0.3.0). Then we add Crises (v0.3.1)."

## 5. Decisions & Action Plan
**PM:** "Okay, here is the plan for **v0.3.0 - The Legislative Engine**:

1.  **SA:** Refine `BillData` and `LegislativeSystem` interfaces.
2.  **LE:** Implement `LegislativeSystem` (Voting logic: Ideology vs Coalition).
3.  **FE:** Build `ParliamentView` (Proposal UI + Voting Visualization).
4.  **BPE:** Provide a list of realistic bills/issues for the MVP."

**All:** "Agreed."
