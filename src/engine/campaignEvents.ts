/**
 * Campaign Events System
 * 
 * Random events that occur during the campaign phase to add variety and drama.
 * Events are triggered with CAMPAIGN_EVENT_PROBABILITY chance each turn.
 */

import type { GameEvent, GameState } from '../types';

/**
 * Campaign-specific random events
 * These events add variety, drama, and replayability to the campaign phase
 */
export const CAMPAIGN_EVENTS: GameEvent[] = [
    {
        id: 'scandal_corruption',
        title: '💥 Corruption Scandal!',
        description: 'A journalist has uncovered questionable financial dealings in your campaign. Your campaign manager is accused of accepting illegal donations. How do you respond?',
        choices: [
            {
                text: 'Fire the campaign manager immediately',
                description: 'Take swift action to distance yourself (-2% approval, but shows leadership)',
                effect: (state: GameState) => {
                    const newState = { ...state };
                    // Reduce polling by 2% in all regions
                    Object.keys(newState.parties.player.constituencyPolling).forEach(cId => {
                        newState.parties.player.constituencyPolling[cId as keyof typeof newState.parties.player.constituencyPolling] -= 2;
                    });
                    newState.eventLog = [...newState.eventLog, '📰 Scandal: Fired campaign manager. Polling -2%'];
                    return newState;
                }
            },
            {
                text: 'Defend your team and deny allegations',
                description: 'Stand by your people, but risk looking guilty (-5% approval, lose 1 turn of energy)',
                effect: (state: GameState) => {
                    const newState = { ...state };
                    Object.keys(newState.parties.player.constituencyPolling).forEach(cId => {
                        newState.parties.player.constituencyPolling[cId as keyof typeof newState.parties.player.constituencyPolling] -= 5;
                    });
                    newState.energy = Math.max(0, newState.energy - 3);
                    newState.eventLog = [...newState.eventLog, '📰 Scandal: Denied allegations. Polling -5%, Energy -3'];
                    return newState;
                }
            },
            {
                text: 'Launch internal investigation',
                description: 'Show transparency, costs budget but minimizes damage (-€2000, -1% approval)',
                effect: (state: GameState) => {
                    const newState = { ...state };
                    newState.budget = Math.max(0, newState.budget - 2000);
                    Object.keys(newState.parties.player.constituencyPolling).forEach(cId => {
                        newState.parties.player.constituencyPolling[cId as keyof typeof newState.parties.player.constituencyPolling] -= 1;
                    });
                    newState.eventLog = [...newState.eventLog, '📰 Scandal: Launched investigation. Budget -€2000, Polling -1%'];
                    return newState;
                }
            }
        ]
    },
    {
        id: 'news_cycle_immigration',
        title: '📺 Immigration Dominates Headlines',
        description: 'A major immigration incident has sparked national debate. Immigration is the top issue this week. Actions related to immigration will be more effective.',
        choices: [
            {
                text: 'Capitalize on the moment',
                description: 'Immigration-focused actions are 50% more effective this turn',
                effect: (state: GameState) => {
                    const newState = { ...state };
                    // This would ideally set a temporary buff, but for MVP we'll just give a small boost
                    Object.keys(newState.parties.player.constituencyPolling).forEach(cId => {
                        newState.parties.player.constituencyPolling[cId as keyof typeof newState.parties.player.constituencyPolling] += 1;
                    });
                    newState.eventLog = [...newState.eventLog, '📺 News Cycle: Immigration focus. Polling +1%'];
                    return newState;
                }
            }
        ]
    },
    {
        id: 'endorsement_union',
        title: '✊ Major Union Endorsement!',
        description: 'The largest labor union in Wallonia has officially endorsed your party! This is a major boost to your credibility with working-class voters.',
        choices: [
            {
                text: 'Accept the endorsement',
                description: 'Gain +6% polling in Wallonia constituencies',
                effect: (state: GameState) => {
                    const newState = { ...state };
                    const walloniaConstituencies = ['hainaut', 'liege', 'luxembourg', 'namur', 'walloon_brabant'];
                    walloniaConstituencies.forEach(cId => {
                        if (cId in newState.parties.player.constituencyPolling) {
                            newState.parties.player.constituencyPolling[cId as keyof typeof newState.parties.player.constituencyPolling] += 6;
                        }
                    });
                    newState.eventLog = [...newState.eventLog, '✊ Union Endorsement: Wallonia polling +6%'];
                    return newState;
                }
            }
        ]
    },
    {
        id: 'debate_challenge',
        title: '🎤 Live Debate Challenge!',
        description: 'N-VA has challenged you to a live televised debate on economic policy. This is a high-stakes moment. Choose your strategy carefully.',
        choices: [
            {
                text: 'Accept - Focus on Economy',
                description: 'Win over economic voters but risk alienating social progressives (+4% Flanders, -2% Wallonia)',
                effect: (state: GameState) => {
                    const newState = { ...state };
                    const flandersConstituencies = ['antwerp', 'east_flanders', 'flemish_brabant', 'limburg', 'west_flanders'];
                    flandersConstituencies.forEach(cId => {
                        if (cId in newState.parties.player.constituencyPolling) {
                            newState.parties.player.constituencyPolling[cId as keyof typeof newState.parties.player.constituencyPolling] += 4;
                        }
                    });
                    const walloniaConstituencies = ['hainaut', 'liege', 'luxembourg', 'namur', 'walloon_brabant'];
                    walloniaConstituencies.forEach(cId => {
                        if (cId in newState.parties.player.constituencyPolling) {
                            newState.parties.player.constituencyPolling[cId as keyof typeof newState.parties.player.constituencyPolling] -= 2;
                        }
                    });
                    newState.eventLog = [...newState.eventLog, '🎤 Debate: Economic focus. Flanders +4%, Wallonia -2%'];
                    return newState;
                }
            },
            {
                text: 'Accept - Focus on Environment',
                description: 'Appeal to green voters (+5% among progressive voters, -1% overall)',
                effect: (state: GameState) => {
                    const newState = { ...state };
                    Object.keys(newState.parties.player.constituencyPolling).forEach(cId => {
                        newState.parties.player.constituencyPolling[cId as keyof typeof newState.parties.player.constituencyPolling] += 2;
                    });
                    newState.eventLog = [...newState.eventLog, '🎤 Debate: Environmental focus. Polling +2%'];
                    return newState;
                }
            },
            {
                text: 'Decline the debate',
                description: 'Avoid risk but look weak (-3% Flanders)',
                effect: (state: GameState) => {
                    const newState = { ...state };
                    const flandersConstituencies = ['antwerp', 'east_flanders', 'flemish_brabant', 'limburg', 'west_flanders'];
                    flandersConstituencies.forEach(cId => {
                        if (cId in newState.parties.player.constituencyPolling) {
                            newState.parties.player.constituencyPolling[cId as keyof typeof newState.parties.player.constituencyPolling] -= 3;
                        }
                    });
                    newState.eventLog = [...newState.eventLog, '🎤 Debate: Declined. Flanders -3%'];
                    return newState;
                }
            }
        ]
    },
    {
        id: 'opponent_gaffe',
        title: '😱 Opponent Makes Controversial Statement!',
        description: 'The leader of Vlaams Belang has made an inflammatory statement about immigration that has sparked outrage. You can exploit this moment or take the high road.',
        choices: [
            {
                text: 'Attack aggressively',
                description: 'Condemn the statement and win moderate voters (+5% Flanders, +2% Brussels)',
                effect: (state: GameState) => {
                    const newState = { ...state };
                    const flandersConstituencies = ['antwerp', 'east_flanders', 'flemish_brabant', 'limburg', 'west_flanders'];
                    flandersConstituencies.forEach(cId => {
                        if (cId in newState.parties.player.constituencyPolling) {
                            newState.parties.player.constituencyPolling[cId as keyof typeof newState.parties.player.constituencyPolling] += 5;
                        }
                    });
                    if ('brussels_capital' in newState.parties.player.constituencyPolling) {
                        newState.parties.player.constituencyPolling.brussels_capital += 2;
                    }
                    newState.eventLog = [...newState.eventLog, '😱 Opponent Gaffe: Condemned statement. Flanders +5%, Brussels +2%'];
                    return newState;
                }
            },
            {
                text: 'Take the high road',
                description: 'Refuse to engage in mudslinging (+1% overall, maintain dignity)',
                effect: (state: GameState) => {
                    const newState = { ...state };
                    Object.keys(newState.parties.player.constituencyPolling).forEach(cId => {
                        newState.parties.player.constituencyPolling[cId as keyof typeof newState.parties.player.constituencyPolling] += 1;
                    });
                    newState.eventLog = [...newState.eventLog, '😱 Opponent Gaffe: Took high road. Polling +1%'];
                    return newState;
                }
            }
        ]
    }
];

/**
 * Get a random campaign event
 * Returns null if no event should trigger this turn
 */
export const getRandomCampaignEvent = (): GameEvent | null => {
    if (Math.random() > 0.25) return null; // 25% chance

    const randomIndex = Math.floor(Math.random() * CAMPAIGN_EVENTS.length);
    return CAMPAIGN_EVENTS[randomIndex];
};
