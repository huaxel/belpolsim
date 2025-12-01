import { Play, Save } from 'lucide-react';

interface MainMenuProps {
    onNewGame: () => void;
    onLoadGame: () => void;
}

export const MainMenu = ({ onNewGame, onLoadGame }: MainMenuProps) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">BELPOLSIM - V2 CHECK</h1>
                    <p className="text-gray-500">The Ultimate Belgian Political Simulator</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={onNewGame}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center transition-all transform hover:scale-105"
                    >
                        <Play className="mr-2" /> New Campaign
                    </button>

                    <button
                        onClick={onLoadGame}
                        className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl flex items-center justify-center transition-all"
                    >
                        <Save className="mr-2" /> Load Game
                    </button>
                </div>

                <div className="text-xs text-gray-400">
                    v0.9.0 - Phase 10: Architecture Update
                </div>
            </div>
        </div>
    );
};
