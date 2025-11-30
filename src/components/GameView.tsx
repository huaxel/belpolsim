import { useEffect } from 'react';
import { TrendingDown, Save, LogOut } from 'lucide-react';
import { useGameLogic } from '../hooks/useGameLogic';
import { Header } from './Header';
import { BelgiumMap } from './BelgiumMap';
import { PollingDashboard } from './PollingDashboard';
import { ActionGrid } from './ActionGrid';
import { CoalitionInterface } from './CoalitionInterface';
import { CandidateProfile } from './CandidateProfile';
import { EventLog } from './EventLog';
import { EventModal } from './EventModal';
import { GovernmentView } from './GovernmentView';

interface GameViewProps {
    shouldLoad: boolean;
    onExit: () => void;
}

export const GameView = ({ shouldLoad, onExit }: GameViewProps) => {
    const {
        gameState,
        handleAction,
        endTurn,
        handleEventChoice,
        toggleCoalitionPartner,
        formGovernment,
        setSelectedConstituency,
        saveGame,
        loadGame
    } = useGameLogic();

    useEffect(() => {
        if (shouldLoad) {
            loadGame();
        }
    }, [shouldLoad]);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                <div className="flex justify-between items-center mb-4">
                    <Header gameState={gameState} />
                    <div className="flex gap-2">
                        <button onClick={saveGame} className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200" title="Save Game">
                            <Save size={20} />
                        </button>
                        <button onClick={onExit} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200" title="Exit to Menu">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {gameState.currentEvent && (
                    <EventModal event={gameState.currentEvent} onChoice={handleEventChoice} />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left: Map/Selector */}
                    <div className="lg:col-span-4 space-y-6">
                        <BelgiumMap
                            gameState={gameState}
                            onSelect={setSelectedConstituency}
                        />

                        <PollingDashboard
                            gameState={gameState}
                        />
                    </div>
                    {/* Center: Actions & Candidates */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Actions */}
                        {!gameState.isGameOver && !gameState.isCoalitionPhase && !gameState.isGoverning && (
                            <ActionGrid onAction={handleAction} />
                        )}

                        {/* Coalition UI */}
                        {gameState.isCoalitionPhase && (
                            <CoalitionInterface
                                gameState={gameState}
                                onTogglePartner={toggleCoalitionPartner}
                                onFormGovernment={formGovernment}
                            />
                        )}

                        {/* Government UI */}
                        {gameState.isGoverning && (
                            <GovernmentView gameState={gameState} />
                        )}

                        {/* Candidates Profile (Player Career) */}
                        <CandidateProfile gameState={gameState} />
                    </div>

                    {/* Right: Log & Global Stats */}
                    <div className="lg:col-span-3 space-y-6">
                        <EventLog logs={gameState.eventLog} />

                        <button
                            onClick={endTurn}
                            disabled={gameState.isGameOver || gameState.isCoalitionPhase}
                            className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 disabled:opacity-50 flex justify-center items-center"
                        >
                            End Week {gameState.week} <TrendingDown className="ml-2" />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
