import type { GameState } from '../types';

export const saveGame = (state: GameState): GameState => {
    localStorage.setItem('belpolsim_save', JSON.stringify(state));
    alert('Game Saved!');
    return state;
};

export const loadGame = (): GameState | null => {
    const saved = localStorage.getItem('belpolsim_save');
    if (saved) {
        alert('Game Loaded!');
        return JSON.parse(saved);
    } else {
        alert('No save game found.');
        return null;
    }
};
