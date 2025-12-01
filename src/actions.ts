import type {
    ConstituencyId,
    PartyId,
    EventChoice,
    Law,
    DemographicGroup,
    AutoCampaignStrategy,
    Stance
} from './types';

export type ActionType =
    | 'canvas'
    | 'rally'
    | 'posters'
    | 'fundraise'
    | 'tv_ad'
    | 'debate'
    | 'negative_campaign'
    | 'emergency_rally'
    | 'policy_announcement'
    | 'social_media'
    | 'newspaper'
    | 'radio'
    | 'door_to_door';

export type Action =
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
    | { type: 'LOAD_GAME', payload?: any } // Allow payload for state updates
    | { type: 'CALCULATE_ELECTION' }
    | { type: 'MEET_THE_KING' }
    | { type: 'REORDER_LIST', payload: { constituencyId: ConstituencyId, politicianId: string, newIndex: number } }
    | { type: 'RESOLVE_CRISIS', payload: { crisisId: string, choiceIndex: number } }
    | { type: 'VOTE_LEGISLATION', payload: { law: Law } }
    | { type: 'UPDATE_AUTO_CAMPAIGN', payload: { settings: AutoCampaignStrategy } };
