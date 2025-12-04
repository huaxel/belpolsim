import { useReducer, useCallback } from 'react';
import {
    campaignSystem,
    coalitionSystem,
    governingSystem,
    createEmptyState,
    createScenarioState,
} from '@/core';
import type {
    GameState,
    EntityId,
    EventChoice,
    GameAction,
    CampaignAction,
    CampaignActionType,
    BillData
} from '@/core';
import type { Action, ActionType, Stance, AutoCampaignStrategy } from '../utils/actions';

// Initialize game with default entities
const initializeGame = (): GameState => {
    // Start with empty state in setup phase
    const state = createEmptyState();
    state.globals.currentPhase = 'setup';
    return state;
};

const gameReducer = (state: GameState, action: Action): GameState => {
    switch (action.type) {
        case 'START_GAME': {
            const { playerPartyId } = action.payload;
            return createScenarioState({ playerPartyId });
        }
        case 'PERFORM_ACTION': {
            const { actionType, targetConstituencyId, focusIssueId } = action.payload;

            // Map old action types to new CampaignActionType
            let type: CampaignActionType | undefined;
            if (['rally', 'advertisement', 'doorToDoor', 'debate', 'fundraise', 'attackAd', 'policyAnnouncement'].includes(actionType)) {
                type = actionType as CampaignActionType;
            } else if (actionType === 'canvas') type = 'doorToDoor';
            else if (actionType === 'tv_ad') type = 'advertisement';
            else if (actionType === 'posters') type = 'advertisement';
            else if (actionType === 'social_media') type = 'advertisement'; // Simplified mapping
            else if (actionType === 'newspaper') type = 'advertisement';
            else if (actionType === 'radio') type = 'advertisement';

            if (!type) return state; // Unknown action

            const gameAction: CampaignAction = {
                type,
                actor: state.globals.playerParty,
                constituency: targetConstituencyId,
                issue: focusIssueId
            };

            const result = campaignSystem.processAction(state, gameAction);
            return result.newState;
        }
        case 'END_TURN': {
            let newState = state;

            // Process based on phase
            if (state.globals.currentPhase === 'campaign') {
                newState = campaignSystem.update(state);
            } else if (state.globals.currentPhase === 'formation') {
                newState = coalitionSystem.update(state);
            } else if (state.globals.currentPhase === 'governing') {
                newState = governingSystem.update(state);
            }

            // Increment turn
            newState = {
                ...newState,
                globals: {
                    ...newState.globals,
                    currentTurn: newState.globals.currentTurn + 1
                }
            };
            return newState;
        }
        case 'HANDLE_EVENT_CHOICE': {
            // TODO: Implement event choice handling in ECS
            return state;
        }
        case 'TOGGLE_COALITION_PARTNER': {
            // TODO: Implement coalition partner selection (UI state)
            return state;
        }
        case 'FORM_GOVERNMENT': {
            const { partners } = action.payload;
            // Note: CoalitionSystem expects 'proposedPartners' in the action object directly, not in payload
            // We need to construct the action correctly matching CoalitionAction interface
            const coalitionAction = {
                type: 'proposeCoalition',
                actor: state.globals.playerParty,
                proposedPartners: partners
            } as unknown as GameAction; // Cast to GameAction to satisfy type checker

            const result = coalitionSystem.processAction(state, coalitionAction);
            return result.newState;
        }
        case 'SET_SELECTED_CONSTITUENCY': {
            const { constituencyId } = action.payload;
            return {
                ...state,
                globals: {
                    ...state.globals,
                    selectedConstituency: constituencyId
                }
            };
        }
        case 'SAVE_GAME': {
            // TODO: Implement persistence
            console.log('Game saved');
            return state;
        }
        case 'LOAD_GAME': {
            return action.payload as GameState || state;
        }
        case 'CALCULATE_ELECTION': {
            // Transition to election phase
            return {
                ...state,
                globals: {
                    ...state.globals,
                    currentPhase: 'election'
                }
            };
        }
        case 'MEET_THE_KING': {
            // Transition to consultation
            return {
                ...state,
                globals: {
                    ...state.globals,
                    currentPhase: 'consultation'
                }
            };
        }
        case 'REORDER_LIST': {
            // TODO: Implement list reordering
            return state;
        }
        case 'RESOLVE_CRISIS': {
            const { crisisId } = action.payload;
            const gameAction: GameAction = {
                type: 'addressCrisis',
                actor: state.globals.playerParty,
                target: crisisId
            };
            const result = governingSystem.processAction(state, gameAction);
            return result.newState;
        }
        case 'VOTE_LEGISLATION': {
            // const { law } = action.payload;
            // Assuming law object has ID. In ECS, law is BillData, but we need the EntityId.
            // The action payload passed 'law' which is BillData. We need the ID.
            // This might be tricky if the UI passes the object but not the ID.
            // We'll assume for now we can't vote without ID.
            return state;
        }
        case 'UPDATE_AUTO_CAMPAIGN': {
            return {
                ...state,
                globals: {
                    ...state.globals,
                    autoCampaign: action.payload.settings.isEnabled
                }
            };
        }
        default:
            return state;
    }
};

export const useGameLogic = () => {
    const [gameState, dispatch] = useReducer(gameReducer, undefined, initializeGame);

    const handleAction = useCallback((actionType: ActionType, targetConstituencyId?: string, focusIssueId?: string) => {
        dispatch({ type: 'PERFORM_ACTION', payload: { actionType, targetConstituencyId, focusIssueId } });
    }, [dispatch]);

    const endTurn = useCallback(() => {
        dispatch({ type: 'END_TURN' });
    }, [dispatch]);

    const handleEventChoice = useCallback((choice: EventChoice) => {
        dispatch({ type: 'HANDLE_EVENT_CHOICE', payload: { choice } });
    }, [dispatch]);

    const toggleCoalitionPartner = useCallback((partnerId: EntityId) => {
        dispatch({ type: 'TOGGLE_COALITION_PARTNER', payload: { partnerId } });
    }, [dispatch]);

    const updateAutoCampaign = useCallback((settings: AutoCampaignStrategy) => {
        dispatch({ type: 'UPDATE_AUTO_CAMPAIGN', payload: { settings } });
    }, [dispatch]);

    const formGovernment = useCallback((proposal: { partners: EntityId[], policyStances: Stance[], ministriesOffered: Record<EntityId, number> }) => {
        dispatch({ type: 'FORM_GOVERNMENT', payload: proposal });
    }, [dispatch]);

    const setSelectedConstituency = useCallback((constituencyId: EntityId) => {
        dispatch({ type: 'SET_SELECTED_CONSTITUENCY', payload: { constituencyId } });
    }, [dispatch]);

    const saveGame = useCallback(() => {
        dispatch({ type: 'SAVE_GAME' });
    }, [dispatch]);

    const loadGame = useCallback(() => {
        // Mock load
        dispatch({ type: 'LOAD_GAME', payload: {} });
    }, [dispatch]);

    const reorderList = useCallback((constituencyId: EntityId, politicianId: string, newIndex: number) => {
        dispatch({ type: 'REORDER_LIST', payload: { constituencyId, politicianId, newIndex } });
    }, [dispatch]);

    const resolveCrisisHandler = useCallback((crisisId: string, choiceIndex: number) => {
        dispatch({ type: 'RESOLVE_CRISIS', payload: { crisisId, choiceIndex } });
    }, [dispatch]);

    const voteOnLegislationHandler = useCallback((law: BillData) => {
        dispatch({ type: 'VOTE_LEGISLATION', payload: { law } });
    }, [dispatch]);

    const startGame = useCallback((playerPartyId: string) => {
        dispatch({ type: 'START_GAME', payload: { playerPartyId } });
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
        updateAutoCampaign,
        startGame
    };
};
