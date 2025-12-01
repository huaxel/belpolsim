import React from 'react';
import { Lightbulb, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import type { GameState, ConstituencyId, DemographicGroup } from '../types';
import type { CampaignActionType } from '../engine/campaignLogic';
import { generateRecommendations } from '../engine/campaignLogic';
import { CONSTITUENCIES } from '../constants';

interface CampaignRecommendationsProps {
    gameState: GameState;
    onQuickAction: (constId: ConstituencyId, action: CampaignActionType, demo?: DemographicGroup) => void;
}

export const CampaignRecommendations: React.FC<CampaignRecommendationsProps> = ({
    gameState,
    onQuickAction
}) => {
    const recommendations = generateRecommendations(gameState);

    // Only show top 3 critical/competitive recommendations to avoid clutter
    const displayRecs = recommendations.slice(0, 3);

    return (
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-700 h-full">
            <div className="flex items-center mb-4">
                <Lightbulb className="text-yellow-400 mr-2" size={24} />
                <h3 className="text-xl font-bold text-white">Strategic Insights</h3>
            </div>

            <div className="space-y-3">
                {displayRecs.map(rec => (
                    <div
                        key={rec.constituencyId}
                        className={`p-3 rounded border ${rec.priority === 'critical'
                            ? 'bg-red-900/20 border-red-800'
                            : rec.priority === 'competitive'
                                ? 'bg-yellow-900/20 border-yellow-800'
                                : 'bg-green-900/20 border-green-800'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="flex items-center">
                                    {rec.priority === 'critical' && <AlertCircle size={16} className="text-red-500 mr-1" />}
                                    {rec.priority === 'competitive' && <AlertCircle size={16} className="text-yellow-500 mr-1" />}
                                    {rec.priority === 'safe' && <CheckCircle size={16} className="text-green-500 mr-1" />}
                                    <span className={`font-bold ${rec.priority === 'critical' ? 'text-red-400' :
                                        rec.priority === 'competitive' ? 'text-yellow-400' : 'text-green-400'
                                        }`}>
                                        {rec.priority.toUpperCase()}:
                                    </span>
                                    <span className="text-white ml-2 font-medium">
                                        {CONSTITUENCIES[rec.constituencyId].name}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-400 ml-5">
                                    Margin: {rec.margin.toFixed(1)}%
                                </div>
                            </div>

                            <button
                                onClick={() => onQuickAction(rec.constituencyId, rec.recommendedAction, rec.recommendedDemographic)}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded flex items-center transition-colors"
                            >
                                Quick Action <ArrowRight size={12} className="ml-1" />
                            </button>
                        </div>

                        <div className="ml-5 text-sm text-slate-300">
                            <span className="text-slate-500">Recommendation:</span> {rec.recommendedAction.replace('_', ' ')}
                            {rec.recommendedDemographic && <span className="text-slate-400"> targeting {rec.recommendedDemographic}</span>}
                        </div>
                        <div className="ml-5 text-xs text-slate-500 mt-1 italic">
                            {rec.reasoning}
                        </div>
                    </div>
                ))}

                {recommendations.length > 3 && (
                    <div className="text-center text-xs text-slate-500 mt-2">
                        + {recommendations.length - 3} more regions analyzed
                    </div>
                )}
            </div>
        </div>
    );
};
