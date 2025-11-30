import type { ConstituencyId, PartyId, EventChoice } from './types';

export type ActionType = 'canvas' | 'posters' | 'rally' | 'fundraise' | 'tv_ad' | 'debate';

export type Action =
    | { type: 'PERFORM_ACTION'; payload: { actionType: ActionType } }
    | { type: 'END_TURN' }
    | { type: 'HANDLE_EVENT_CHOICE'; payload: { choice: EventChoice } }
    | { type: 'TOGGLE_COALITION_PARTNER'; payload: { partnerId: PartyId } }
    | {
        type: 'FORM_GOVERNMENT';
        payload: {
            partners: PartyId[];
            policyStances: any[]; // Using any[] temporarily to avoid circular dependency or complex import, ideally should be Stance[]
            ministriesOffered: Record<PartyId, number>;
        }
    }
    | { type: 'SET_SELECTED_CONSTITUENCY'; payload: { constituencyId: ConstituencyId } }
    | { type: 'SAVE_GAME' }
    | { type: 'LOAD_GAME' }
    | { type: 'CALCULATE_ELECTION' };
