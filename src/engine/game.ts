import type { GameState, ActionResult, ConstituencyId, PartyId, RegionId, Politician } from '../types';
import { CONSTITUENCIES } from '../constants';
import { EVENTS } from '../events';
import { determineInformateur } from './consultation';
import { calculateBudgetImpact, generateCrisis, checkGovernmentStability } from './governing';
import { getRandomCampaignEvent } from './campaignEvents';
import type { ActionType } from '../actions';

export const applyPollingChange = (state: GameState, constituencyId: ConstituencyId, partyId: PartyId, change: number): GameState => {
    const newState = JSON.parse(JSON.stringify(state)); // Deep copy

    if (!newState.polling) {
        newState.polling = {};
    }

    if (!newState.polling[constituencyId]) {
        newState.polling[constituencyId] = {};
    }
    const pollingData = newState.polling[constituencyId];

    const current = pollingData[partyId] || 0;
    let newval = current + change;
    newval = Math.max(0, Math.min(100, newval)); // Clamp 0-100

    // Normalize? For now, just clamp. In a real sim, we'd normalize total to 100%.
    // Simple normalization:
    const otherPartiesTotal = Object.entries(pollingData)
        .filter(([pid]) => pid !== partyId)
        .reduce((sum, [, val]) => sum + (val as number), 0);

    // If we just add to one, total > 100. We should steal from others proportionally?
    // For MVP, let's just update and allow > 100 temporarily or normalize all.
    // Let's normalize all to 100.

    pollingData[partyId] = newval;
    const newTotal = otherPartiesTotal + newval;

    if (newTotal > 0) {
        Object.keys(pollingData).forEach(pid => {
            pollingData[pid] = (pollingData[pid] / newTotal) * 100;
        });
    }

    return newState;
};

export const performCanvas = (state: GameState): ActionResult => {
    const cost = 500;
    const energyCost = 2;
    const popularityGain = 1.5;
    const cName = CONSTITUENCIES[state.selectedConstituency].name;
    const logMsg = `Canvassing in ${cName} was successful.`;

    if (state.budget < cost || state.energy < energyCost) return { newState: state, success: false, message: "Not enough resources." };

    let newState = applyPollingChange(state, state.selectedConstituency, 'player', popularityGain);
    newState.budget -= cost;
    newState.energy -= energyCost;
    newState.eventLog = [...newState.eventLog, `Week ${newState.turn}: ${logMsg}`];

    return { newState, success: true, message: logMsg };
}

export const performRally = (state: GameState): ActionResult => {
    const cost = 1200;
    const energyCost = 3;
    const cName = CONSTITUENCIES[state.selectedConstituency].name;

    if (state.budget < cost || state.energy < energyCost) return { newState: state, success: false, message: "Not enough resources." };

    const leadCandidate = (state.parties['player'].politicians[state.selectedConstituency] || [])[0];
    const avgCharisma = leadCandidate ? leadCandidate.charisma : 5;
    const charismaMod = avgCharisma / 5;
    const isGaffe = Math.random() < (0.2 / charismaMod);

    let popularityGain: number;
    let logMsg: string;
    let popularityChange = 0;

    if (isGaffe) {
        popularityGain = -3.0;
        logMsg = `GAFFE! The rally in ${cName} was a disaster despite ${leadCandidate?.name}'s efforts.`;
        popularityChange = -5;
    } else {
        const baseGain = 5.0;
        popularityGain = baseGain * charismaMod;
        logMsg = `Huge rally in ${cName}! ${leadCandidate?.name} (Cha: ${leadCandidate?.charisma}) electrified the crowd.`;
        popularityChange = 5;
    }

    let newState = applyPollingChange(state, state.selectedConstituency, 'player', popularityGain);

    // Update the politician in the new state
    if (leadCandidate) {
        const politicians = newState.parties['player'].politicians[state.selectedConstituency];
        const index = politicians.findIndex((p: Politician) => p.id === leadCandidate.id);
        if (index !== -1) {
            politicians[index] = {
                ...politicians[index],
                popularity: Math.max(0, Math.min(100, politicians[index].popularity + popularityChange))
            };
        }
    }

    newState.budget -= cost;
    newState.energy -= energyCost;
    newState.eventLog = [...newState.eventLog, `Week ${newState.turn}: ${logMsg}`];

    return { newState, success: true, message: logMsg };
}

export const performPosters = (state: GameState): ActionResult => {
    const cost = 800;
    const energyCost = 1;
    const popularityGain = 2.0;
    const cName = CONSTITUENCIES[state.selectedConstituency].name;
    const logMsg = `Posters plastered all over ${cName}.`;

    if (state.budget < cost || state.energy < energyCost) return { newState: state, success: false, message: "Not enough resources." };

    let newState = applyPollingChange(state, state.selectedConstituency, 'player', popularityGain);
    newState.budget -= cost;
    newState.energy -= energyCost;
    newState.eventLog = [...newState.eventLog, `Week ${newState.turn}: ${logMsg}`];

    return { newState, success: true, message: logMsg };
}

export const performFundraise = (state: GameState): ActionResult => {
    const cost = -1000; // Negative cost means budget gain
    const energyCost = 2;
    const popularityGain = -1.5;
    const cName = CONSTITUENCIES[state.selectedConstituency].name;
    const logMsg = `Fundraiser in ${cName} filled the war chest.`;

    // Note: No budget check needed for fundraising
    if (state.energy < energyCost) return { newState: state, success: false, message: "Not enough energy." };

    let newState = applyPollingChange(state, state.selectedConstituency, 'player', popularityGain);
    newState.budget -= cost;
    newState.energy -= energyCost;
    newState.eventLog = [...newState.eventLog, `Week ${newState.turn}: ${logMsg}`];

    return { newState, success: true, message: logMsg };
}


const applyRegionalPollingChange = (state: GameState, region: RegionId, partyId: PartyId, change: number): GameState => {
    let newState = JSON.parse(JSON.stringify(state)); // Deep copy for safety

    const constituencyIds = Object.keys(CONSTITUENCIES) as ConstituencyId[];

    constituencyIds.forEach(cId => {
        if (CONSTITUENCIES[cId].region === region) {
            // Create a temporary state for each constituency to apply the change
            const tempStateForConstituency = { ...newState, selectedConstituency: cId };
            newState = applyPollingChange(tempStateForConstituency, cId, partyId, change);
        }
    });

    return newState;
};

export const performTvAd = (state: GameState): ActionResult => {
    const cost = 3000;
    const energyCost = 0;
    const popularityGain = 0.5; // Regional boost
    const region = CONSTITUENCIES[state.selectedConstituency].region;
    const regionName = region === 'flanders' ? 'Flanders' : region === 'wallonia' ? 'Wallonia' : 'Brussels';
    const logMsg = `TV Ad Campaign aired in ${regionName}!`;

    if (state.budget < cost || state.energy < energyCost) return { newState: state, success: false, message: "Not enough resources." };

    let newState = applyRegionalPollingChange(state, region, 'player', popularityGain);
    newState.budget -= cost;
    newState.energy -= energyCost;
    newState.eventLog = [...newState.eventLog, `Week ${newState.turn}: ${logMsg}`];

    return { newState, success: true, message: logMsg };
}

export const performDebate = (state: GameState): ActionResult => {
    const cost = 0;
    const energyCost = 3;

    if (state.budget < cost || state.energy < energyCost) return { newState: state, success: false, message: "Not enough resources." };

    let totalExpertise = 0;
    let candidateCount = 0;
    Object.values(state.parties['player'].politicians).forEach(list => {
        list.forEach((c: Politician) => {
            totalExpertise += c.expertise;
            candidateCount++;
        });
    });
    const avgExpertise = candidateCount > 0 ? totalExpertise / candidateCount : 5;

    const winThreshold = 0.7 - ((avgExpertise - 5) * 0.05);
    const performance = Math.random();

    let gain: number;
    let logMsg: string;

    if (performance > winThreshold) {
        gain = 2.0;
        logMsg = `You won the debate! (Avg Exp: ${avgExpertise.toFixed(1)})`;
    } else if (performance < 0.2) {
        gain = -1.5;
        logMsg = "You stumbled in the debate.";
    } else {
        gain = 0.5;
        logMsg = "Solid debate performance.";
    }

    const region = CONSTITUENCIES[state.selectedConstituency].region;
    let newState = applyRegionalPollingChange(state, region, 'player', gain);
    newState.budget -= cost;
    newState.energy -= energyCost;
    newState.eventLog = [...newState.eventLog, `Week ${newState.turn}: ${logMsg}`];

    return { newState, success: true, message: logMsg };
}


// --- Main Action Dispatcher ---

export const performMeetTheKing = (state: GameState): ActionResult => {
    const informateur = determineInformateur(state);
    const isPlayer = informateur === state.playerPartyId;
    const informateurName = state.parties[informateur].name;

    const message = isPlayer
        ? `The King has appointed YOU as Informateur! Form a government.`
        : `The King has appointed ${informateurName} as Informateur.`;

    const newState = {
        ...state,
        informateur,
        gamePhase: 'formation' as const, // Transition to formation
        eventLog: [...state.eventLog, message]
    };

    return { newState, success: true, message };
};



export const performReorderList = (state: GameState, payload: { constituencyId: ConstituencyId, politicianId: string, newIndex: number }): ActionResult => {
    const { constituencyId, politicianId, newIndex } = payload;
    const newState = JSON.parse(JSON.stringify(state));
    const politicians = newState.parties['player'].politicians[constituencyId];

    if (!politicians) return { newState: state, success: false, message: "Constituency not found." };

    const currentIndex = politicians.findIndex((p: Politician) => p.id === politicianId);
    if (currentIndex === -1) return { newState: state, success: false, message: "Politician not found." };

    // Swap logic for adjacent moves (Up/Down arrows)
    // If we want to support drag-and-drop later, we'd need array move logic.
    // For now, assume newIndex is valid and adjacent.

    const targetIndex = newIndex; // 0-based from UI
    // listPosition is 1-based in data model? Yes, initialized as i+1.
    // But let's check if we rely on listPosition property or just array order.
    // The UI sorts by listPosition.

    const targetPolitician = politicians.find((p: Politician) => p.listPosition === targetIndex + 1);
    const currentPolitician = politicians[currentIndex];

    if (targetPolitician) {
        // Swap listPositions
        const temp = currentPolitician.listPosition;
        currentPolitician.listPosition = targetPolitician.listPosition;
        targetPolitician.listPosition = temp;

        return { newState, success: true, message: "List reordered." };
    }

    return { newState: state, success: false, message: "Invalid move." };
};

export const handleAction = (state: GameState, actionType: ActionType): ActionResult => {
    switch (actionType) {
        case 'canvas':
            return performCanvas(state);
        case 'rally':
            return performRally(state);
        case 'posters':
            return performPosters(state);
        case 'fundraise':
            return performFundraise(state);
        case 'tv_ad':
            return performTvAd(state);
        case 'debate':
            return performDebate(state);
        default:
            return { newState: state, success: false, message: `Action '${actionType}' is not implemented.` };
    }
};


const performAiMoves = (state: GameState): GameState => {
    let newState = JSON.parse(JSON.stringify(state));
    const aiLogMessages: string[] = [];
    const partyIds = Object.keys(newState.parties) as PartyId[];
    const aiParties = partyIds.filter(id => id !== 'player');

    aiParties.forEach(aiId => {
        const eligible = newState.parties[aiId].eligibleConstituencies;
        if (eligible.length > 0) {
            const targetIndex = Math.floor(Math.random() * eligible.length);
            const targetConstituency = eligible[targetIndex];
            const boost = (Math.random() * 2.0) + 0.5; // AI gets a small boost

            // Apply polling change in the targeted constituency
            newState = applyPollingChange(newState, targetConstituency, aiId, boost);

            // Always show AI moves for competitive pressure (playtester feedback)
            const actions = ['TV ads', 'rallies', 'canvassing', 'poster campaign'];
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            aiLogMessages.push(`🤖 ${newState.parties[aiId].name} runs ${randomAction} in ${newState.constituencies[targetConstituency as ConstituencyId].name} (+${boost.toFixed(1)}%)`);
        }
    });

    newState.eventLog = [...newState.eventLog, ...aiLogMessages];
    return newState;
};

const checkForRandomEvent = (state: GameState): GameState => {
    // During campaign phase, use campaign-specific events
    if (state.gamePhase === 'campaign') {
        const campaignEvent = getRandomCampaignEvent();

        if (campaignEvent) {
            return {
                ...state,
                currentEvent: campaignEvent,
                eventLog: [...state.eventLog, `🎲 EVENT: ${campaignEvent.title}`]
            };
        }
        return state;
    }

    // For other phases, use generic events
    const eventRoll = Math.random();
    if (eventRoll > 0.85) {
        const randomEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
        return {
            ...state,
            currentEvent: randomEvent,
            eventLog: [...state.eventLog, `EVENT: ${randomEvent.title}`]
        };
    }
    return state;
};


export const endTurn = (state: GameState): GameState => {
    if (state.turn >= state.maxTurns) {
        return state;
    }

    let newState = { ...state };

    // 1. Perform AI moves
    newState = performAiMoves(newState);

    // 2. Check for random events
    newState = checkForRandomEvent(newState);

    // 3. Update turn and resources
    newState.turn += 1;
    newState.energy = newState.maxEnergy;

    // 4. Governing Phase Logic
    if (newState.gamePhase === 'governing') {
        // Update National Budget
        newState.nationalBudget = calculateBudgetImpact(newState);

        // Check for Crises
        newState = generateCrisis(newState);

        // Check Stability
        const check = checkGovernmentStability(newState);
        if (check.collapsed) {
            newState.eventLog = [...newState.eventLog, `GOVERNMENT COLLAPSED: ${check.reason}`];
            // In a full game, this would trigger new elections or consultation.
            // For now, we just log it.
            if (newState.government) {
                newState.government.stability = 0;
            }
        }
    }

    return newState;
};
