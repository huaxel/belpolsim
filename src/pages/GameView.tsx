import { useEffect, useState, useMemo } from 'react';
import { TrendingDown, Save, LogOut } from 'lucide-react';
import { useGameLogic } from '@/shared/hooks/useGameLogic';
import { mapECSToLegacyState } from '@/shared/utils/legacyMapper';
import { Layout, EventLog, EventModal, ToastProvider } from '@/shared/components';
import { BelgiumMap } from '@/features/map';
import { PollingDashboard, ParliamentView } from '@/features/election';
import { CampaignDashboard } from '@/features/campaign';
import { CoalitionInterface, KingsPalace } from '@/features/coalition';
import { GovernmentDashboard, CrisisModal } from '@/features/governing';
import { PartyListEditor } from '@/features/politicians';

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
        loadGame,
        dispatch,
        reorderList,
        resolveCrisis,
        voteOnLegislation,
        updateAutoCampaign
    } = useGameLogic();

    // Map ECS state to legacy format for UI compatibility
    const legacyState = useMemo(() => mapECSToLegacyState(gameState), [gameState]);
    // Use legacyState instead of gameState in render


    const [activeView, setActiveView] = useState('dashboard');

    useEffect(() => {
        if (shouldLoad) {
            loadGame();
        }
    }, [shouldLoad, loadGame]);

    const renderContent = () => {

        switch (activeView) {
            case 'dashboard':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                        <div className="lg:col-span-2 space-y-6">
                            {legacyState.gamePhase === 'campaign' && (
                                <CampaignDashboard
                                    gameState={legacyState}
                                    selectedConstituency={legacyState.selectedConstituency}
                                    onPerformAction={(actionType: any, targetDemographic: any) => {
                                        handleAction(actionType, targetDemographic);
                                    }}
                                    onSelectConstituency={setSelectedConstituency}
                                    onUpdateAutoCampaign={updateAutoCampaign}
                                />
                            )}
                            {legacyState.gamePhase === 'governing' && (
                                <GovernmentDashboard
                                    gameState={legacyState}
                                    onUpdateState={(newState: any) => dispatch({ type: 'LOAD_GAME', payload: newState })}
                                />
                            )}
                            <PollingDashboard gameState={legacyState} />
                        </div>
                        <div className="space-y-6">
                            <EventLog logs={legacyState.eventLog} />
                            <button
                                onClick={endTurn}
                                className="w-full py-4 btn-primary shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center transition-all"
                            >
                                End Turn {legacyState.turn} <TrendingDown className="ml-2" />
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
                                    gameState={legacyState}
                                    selectedConstituency={legacyState.selectedConstituency}
                                    onSelect={setSelectedConstituency}
                                />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <PollingDashboard gameState={legacyState} />
                        </div>
                    </div>
                );
            case 'parliament':
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {legacyState.gamePhase === 'consultation' && (
                            <KingsPalace gameState={legacyState} onAction={dispatch} />
                        )}
                        {legacyState.gamePhase === 'formation' && (
                            <CoalitionInterface
                                gameState={legacyState}
                                onTogglePartner={toggleCoalitionPartner}
                                onFormGovernment={formGovernment}
                            />
                        )}
                        {legacyState.gamePhase === 'governing' && (
                            <ParliamentView gameState={legacyState} onVote={voteOnLegislation} />
                        )}
                        {legacyState.gamePhase === 'campaign' && (
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
                        <PartyListEditor gameState={legacyState} onReorder={reorderList} />
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
            <Layout state={legacyState} activeView={activeView} onViewChange={setActiveView}>
                {legacyState.currentEvent && (
                    <EventModal event={legacyState.currentEvent} onChoice={handleEventChoice} />
                )}
                {legacyState.crises.length > 0 && (
                    <CrisisModal crisis={legacyState.crises[0]} onResolve={resolveCrisis} />
                )}
                {renderContent()}
            </Layout>
        </ToastProvider>
    );
};
