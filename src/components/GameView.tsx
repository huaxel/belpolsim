import { useEffect, useState } from 'react';
import { TrendingDown, Save, LogOut } from 'lucide-react';
import { useGameLogic } from '../hooks/useGameLogic';
import { Layout } from './Layout';
import { BelgiumMap } from './BelgiumMap';
import { PollingDashboard } from './PollingDashboard';
import { CampaignDashboard } from './CampaignDashboard';
import { CoalitionInterface } from './CoalitionInterface';
import { KingsPalace } from './KingsPalace';
import { EventLog } from './EventLog';
import { EventModal } from './EventModal';
import { GovernmentDashboard } from './GovernmentDashboard';
import { ParliamentView } from './ParliamentView';
import { CrisisModal } from './CrisisModal';
import { PartyListEditor } from './PartyListEditor';

interface GameViewProps {
    shouldLoad: boolean;
    onExit: () => void;
}

import { ToastProvider } from './ui/ToastProvider';

export const GameView = ({ shouldLoad, onExit }: GameViewProps) => {
    const {
        gameState,
        handleAction,
        endTurn,
        handleEventChoice,
        setSelectedConstituency,
        saveGame,
        loadGame,
        dispatch,
        toggleCoalitionPartner,
        formGovernment,
        reorderList,
        resolveCrisis,
        voteOnLegislation,
        updateAutoCampaign
    } = useGameLogic();

    const [activeView, setActiveView] = useState('dashboard');

    useEffect(() => {
        if (shouldLoad) {
            loadGame();
        }
    }, [shouldLoad]);

    const renderContent = () => {

        switch (activeView) {
            case 'dashboard':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                        <div className="lg:col-span-2 space-y-6">
                            {gameState.gamePhase === 'campaign' && (
                                <CampaignDashboard
                                    gameState={gameState}
                                    selectedConstituency={gameState.selectedConstituency}
                                    onPerformAction={(actionType, targetDemographic) => {
                                        handleAction(actionType, targetDemographic);
                                    }}
                                    onSelectConstituency={setSelectedConstituency}
                                    onUpdateAutoCampaign={updateAutoCampaign}
                                />
                            )}
                            {gameState.gamePhase === 'governing' && (
                                <GovernmentDashboard
                                    gameState={gameState}
                                    onUpdateState={(newState) => dispatch({ type: 'LOAD_GAME', payload: newState })}
                                />
                            )}
                            <PollingDashboard gameState={gameState} />
                        </div>
                        <div className="space-y-6">
                            <EventLog logs={gameState.eventLog} />
                            <button
                                onClick={endTurn}
                                className="w-full py-4 btn-primary shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center transition-all"
                            >
                                End Turn {gameState.turn} <TrendingDown className="ml-2" />
                            </button>
                        </div>
                    </div>
                );
            case 'map':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full animate-in fade-in duration-500">
                        <div className="lg:col-span-2 card flex flex-col">
                            <h2 className="text-xl font-bold mb-4">Electoral Map</h2>
                            <div className="flex-1 flex items-center justify-center bg-black/5 rounded-lg">
                                <BelgiumMap
                                    gameState={gameState}
                                    onSelect={setSelectedConstituency}
                                />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <PollingDashboard gameState={gameState} />
                        </div>
                    </div>
                );
            case 'parliament':
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {gameState.gamePhase === 'consultation' && (
                            <KingsPalace gameState={gameState} onAction={dispatch} />
                        )}
                        {gameState.gamePhase === 'formation' && (
                            <CoalitionInterface
                                gameState={gameState}
                                onTogglePartner={toggleCoalitionPartner}
                                onFormGovernment={formGovernment}
                            />
                        )}
                        {gameState.gamePhase === 'governing' && (
                            <ParliamentView gameState={gameState} onVote={voteOnLegislation} />
                        )}
                        {gameState.gamePhase === 'campaign' && (
                            <div className="text-center p-12 text-slate-500">
                                <h2 className="text-2xl font-bold mb-2">Parliament is currently dissolved</h2>
                                <p>Elections will take place after the campaign.</p>
                            </div>
                        )}
                    </div>
                );
            case 'party':
                return (
                    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] animate-in fade-in duration-500">
                        <PartyListEditor gameState={gameState} onReorder={reorderList} />
                    </div>
                );
            case 'settings':
                return (
                    <div className="max-w-xl mx-auto space-y-4 animate-in fade-in duration-500">
                        <h2 className="text-2xl font-bold text-white mb-6">Game Settings</h2>
                        <button onClick={saveGame} className="w-full p-4 btn-primary flex items-center justify-center gap-2 font-bold">
                            <Save size={20} /> Save Game
                        </button>
                        <button onClick={onExit} className="w-full p-4 btn-danger flex items-center justify-center gap-2 font-bold">
                            <LogOut size={20} /> Exit to Menu
                        </button>
                    </div>
                );
            default:
                return <div>View not found</div>;
        }
    };

    return (
        <ToastProvider>
            <Layout state={gameState} activeView={activeView} onViewChange={setActiveView}>
                {gameState.currentEvent && (
                    <EventModal event={gameState.currentEvent} onChoice={handleEventChoice} />
                )}
                {gameState.crises.length > 0 && (
                    <CrisisModal crisis={gameState.crises[0]} onResolve={resolveCrisis} />
                )}
                {renderContent()}
            </Layout>
        </ToastProvider>
    );
};
