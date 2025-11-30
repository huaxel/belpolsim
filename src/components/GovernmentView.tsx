import { Users, TrendingUp, Euro } from 'lucide-react';
import type { GameState } from '../types';

interface GovernmentViewProps {
    gameState: GameState;
}

export const GovernmentView = ({ gameState }: GovernmentViewProps) => {
    const { government, nationalBudget, parties } = gameState;

    if (!government) return <div>Loading Government...</div>;

    return (
        <div className="space-y-6">
            {/* Top Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500 font-bold uppercase">Stability</div>
                        <div className="text-2xl font-black text-gray-900">{government.stability}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div
                                className={`h-2.5 rounded-full ${government.stability > 50 ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${government.stability}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
                        <Euro size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500 font-bold uppercase">National Budget</div>
                        <div className="text-2xl font-black text-gray-900">€{nationalBudget}M</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                        <Users size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500 font-bold uppercase">Coalition Size</div>
                        <div className="text-2xl font-black text-gray-900">{government.partners.length} Parties</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cabinet List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="mr-2">🏛️</span> The Cabinet
                    </h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {government.ministers.map((minister, idx) => {
                            const party = parties[minister.partyId];

                            return (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-2 h-10 rounded-full ${party?.color || 'bg-gray-400'}`}></div>
                                        <div>
                                            <div className="font-bold text-gray-900">{minister.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {party?.name} • {minister.language === 'dutch' ? '🇳🇱 FL' : '🇫🇷 FR'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-medium text-gray-600">
                                        Minister
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Coalition Agreement */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="mr-2">📜</span> Coalition Agreement
                    </h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {government.agreement.map((stance, idx) => {
                            const issue = gameState.issues[stance.issueId];
                            return (
                                <div key={idx} className="p-3 border border-gray-200 rounded-lg">
                                    <div className="font-bold text-gray-700 mb-1">{issue.name}</div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-gray-500">Left</span>
                                        <div className="flex-grow h-2 bg-gray-200 rounded-full relative">
                                            <div
                                                className="absolute top-0 bottom-0 w-2 bg-indigo-600 rounded-full"
                                                style={{ left: `${stance.position}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-500">Right</span>
                                    </div>
                                    <div className="text-center text-xs font-bold text-indigo-600 mt-1">
                                        Position: {stance.position}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Actions Placeholder */}
            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 text-center">
                <h3 className="text-lg font-bold text-indigo-900 mb-2">Legislative Agenda</h3>
                <p className="text-indigo-600 mb-4">Draft bills and pass laws to fulfill your coalition agreement.</p>
                <button className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                    Draft New Bill (Coming Soon)
                </button>
            </div>
        </div>
    );
};
