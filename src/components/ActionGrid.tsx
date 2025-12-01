import { Megaphone, TrendingUp, Users, Vote } from 'lucide-react';

interface ActionGridProps {
    onAction: (action: 'canvas' | 'posters' | 'rally' | 'fundraise' | 'tv_ad' | 'debate') => void;
}

export const ActionGrid = ({ onAction }: ActionGridProps) => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Local Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => onAction('canvas')} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-blue-500 hover:bg-slate-750 text-left transition-all group">
                        <div className="flex justify-between mb-2">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <Users size={20} />
                            </div>
                            <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">-2 AP</span>
                        </div>
                        <div className="font-bold text-slate-200">Canvassing</div>
                        <div className="text-xs text-slate-400 mt-1">Low risk, steady gain in local polling.</div>
                    </button>

                    <button onClick={() => onAction('posters')} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-purple-500 hover:bg-slate-750 text-left transition-all group">
                        <div className="flex justify-between mb-2">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                <Vote size={20} />
                            </div>
                            <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded">-€800</span>
                        </div>
                        <div className="font-bold text-slate-200">Posters</div>
                        <div className="text-xs text-slate-400 mt-1">Good visibility, moderate cost.</div>
                    </button>

                    <button onClick={() => onAction('rally')} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-red-500 hover:bg-slate-750 text-left transition-all group">
                        <div className="flex justify-between mb-2">
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                <Megaphone size={20} />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded mb-1">-€1200</span>
                                <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">-3 AP</span>
                            </div>
                        </div>
                        <div className="font-bold text-slate-200">Mass Rally</div>
                        <div className="text-xs text-slate-400 mt-1">High risk/reward. Depends on charisma.</div>
                    </button>

                    <button onClick={() => onAction('fundraise')} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-green-500 hover:bg-slate-750 text-left transition-all group">
                        <div className="flex justify-between mb-2">
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                <TrendingUp size={20} />
                            </div>
                            <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">+€1000</span>
                        </div>
                        <div className="font-bold text-slate-200">Fundraiser</div>
                        <div className="text-xs text-slate-400 mt-1">Gain budget, but lose some popularity.</div>
                    </button>
                </div>
            </div>

            <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">National Campaign</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => onAction('tv_ad')} className="bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-900/40 text-left transition-all group">
                        <div className="flex justify-between mb-2">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                <Megaphone size={20} />
                            </div>
                            <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded">-€3000</span>
                        </div>
                        <div className="font-bold text-indigo-100">TV Ad Campaign</div>
                        <div className="text-xs text-indigo-300/70 mt-1">Boosts polling in ALL regions.</div>
                    </button>

                    <button onClick={() => onAction('debate')} className="bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-900/40 text-left transition-all group">
                        <div className="flex justify-between mb-2">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                <Users size={20} />
                            </div>
                            <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">-3 AP</span>
                        </div>
                        <div className="font-bold text-indigo-100">National Debate</div>
                        <div className="text-xs text-indigo-300/70 mt-1">High stakes. Depends on expertise.</div>
                    </button>
                </div>
            </div>
        </div>
    );
};
