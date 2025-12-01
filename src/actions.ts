import type { ConstituencyId, PartyId, EventChoice, Law, Stance } from './types';

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
            policyStances: Stance[];
            ministriesOffered: Record<PartyId, number>;
        }
    }
    | { type: 'MEET_THE_KING' }
    | { type: 'SET_SELECTED_CONSTITUENCY'; payload: { constituencyId: ConstituencyId } }
    | { type: 'SAVE_GAME' }
    | { type: 'LOAD_GAME' }
    | { type: 'CALCULATE_ELECTION' }
    | {
        type: 'REORDER_LIST';
        payload: {
            constituencyId: ConstituencyId;
            politicianId: string;
            newIndex: number; // 0-based index
        }
    }
    | { type: 'RESOLVE_CRISIS'; payload: { crisisId: string; choiceIndex: number } }
    | { type: 'VOTE_LEGISLATION'; payload: { law: Law } };
