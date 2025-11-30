import { CONSTITUENCIES } from "../constants";
import { EVENTS } from "../events";
import type { GameState, PartyId, ConstituencyId, ActionResult } from "../types";
import type { ActionType } from '../actions';

// --- Pure Helper Functions for Polling Changes ---

const applyPollingChange = (state: GameState, constituencyId: ConstituencyId, partyId: PartyId, change: number): GameState => {
    const newState = JSON.parse(JSON.stringify(state)); // Deep copy for safety
    
    if (!newState.parties[partyId].eligibleConstituencies.includes(constituencyId)) {
        return state; // Return original state if action is not applicable
    }

    newState.parties[partyId].constituencyPolling[constituencyId] += change;

    const eligiblePartyIds = (Object.keys(newState.parties) as PartyId[]).filter(id => newState.parties[id].eligibleConstituencies.includes(constituencyId));

    if (change > 0) {
        const othersIds = eligiblePartyIds.filter(k => k !== partyId);
        if (othersIds.length > 0) {
            const reductionPerParty = change / othersIds.length;
            othersIds.forEach(id => {
                newState.parties[id].constituencyPolling[constituencyId] = Math.max(0, newState.parties[id].constituencyPolling[constituencyId] - reductionPerParty);
            });
        }
    } else {
        const othersIds = eligiblePartyIds.filter(k => k !== partyId);
        if (othersIds.length > 0) {
            const gainPerParty = Math.abs(change) / othersIds.length;
            othersIds.forEach(id => {
                newState.parties[id].constituencyPolling[constituencyId] += gainPerParty;
            });
        }
    }

    // Normalize polling to 100%
    const totalPolling = eligiblePartyIds.reduce((sum, id) => sum + newState.parties[id].constituencyPolling[constituencyId], 0);
    if (totalPolling > 0) {
        eligiblePartyIds.forEach(id => {
            newState.parties[id].constituencyPolling[constituencyId] = (newState.parties[id].constituencyPolling[constituencyId] / totalPolling) * 100;
        });
    }

    return newState;
}

// --- Action Implementations ---

const performCanvas = (state: GameState): ActionResult => {
    const cost = 0;
    const energyCost = 2;
    const popularityGain = 1.5;
    const cName = CONSTITUENCIES[state.selectedConstituency].name;
    const logMsg = `Canvassing in ${cName} secured voters.`;

    if (state.budget < cost || state.energy < energyCost) return { newState: state, success: false, message: "Not enough resources." };
    
    let newState = applyPollingChange(state, state.selectedConstituency, 'player', popularityGain);
    newState.budget -= cost;
    newState.energy -= energyCost;
    newState.eventLog = [...newState.eventLog, `Week ${newState.week}: ${logMsg}`];
    
    return { newState, success: true, message: logMsg };
}

const performRally = (state: GameState): ActionResult => {
    const cost = 1200;
    const energyCost = 3;
    const cName = CONSTITUENCIES[state.selectedConstituency].name;

    if (state.budget < cost || state.energy < energyCost) return { newState: state, success: false, message: "Not enough resources." };

    const leadCandidate = (state.parties['player'].candidates[state.selectedConstituency] || [])[0];
    const avgCharisma = leadCandidate ? leadCandidate.charisma : 5;
    const charismaMod = avgCharisma / 5;
    const isGaffe = Math.random() < (0.2 / charismaMod);

    let popularityGain: number;
    let logMsg: string;

    if (isGaffe) {
        popularityGain = -3.0;
        logMsg = `GAFFE! The rally in ${cName} was a disaster despite ${leadCandidate?.name}'s efforts.`;
    } else {
        const baseGain = 5.0;
        popularityGain = baseGain * charismaMod;
        logMsg = `Huge rally in ${cName}! ${leadCandidate?.name} (Cha: ${leadCandidate?.charisma}) electrified the crowd.`;
    }
    
    let newState = applyPollingChange(state, state.selectedConstituency, 'player', popularityGain);
    newState.budget -= cost;
    newState.energy -= energyCost;
    newState.eventLog = [...newState.eventLog, `Week ${newState.week}: ${logMsg}`];

    return { newState, success: true, message: logMsg };
}

const performPosters = (state: GameState): ActionResult => {
    const cost = 800;
    const energyCost = 1;
    const popularityGain = 2.0;
    const cName = CONSTITUENCIES[state.selectedConstituency].name;
    const logMsg = `Posters plastered all over ${cName}.`;

    if (state.budget < cost || state.energy < energyCost) return { newState: state, success: false, message: "Not enough resources." };
    
    let newState = applyPollingChange(state, state.selectedConstituency, 'player', popularityGain);
    newState.budget -= cost;
    newState.energy -= energyCost;
    newState.eventLog = [...newState.eventLog, `Week ${newState.week}: ${logMsg}`];
    
    return { newState, success: true, message: logMsg };
}

const performFundraise = (state: GameState): ActionResult => {
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
    newState.eventLog = [...newState.eventLog, `Week ${newState.week}: ${logMsg}`];
    
    return { newState, success: true, message: logMsg };
}


const applyNationalPollingChange = (state: GameState, partyId: PartyId, change: number): GameState => {
    let newState = JSON.parse(JSON.stringify(state)); // Deep copy for safety

    const constituencyIds = Object.keys(CONSTITUENCIES) as ConstituencyId[];

    constituencyIds.forEach(cId => {
        // Create a temporary state for each constituency to apply the change
        const tempStateForConstituency = { ...newState, selectedConstituency: cId };
        newState = applyPollingChange(tempStateForConstituency, cId, partyId, change);
    });

    return newState;
};

const performTvAd = (state: GameState): ActionResult => {
    const cost = 3000;
    const energyCost = 0;
    const popularityGain = 0.5; // Small national boost
    const logMsg = `National TV Ad Campaign aired!`;

    if (state.budget < cost || state.energy < energyCost) return { newState: state, success: false, message: "Not enough resources." };
    
    let newState = applyNationalPollingChange(state, 'player', popularityGain);
    newState.budget -= cost;
    newState.energy -= energyCost;
    newState.eventLog = [...newState.eventLog, `Week ${newState.week}: ${logMsg}`];
    
    return { newState, success: true, message: logMsg };
}

const performDebate = (state: GameState): ActionResult => {
    const cost = 0;
    const energyCost = 3;

    if (state.budget < cost || state.energy < energyCost) return { newState: state, success: false, message: "Not enough resources." };
    
    let totalExpertise = 0;
    let candidateCount = 0;
    Object.values(state.parties['player'].candidates).forEach(list => {
        list.forEach(c => {
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
    
    let newState = applyNationalPollingChange(state, 'player', gain);
    newState.budget -= cost;
    newState.energy -= energyCost;
    newState.eventLog = [...newState.eventLog, `Week ${newState.week}: ${logMsg}`];

    return { newState, success: true, message: logMsg };
}


// --- Main Action Dispatcher ---

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

            if (Math.random() < 0.2) {
                aiLogMessages.push(`${newState.parties[aiId].name} is campaigning hard in ${CONSTITUENCIES[targetConstituency].name}!`);
            }
        }
    });
    
    newState.eventLog = [...newState.eventLog, ...aiLogMessages];
    return newState;
};

const checkForRandomEvent = (state: GameState): GameState => {
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
    if (state.week >= state.maxWeeks) {
        return state;
    }

    let newState = { ...state };

    // 1. Perform AI moves
    newState = performAiMoves(newState);

    // 2. Check for random events
    newState = checkForRandomEvent(newState);
    
    // 3. Update week and resources
    newState.week += 1;
    newState.energy = newState.maxEnergy;

    return newState;
};

