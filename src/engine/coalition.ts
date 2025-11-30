import { MAJORITY_SEATS } from '../constants';
import type { GameState, PartyId, ActionResult } from '../types';

export const toggleCoalitionPartner = (state: GameState, partnerId: PartyId): ActionResult => {
    const partner = state.parties[partnerId];

    if (partner.isExtremist) {
        const message = `CORDON SANITAIRE: Cannot ally with ${partner.name}.`;
        return { newState: state, success: false, message };
    }

    // Obsolete demand/redLine logic has been removed.
    // The new Friction system will handle coalition compatibility.

    const current = state.coalitionPartners;
    const isPartner = current.includes(partnerId);
    
    const newCoalitionPartners = isPartner 
        ? current.filter(id => id !== partnerId) 
        : [...current, partnerId];
        
    const message = isPartner 
        ? `${partner.name} removed from coalition talks.`
        : `${partner.name} added to coalition talks.`;

    return {
        newState: {
            ...state,
            coalitionPartners: newCoalitionPartners
        },
        success: true,
        message
    };
};

import { validateGovernment } from './government';

export const formGovernment = (state: GameState): ActionResult => {
    // This is a placeholder for the full proposal that will come from the UI
    const proposal = {
        partners: [...state.coalitionPartners, state.playerPartyId],
        ministers: [], // The UI will need to build this list
        primeMinister: null // The UI will need to set this
    };

    // For now, we'll just check the seat count and Cordon Sanitaire via validateGovernment
    const tempProposal = { partners: [...state.coalitionPartners, state.playerPartyId], ministers:[], primeMinister: null };


    // The full validation will be more complex, for now we just use the seat count part
    const validation = validateGovernment(tempProposal, state);

    if (validation.isValid) {
        const total = tempProposal.partners.reduce((sum, id) => sum + state.parties[id].totalSeats, 0);
        const message = `GOVERNMENT FORMED with ${total} seats!`;
        return {
            newState: {
                ...state,
                isGameOver: true,
                isCoalitionPhase: false,
                eventLog: [...state.eventLog, message]
            },
            success: true,
            message
        };
    } else {
        return { newState: state, success: false, message: validation.reason };
    }
};
