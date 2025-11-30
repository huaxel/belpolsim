# Coalition Mechanics Improvements

## Overview
The coalition negotiation interface has been significantly enhanced to provide better visual feedback and make the negotiation process more intuitive for players.

## Key Improvements

### 1. **Visual Policy Alignment Indicators**
- **Partner Stance Markers**: Policy sliders now show colored dots representing where each coalition partner stands on each issue
- Players can instantly see how far they need to compromise to satisfy their partners
- Markers are color-coded by party and positioned along the slider track

### 2. **Friction Breakdown Display**
- **Top Conflicts List**: For selected partners or parties with high friction (>20), the interface now shows:
  - The top 3 most contentious issues
  - Each party's position vs. your proposed position
  - Calculated based on position difference × issue salience
- Helps players understand *why* a party is unhappy and *what* to adjust

### 3. **Improved Layout**
- Partner cards now use a vertical flex layout with clear sections
- Ministry offer input is only shown for selected partners
- Friction breakdown appears below each partner card for easy reference
- Better visual hierarchy with borders and spacing

### 4. **Real-time Feedback**
- Mood emojis update as you adjust policy sliders
- Friction scores recalculate instantly
- "Refuses" badge appears when friction exceeds negotiation threshold
- All feedback is based on the actual friction calculation algorithm

## Technical Implementation

### Components Modified
- `src/components/CoalitionInterface.tsx`: Main negotiation UI
- Added partner stance visualization on policy sliders
- Added conflict breakdown for high-friction parties

### Algorithm
The friction system calculates disagreement as:
```
friction = Σ(|your_position - their_position| × their_salience)
```

This is then normalized and compared against each party's `negotiationThreshold` to determine:
- Mood emoji (😍 to 😡)
- Whether they'll refuse to negotiate
- Which issues are causing the most friction

## User Experience Flow

1. **Select Partners**: Click party cards to add/remove from coalition
2. **Adjust Policies**: Use sliders to find compromise positions
   - See partner positions as colored dots
   - Watch friction scores update in real-time
3. **Offer Ministries**: Assign cabinet positions to sweeten the deal (reduces friction by 10 per ministry)
4. **Review Conflicts**: Check the "Top Conflicts" list for problematic issues
5. **Propose Government**: Once majority is reached and friction is manageable, submit the proposal

## Future Enhancements
- Add tooltips explaining friction calculation
- Show predicted stability score before forming government
- Add "auto-compromise" button that finds middle ground
- Visual indicators for Cabinet Parity and other validation rules
