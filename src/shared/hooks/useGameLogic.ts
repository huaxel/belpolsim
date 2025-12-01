import { useReducer, useCallback } from 'react';
import type {
    World,
    EntityId,
    EventChoice,
    ActionType,
    DemographicGroup,
} from '@/core';
import {
    createInitialWorld,
    handleAction as coreHandleAction,
    endTurn as coreEndTurn,
} from '@/core';

// Type aliases for backwards compatibility
type GameState = World;
type ConstituencyId = EntityId;
type PartyId = EntityId;
interface Stance {
    issueId: string;
    position: number;
    salience: number;
}
interface Law {
    id: string;
    name: string;
    description: string;
    effects: { budgetImpact: number; popularityImpact: number; stabilityImpact: number };
    status: 'proposed' | 'passed' | 'rejected';
}
interface AutoCampaignStrategy {
    isEnabled: boolean;
    budgetLimit: number;
    priorities: { critical: boolean; competitive: boolean; safe: boolean };
    regions: Record<string, boolean>;
}

// Action types for the reducer
type Action =
    | { type: 'PERFORM_ACTION', payload: { actionType: ActionType, targetDemographic?: DemographicGroup } }
    | { type: 'END_TURN' }
    | { type: 'HANDLE_EVENT_CHOICE', payload: { choice: EventChoice } }
    | { type: 'TOGGLE_COALITION_PARTNER', payload: { partnerId: PartyId } }
    | {
        type: 'FORM_GOVERNMENT';
        payload: {
            partners: PartyId[];
            policyStances: Stance[];
            ministriesOffered: Record<PartyId, number>;
        }
    }
    | { type: 'SET_SELECTED_CONSTITUENCY', payload: { constituencyId: ConstituencyId } }
    | { type: 'SAVE_GAME' }
    | { type: 'LOAD_GAME', payload?: any }
    | { type: 'CALCULATE_ELECTION' }
    | { type: 'MEET_THE_KING' }
    | { type: 'REORDER_LIST', payload: { constituencyId: ConstituencyId, politicianId: string, newIndex: number } }
    | { type: 'RESOLVE_CRISIS', payload: { crisisId: string, choiceIndex: number } }
    | { type: 'VOTE_LEGISLATION', payload: { law: Law } }
    | { type: 'UPDATE_AUTO_CAMPAIGN', payload: { settings: AutoCampaignStrategy } };

const gameReducer = (state: GameState, action: Action): GameState => {
    switch (action.type) {
        case 'PERFORM_ACTION': {
            const result = handleAction(state, action.payload.actionType, action.payload.targetDemographic);
            return result.newState;
        }
        case 'END_TURN': {
            return endTurn(state);
        }
        case 'HANDLE_EVENT_CHOICE': {
            const { choice } = action.payload;
            const effect = choice.effect(state);
            return {
                ...state,
                ...effect,
                currentEvent: null
            };
        }
        case 'TOGGLE_COALITION_PARTNER': {
            const result = toggleCoalitionPartner(state, action.payload.partnerId);
            return result.newState;
        }
        case 'FORM_GOVERNMENT': {
            const result = formGovernment(state, action.payload);
            return result.newState;
        }
        case 'SET_SELECTED_CONSTITUENCY': {
            return {
                ...state,
                selectedConstituency: action.payload.constituencyId
            };
        }
        case 'SAVE_GAME': {
            return saveGame(state);
        }
        case 'LOAD_GAME': {
            const loadedState = loadGame();
            return loadedState || state;
        }
        case 'CALCULATE_ELECTION': {
            return calculateElection(state);
        }
        case 'MEET_THE_KING': {
            const result = performMeetTheKing(state);
            return result.newState;
        }
        case 'REORDER_LIST': {
            const result = performReorderList(state, action.payload);
            return result.newState;
        }
        case 'RESOLVE_CRISIS': {
            const result = resolveCrisis(state, action.payload.crisisId, action.payload.choiceIndex);
            return result.newState;
        }
        case 'VOTE_LEGISLATION': {
            const result = voteOnLegislation(state, action.payload.law);
            return result.newState;
        }
        case 'UPDATE_AUTO_CAMPAIGN': {
            return {
                ...state,
                parties: {
                    ...state.parties,
                    player: {
                        ...state.parties.player,
                        autoCampaign: action.payload.settings
                    }
                }
            };
        }
        default:
            return state;
    }
};

export const useGameLogic = () => {
    const [gameState, dispatch] = useReducer(gameReducer, undefined, createInitialState);

    const handleAction = useCallback((actionType: ActionType, targetDemographic?: import('../types').DemographicGroup) => {
        dispatch({ type: 'PERFORM_ACTION', payload: { actionType, targetDemographic } });
    }, [dispatch]);

    const endTurn = useCallback(() => {
        if (gameState.turn >= gameState.maxTurns) {
            dispatch({ type: 'CALCULATE_ELECTION' });
        } else {
            dispatch({ type: 'END_TURN' });
        }
    }, [dispatch, gameState.turn, gameState.maxTurns]);

    const handleEventChoice = useCallback((choice: EventChoice) => {
        dispatch({ type: 'HANDLE_EVENT_CHOICE', payload: { choice } });
    }, [dispatch]);

    const toggleCoalitionPartner = useCallback((partnerId: PartyId) => {
        dispatch({ type: 'TOGGLE_COALITION_PARTNER', payload: { partnerId } });
    }, [dispatch]);

    const updateAutoCampaign = useCallback((settings: import('../types').AutoCampaignStrategy) => {
        dispatch({ type: 'UPDATE_AUTO_CAMPAIGN', payload: { settings } });
    }, [dispatch]);

    const formGovernment = useCallback((proposal: { partners: PartyId[], policyStances: Stance[], ministriesOffered: Record<PartyId, number> }) => {
        dispatch({ type: 'FORM_GOVERNMENT', payload: proposal });
    }, [dispatch]);

    const setSelectedConstituency = useCallback((constituencyId: ConstituencyId) => {
        dispatch({ type: 'SET_SELECTED_CONSTITUENCY', payload: { constituencyId } });
    }, [dispatch]);

    const saveGame = useCallback(() => {
        dispatch({ type: 'SAVE_GAME' });
    }, [dispatch]);

    const loadGame = useCallback(() => {
        dispatch({ type: 'LOAD_GAME' });
    }, [dispatch]);

    const reorderList = useCallback((constituencyId: ConstituencyId, politicianId: string, newIndex: number) => {
        dispatch({ type: 'REORDER_LIST', payload: { constituencyId, politicianId, newIndex } });
    }, [dispatch]);

    const resolveCrisisHandler = useCallback((crisisId: string, choiceIndex: number) => {
        dispatch({ type: 'RESOLVE_CRISIS', payload: { crisisId, choiceIndex } });
    }, [dispatch]);

    const voteOnLegislationHandler = useCallback((law: Law) => {
        dispatch({ type: 'VOTE_LEGISLATION', payload: { law } });
    }, [dispatch]);

    return {
        gameState,
        handleAction,
        endTurn,
        handleEventChoice,
        toggleCoalitionPartner,
        formGovernment,
        setSelectedConstituency,
        saveGame,
        loadGame,
        dispatch,
        reorderList,
        resolveCrisis: resolveCrisisHandler,
        voteOnLegislation: voteOnLegislationHandler,
        updateAutoCampaign
    };
};
