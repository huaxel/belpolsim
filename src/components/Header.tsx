import { Calendar, Coins, Zap } from 'lucide-react';
import type { GameState } from '../types';

interface HeaderProps {
    gameState: GameState;
}

export const Header = ({ gameState }: HeaderProps) => {
    return (
        <header className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-center mb-6 sticky top-0 z-20">
            <div className="flex items-center space-x-4">
                <div className="bg-gray-900 text-white p-2 rounded-lg"><Calendar size={20} /></div>
                <div>
                    <h1 className="font-bold text-lg leading-tight">Belgian Election Sim</h1>
                    <p className="text-xs text-gray-500">Week {gameState.week} / {gameState.maxWeeks}</p>
                </div>
            </div>
            <div className="flex space-x-6">
                <div className="flex items-center space-x-2"><Coins className="text-yellow-500" /><span className="font-bold">€{gameState.budget}</span></div>
                <div className="flex items-center space-x-2"><Zap className="text-orange-500" /><span className="font-bold">{gameState.energy}/{gameState.maxEnergy} AP</span></div>
            </div>
        </header>
    );
};
