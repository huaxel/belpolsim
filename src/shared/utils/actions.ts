import type {
    EntityId as ConstituencyId,
    EntityId as PartyId,
    EventChoice,
    BillData as Law, // Mapping Law to BillData
    // AutoCampaignStrategy, // Not exported from core?
    // Stance // Not exported from core?
    GameState,
    CampaignActionType
} from '@/core';

// Define missing types locally if not in core, or map to core types
export type Stance = { issueId: string; position: number; salience: number };
export type AutoCampaignStrategy = { isEnabled: boolean; budgetLimit: number; priorities: Record<string, unknown>; regions: Record<string, unknown> };

export type ActionType =
    | CampaignActionType
    | 'canvas'
    | 'posters'
    | 'tv_ad'
    | 'negative_campaign'
    | 'emergency_rally'
    | 'policy_announcement'
    | 'social_media'
    | 'newspaper'
    | 'radio';

export type Action =
    | {
        type: 'PERFORM_ACTION',
        payload: {
            actionType: ActionType,
            targetConstituencyId?: ConstituencyId,
            focusIssueId?: string
        }
    }
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
    | { type: 'LOAD_GAME', payload: Partial<GameState> }
    | { type: 'CALCULATE_ELECTION' }
    | { type: 'MEET_THE_KING' }
    | { type: 'REORDER_LIST', payload: { constituencyId: ConstituencyId, politicianId: string, newIndex: number } }
    | { type: 'RESOLVE_CRISIS', payload: { crisisId: string, choiceIndex: number } }
    | { type: 'VOTE_LEGISLATION', payload: { law: Law } }
    | { type: 'VOTE_LEGISLATION', payload: { law: Law } }
    | { type: 'UPDATE_AUTO_CAMPAIGN', payload: { settings: AutoCampaignStrategy } }
    | { type: 'START_GAME', payload: { playerPartyId: string } };

