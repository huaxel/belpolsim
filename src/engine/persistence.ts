import type { GameState } from '../types';

export const saveGame = (state: GameState): GameState => {
    localStorage.setItem('belpolsim_save', JSON.stringify(state));
    return {
        ...state,
        eventLog: [...state.eventLog, "Game Saved."]
    };
};

export const loadGame = (): GameState | null => {
    const saved = localStorage.getItem('belpolsim_save');
    if (saved) {
        return JSON.parse(saved);
    } else {
        return null;
    }
};
