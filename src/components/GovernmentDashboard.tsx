import type { GameState } from '../types';
import { TrendingUp, Activity, Users, AlertTriangle } from 'lucide-react';

interface GovernmentDashboardProps {
    gameState: GameState;
}

export const GovernmentDashboard = ({ gameState }: GovernmentDashboardProps) => {
    const { nationalBudget, government, publicApproval, crises } = gameState;

    if (!government) return <div>No Government Formed</div>;

    const formatCurrency = (amount: number) => {
        return `€${(amount / 1000).toFixed(1)}B`;
    };

    return (
        <div className="space-y-6">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-slate-400 text-sm font-bold uppercase">Public Approval</span>
                        <Users className={publicApproval > 50 ? "text-green-500" : "text-red-500"} size={20} />
                    </div>
                    <div className="text-3xl font-bold text-white">{publicApproval.toFixed(1)}%</div>
                    <div className="text-xs text-slate-500 mt-1">Voter satisfaction</div>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-slate-400 text-sm font-bold uppercase">Gov. Stability</span>
                        <Activity className={government.stability > 50 ? "text-blue-500" : "text-orange-500"} size={20} />
                    </div>
                    <div className="text-3xl font-bold text-white">{government.stability.toFixed(1)}%</div>
                    <div className="text-xs text-slate-500 mt-1">Coalition cohesion</div>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-slate-400 text-sm font-bold uppercase">Active Crises</span>
                        <AlertTriangle className={crises.length > 0 ? "text-red-500" : "text-slate-600"} size={20} />
                    </div>
                    <div className="text-3xl font-bold text-white">{crises.length}</div>
                    <div className="text-xs text-slate-500 mt-1">Urgent issues</div>
                </div>
            </div>

            {/* Budget Section */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-inner">
                <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <TrendingUp className="text-yellow-500" /> National Budget
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                            <span className="text-slate-400">Revenue</span>
                            <span className="text-green-400 font-mono font-bold">{formatCurrency(nationalBudget.revenue)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                            <span className="text-slate-400">Expenses</span>
                            <span className="text-red-400 font-mono font-bold">{formatCurrency(nationalBudget.expenses)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border-t border-slate-700">
                            <span className="text-slate-200 font-bold">Deficit/Surplus</span>
                            <span className={`font-mono font-bold ${nationalBudget.deficit < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {formatCurrency(nationalBudget.deficit)}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                            <span className="text-slate-400">National Debt</span>
                            <span className="text-red-500 font-mono font-bold">{formatCurrency(nationalBudget.debt)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                            <span className="text-slate-400">GDP Growth</span>
                            <span className={`font-mono font-bold ${nationalBudget.lastYearGrowth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {nationalBudget.lastYearGrowth.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Crises List */}
            {crises.length > 0 && (
                <div className="bg-red-900/20 p-6 rounded-xl border border-red-500/30">
                    <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                        <AlertTriangle /> Active Crises
                    </h3>
                    <div className="space-y-3">
                        {crises.map(crisis => (
                            <div key={crisis.id} className="bg-slate-900/80 p-4 rounded-lg border border-red-500/20">
                                <div className="flex justify-between">
                                    <h4 className="font-bold text-white">{crisis.title}</h4>
                                    <span className="text-xs font-bold bg-red-500 text-white px-2 py-1 rounded uppercase">{crisis.severity}</span>
                                </div>
                                <p className="text-slate-400 text-sm mt-1">{crisis.description}</p>
                                <div className="mt-2 text-xs text-red-300">Turns remaining: {crisis.turnsRemaining}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
