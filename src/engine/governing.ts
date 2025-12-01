import type { GameState, NationalBudget, Crisis, Law, ActionResult } from '../types';

// ============================================================================
// BUDGET LOGIC
// ============================================================================

export const calculateBudgetImpact = (state: GameState): NationalBudget => {
    let { revenue, expenses, debt, lastYearGrowth } = state.nationalBudget;

    // Base growth/inflation
    revenue *= (1 + (lastYearGrowth / 100));
    expenses *= 1.02; // 2% inflation

    // Apply effects of active laws
    state.laws.forEach(law => {
        if (law.status === 'passed') {
            // budgetImpact is in millions/billions, let's assume it's additive to expenses (negative) or revenue (positive)
            // For simplicity, let's say budgetImpact > 0 reduces deficit (increases revenue or decreases expenses)
            // But usually laws cost money.
            // Let's define: budgetImpact > 0 means REVENUE increase, < 0 means EXPENSE increase.
            if (law.effects.budgetImpact > 0) {
                revenue += law.effects.budgetImpact;
            } else {
                expenses -= law.effects.budgetImpact; // Subtracting negative number = adding expense
            }
        }
    });

    const deficit = revenue - expenses;
    debt -= deficit; // Deficit adds to debt (negative deficit means surplus)
    // Wait, deficit = revenue - expenses. If revenue (100) < expenses (110), deficit is -10.
    // Debt should INCREASE by 10. So debt -= deficit (500 - (-10) = 510). Correct.

    return {
        revenue,
        expenses,
        debt,
        deficit,
        lastYearGrowth: Math.max(0, lastYearGrowth + (Math.random() * 0.4 - 0.2)) // Random fluctuation
    };
};

// ============================================================================
// CRISIS LOGIC
// ============================================================================

export const resolveCrisis = (state: GameState, crisisId: string, choiceIndex: number): ActionResult => {
    const crisis = state.crises.find(c => c.id === crisisId);
    if (!crisis) return { newState: state, success: false, message: "Crisis not found." };

    const choice = crisis.choices[choiceIndex];
    if (!choice) return { newState: state, success: false, message: "Invalid choice." };

    // Apply choice effect
    let newState = { ...state };
    const partialState = choice.effect(newState);
    newState = { ...newState, ...partialState };

    // Remove crisis
    newState.crises = newState.crises.filter(c => c.id !== crisisId);

    // Add to log
    const message = `Crisis Resolved: ${crisis.title} - ${choice.text}`;
    newState.eventLog = [...newState.eventLog, message];

    return { newState, success: true, message };
};

export const generateCrisis = (state: GameState): GameState => {
    // 5% chance of crisis per turn
    if (Math.random() > 0.05) return state;

    const crisis: Crisis = {
        id: `crisis-${Date.now()}`,
        title: "Energy Price Spike",
        description: "Global markets have driven up energy prices. Citizens are demanding action.",
        severity: 'medium',
        active: true,
        turnsRemaining: 4,
        choices: [
            {
                text: "Subsidize Energy (Cost: €1B)",
                description: "Reduces budget, increases popularity.",
                effect: (s) => ({
                    nationalBudget: { ...s.nationalBudget, expenses: s.nationalBudget.expenses + 1000 },
                    publicApproval: Math.min(100, s.publicApproval + 5)
                })
            },
            {
                text: "Do Nothing",
                description: "Saves money, hurts popularity.",
                effect: (s) => ({
                    publicApproval: Math.max(0, s.publicApproval - 10)
                })
            }
        ]
    };

    return {
        ...state,
        crises: [...state.crises, crisis],
        eventLog: [...state.eventLog, `CRISIS: ${crisis.title}`]
    };
};

// ============================================================================
// LEGISLATION LOGIC
// ============================================================================

import { decideVote } from './ai';

export const voteOnLegislation = (state: GameState, law: Law): ActionResult => {
    // Simulate voting in parliament using AI logic
    let yesVotes = 0;
    let noVotes = 0;
    let abstentions = 0;
    const details: string[] = [];

    Object.values(state.parties).forEach(party => {
        const vote = decideVote(party.id, state, law);

        if (vote === 'FOR') {
            yesVotes += party.totalSeats;
            details.push(`${party.name}: YES (${party.totalSeats})`);
        } else if (vote === 'AGAINST') {
            noVotes += party.totalSeats;
            details.push(`${party.name}: NO (${party.totalSeats})`);
        } else {
            abstentions += party.totalSeats;
            details.push(`${party.name}: ABSTAIN (${party.totalSeats})`);
        }
    });

    const passed = yesVotes > noVotes;
    const status: 'passed' | 'rejected' = passed ? 'passed' : 'rejected';

    // Update Law
    const updatedLaw: Law = { ...law, status };

    // Update State
    let newState = {
        ...state,
        laws: [...state.laws, updatedLaw],
        eventLog: [...state.eventLog, `Vote on ${law.name}: ${passed ? 'PASSED' : 'REJECTED'} (${yesVotes} vs ${noVotes})`]
    };

    // Apply immediate effects if passed
    if (passed) {
        newState.publicApproval = Math.max(0, Math.min(100, newState.publicApproval + law.effects.popularityImpact));
        if (newState.government) {
            newState.government = {
                ...newState.government,
                stability: Math.max(0, Math.min(100, newState.government.stability + law.effects.stabilityImpact))
            };
        }
    } else {
        // Failed vote hurts stability
        if (newState.government) {
            newState.government = {
                ...newState.government,
                stability: Math.max(0, newState.government.stability - 10)
            };
        }
    }

    return { newState, success: true, message: `Law ${status}` };
};

// ============================================================================
// STABILITY LOGIC
// ============================================================================

export const checkGovernmentStability = (state: GameState): { collapsed: boolean, reason?: string } => {
    if (!state.government) return { collapsed: false };

    if (state.government.stability <= 0) {
        return { collapsed: true, reason: "Government stability reached 0." };
    }

    // Random collapse chance if stability is low (< 30)
    if (state.government.stability < 30) {
        if (Math.random() < 0.1) {
            return { collapsed: true, reason: "Coalition infighting led to collapse." };
        }
    }

    return { collapsed: false };
};
