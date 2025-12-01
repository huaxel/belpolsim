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
    },
    {
        id: 'strike_action',
        title: 'General Strike',
        description: 'Trade unions have called for a general strike demanding higher wages.',
        choices: [
            {
                text: 'Negotiate',
                description: 'Cost €1000 Budget, Gain Popularity.',
                effect: (state: GameState) => ({
                    budget: state.budget - 1000,
                    eventLog: [...state.eventLog, 'Negotiations successful. Workers are happy.']
                })
            },
            {
                text: 'Crackdown',
                description: 'Lose Popularity, Maintain Budget.',
                effect: (state: GameState) => {
                    const newParties = { ...state.parties };
                    Object.keys(newParties.player.constituencyPolling).forEach(c => {
                        // @ts-ignore
                        newParties.player.constituencyPolling[c] = Math.max(0, newParties.player.constituencyPolling[c] - 3);
                    });
                    return { parties: newParties, eventLog: [...state.eventLog, 'Crackdown angered the public.'] };
                }
            }
        ]
    },
    {
        id: 'eu_summit',
        title: 'EU Summit',
        description: 'The EU Commission demands stricter budget adherence.',
        choices: [
            {
                text: 'Comply (Austerity)',
                description: 'Gain Budget, Lose Popularity.',
                effect: (state: GameState) => {
                    const newParties = { ...state.parties };
                    Object.keys(newParties.player.constituencyPolling).forEach(c => {
                        // @ts-ignore
                        newParties.player.constituencyPolling[c] = Math.max(0, newParties.player.constituencyPolling[c] - 2);
                    });
                    return {
                        budget: state.budget + 1500,
                        parties: newParties,
                        eventLog: [...state.eventLog, 'Austerity measures implemented. Brussels is happy, voters are not.']
                    };
                }
            },
            {
                text: 'Defy Brussels',
                description: 'Lose Stability, Gain Popularity.',
                effect: (state: GameState) => {
                    const newParties = { ...state.parties };
                    Object.keys(newParties.player.constituencyPolling).forEach(c => {
                        // @ts-ignore
                        newParties.player.constituencyPolling[c] += 2;
                    });
                    // Stability hit handled if government exists
                    return {
                        parties: newParties,
                        eventLog: [...state.eventLog, 'You stood up to the EU! National pride soars.']
                    };
                }
            }
        ]
    },
    {
        id: 'natural_disaster',
        title: 'Floods in Wallonia',
        description: 'Severe flooding has hit the Walloon region.',
        choices: [
            {
                text: 'Emergency Aid',
                description: 'Cost €2000, Big Popularity Boost.',
                effect: (state: GameState) => {
                    const newParties = { ...state.parties };
                    Object.keys(newParties.player.constituencyPolling).forEach(c => {
                        // @ts-ignore
                        newParties.player.constituencyPolling[c] += 4;
                    });
                    return {
                        budget: state.budget - 2000,
                        parties: newParties,
                        eventLog: [...state.eventLog, 'Emergency aid deployed. The people are grateful.']
                    };
                }
            },
            {
                text: 'Standard Response',
                description: 'Small cost, Neutral effect.',
                effect: (state: GameState) => ({
                    budget: state.budget - 500,
                    eventLog: [...state.eventLog, 'Standard disaster response protocols enacted.']
                })
            }
        ]
    },
    {
        id: 'tech_innovation',
        title: 'Flanders Tech Hub',
        description: 'A new tech hub is booming in Flanders.',
        choices: [
            {
                text: 'Subsidize',
                description: 'Cost €1000, Future Growth.',
                effect: (state: GameState) => ({
                    budget: state.budget - 1000,
                    // In a complex model, this would increase GDP growth
                    eventLog: [...state.eventLog, 'Tech sector subsidized. Economic outlook improves.']
                })
            },
            {
                text: 'Tax Windfall',
                description: 'Gain €1500, Tech companies unhappy.',
                effect: (state: GameState) => ({
                    budget: state.budget + 1500,
                    eventLog: [...state.eventLog, 'Tech windfall tax collected.']
                })
            }
        ]
    },
    {
        id: 'royal_visit',
        title: 'Royal Visit',
        description: 'The King is visiting a local constituency.',
        choices: [
            {
                text: 'Join the King',
                description: 'Cost 2 Energy, Gain Popularity.',
                effect: (state: GameState) => {
                    const newParties = { ...state.parties };
                    Object.keys(newParties.player.constituencyPolling).forEach(c => {
                        // @ts-ignore
                        newParties.player.constituencyPolling[c] += 1;
                    });
                    return {
                        energy: Math.max(0, state.energy - 2),
                        parties: newParties,
                        eventLog: [...state.eventLog, 'You appeared alongside the King.']
                    };
                }
            },
            {
                text: 'Stay in Brussels',
                description: 'Gain 1 Energy.',
                effect: (state: GameState) => ({
                    energy: Math.min(state.maxEnergy, state.energy + 1),
                    eventLog: [...state.eventLog, 'You used the time to rest and plan.']
                })
            }
        ]
    }
];
