import React from 'react';
import { Euro, Zap, Calendar } from 'lucide-react';
import type { GameState } from '../types';

interface TopBarProps {
    state: GameState;
}

export const TopBar: React.FC<TopBarProps> = ({ state }) => {
    return (
        <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 shadow-sm">
            <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/10 rounded-full text-blue-500">
                        <Euro size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Budget</p>
                        <p className="text-lg font-mono font-bold text-white">€{state.budget.toLocaleString()}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-500/10 rounded-full text-yellow-500">
                        <Zap size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Energy</p>
                        <p className="text-lg font-mono font-bold text-white">{state.energy} / {state.maxEnergy}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3 text-right">
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Turn</p>
                        <p className="text-lg font-mono font-bold text-white">{state.turn} / {state.maxTurns}</p>
                    </div>
                    <div className="p-2 bg-purple-500/10 rounded-full text-purple-500">
                        <Calendar size={18} />
                    </div>
                </div>

                <div className="h-8 w-px bg-slate-700 mx-4"></div>

                <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30 uppercase tracking-wide">
                        {state.gamePhase.replace('_', ' ')}
                    </span>
                </div>
            </div>
        </div>
    );
};
