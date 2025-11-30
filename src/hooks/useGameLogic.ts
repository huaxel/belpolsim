import { useReducer, useCallback } from 'react';
import type {
    ConstituencyId,
    GameState,
    PartyId,
    EventChoice
} from '../types';
import { createInitialState } from '../engine/state';
import type { Action, ActionType } from '../actions';
import { calculateElection } from '../engine/election';
import { handleAction, endTurn } from '../engine/game';
import { toggleCoalitionPartner, formGovernment } from '../engine/coalition';
import { saveGame, loadGame } from '../engine/persistence';

const gameReducer = (state: GameState, action: Action): GameState => {
    switch (action.type) {
        case 'PERFORM_ACTION': {
            const result = handleAction(state, action.payload.actionType);
            // TODO: The UI should handle the result.message, e.g. show a toast notification.
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
            // TODO: The UI should handle the result.message.
            return result.newState;
        }
        case 'FORM_GOVERNMENT': {
            const result = formGovernment(state, action.payload);
            // TODO: The UI should handle the result.message.
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
        default:
            return state;
    }
};

export const useGameLogic = () => {
    const [gameState, dispatch] = useReducer(gameReducer, undefined, createInitialState);

    const handleAction = useCallback((actionType: ActionType) => {
        dispatch({ type: 'PERFORM_ACTION', payload: { actionType } });
    }, [dispatch]);

    const endTurn = useCallback(() => {
        if (gameState.week >= gameState.maxWeeks) {
            dispatch({ type: 'CALCULATE_ELECTION' });
        } else {
            dispatch({ type: 'END_TURN' });
        }
    }, [dispatch, gameState.week, gameState.maxWeeks]);

    const handleEventChoice = useCallback((choice: EventChoice) => {
        dispatch({ type: 'HANDLE_EVENT_CHOICE', payload: { choice } });
    }, [dispatch]);

    const toggleCoalitionPartner = useCallback((partnerId: PartyId) => {
        dispatch({ type: 'TOGGLE_COALITION_PARTNER', payload: { partnerId } });
    }, [dispatch]);

    const formGovernment = useCallback((proposal: { partners: PartyId[], policyStances: any[], ministriesOffered: Record<PartyId, number> }) => {
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
    };
};
