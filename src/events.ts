import type { GameEvent, GameState } from './types';

export const EVENTS: GameEvent[] = [
    {
        id: 'scandal_corruption',
        title: 'Corruption Scandal!',
        description: 'A prominent member of your party has been accused of embezzlement. The press is asking for a statement.',
        choices: [
            {
                text: 'Deny everything',
                description: 'Risk -5% polling everywhere, or nothing.',
                effect: (state: GameState) => {
                    const risk = Math.random();
                    if (risk > 0.5) {
                        // Bad outcome
                        const newParties = { ...state.parties };
                        Object.keys(newParties.player.constituencyPolling).forEach(c => {
                            // @ts-ignore
                            newParties.player.constituencyPolling[c] = Math.max(0, newParties.player.constituencyPolling[c] - 5);
                        });
                        return { parties: newParties, eventLog: [...state.eventLog, 'Scandal denial backfired! Polling dropped.'] };
                    }
                    return { eventLog: [...state.eventLog, 'Scandal denied successfully.'] };
                }
            },
            {
                text: 'Fire the member',
                description: 'Lose 1 AP, small polling hit.',
                effect: (state: GameState) => {
                    const newParties = { ...state.parties };
                    Object.keys(newParties.player.constituencyPolling).forEach(c => {
                        // @ts-ignore
                        newParties.player.constituencyPolling[c] = Math.max(0, newParties.player.constituencyPolling[c] - 1);
                    });
                    return {
                        energy: Math.max(0, state.energy - 1),
                        parties: newParties,
                        eventLog: [...state.eventLog, 'Member fired. Damage controlled.']
                    };
                }
            }
        ]
    },
    {
        id: 'budget_surplus',
        title: 'Unexpected Budget Surplus',
        description: 'The treasury found some unallocated funds from the previous administration.',
        choices: [
            {
                text: 'Invest in Campaign',
                description: '+€2000 Budget',
                effect: (state: GameState) => ({
                    budget: state.budget + 2000,
                    eventLog: [...state.eventLog, 'Budget increased by €2000.']
                })
            },
            {
                text: 'Charity Donation',
                description: '+1% Polling everywhere',
                effect: (state: GameState) => {
                    const newParties = { ...state.parties };
                    Object.keys(newParties.player.constituencyPolling).forEach(c => {
                        // @ts-ignore
                        newParties.player.constituencyPolling[c] += 1;
                    });
                    return { parties: newParties, eventLog: [...state.eventLog, 'Donation boosted popularity.'] };
                }
            }
        ]
    },
    {
        id: 'tv_interview',
        title: 'Prime Time Interview',
        description: 'You have been invited to a major talk show.',
        choices: [
            {
                text: 'Attack opponents',
                description: 'High risk/reward polling change.',
                effect: (state: GameState) => {
                    const roll = Math.random();
                    const newParties = { ...state.parties };
                    let msg = "";
                    if (roll > 0.6) {
                        // Success
                        Object.keys(newParties.player.constituencyPolling).forEach(c => {
                            // @ts-ignore
                            newParties.player.constituencyPolling[c] += 3;
                        });
                        msg = "Interview was a smash hit!";
                    } else {
                        // Fail
                        Object.keys(newParties.player.constituencyPolling).forEach(c => {
                            // @ts-ignore
                            newParties.player.constituencyPolling[c] = Math.max(0, newParties.player.constituencyPolling[c] - 2);
                        });
                        msg = "You came off as aggressive.";
                    }
                    return { parties: newParties, eventLog: [...state.eventLog, msg] };
                }
            },
            {
                text: 'Discuss policy',
                description: '+1 AP',
                effect: (state: GameState) => ({
                    energy: Math.min(state.maxEnergy, state.energy + 1),
                    eventLog: [...state.eventLog, 'Calm interview restored energy.']
                })
            }
        ]
    }
];
