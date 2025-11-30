import { Megaphone, TrendingUp, Users, Vote } from 'lucide-react';

interface ActionGridProps {
    onAction: (action: 'canvas' | 'posters' | 'rally' | 'fundraise' | 'tv_ad' | 'debate') => void;
}

export const ActionGrid = ({ onAction }: ActionGridProps) => {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Local Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => onAction('canvas')} className="bg-white p-4 rounded-xl border hover:border-blue-500 hover:shadow-md text-left transition-all">
                        <div className="flex justify-between mb-2"><Users className="text-blue-500" /><span className="text-xs font-bold text-orange-500">-2 AP</span></div>
                        <div className="font-bold">Canvassing</div>
                        <div className="text-xs text-gray-500">Low risk, steady gain.</div>
                    </button>
                    <button onClick={() => onAction('posters')} className="bg-white p-4 rounded-xl border hover:border-blue-500 hover:shadow-md text-left transition-all">
                        <div className="flex justify-between mb-2"><Vote className="text-purple-500" /><span className="text-xs font-bold text-red-500">-€800</span></div>
                        <div className="font-bold">Posters</div>
                        <div className="text-xs text-gray-500">Good visibility.</div>
                    </button>
                    <button onClick={() => onAction('rally')} className="bg-white p-4 rounded-xl border hover:border-blue-500 hover:shadow-md text-left transition-all">
                        <div className="flex justify-between mb-2"><Megaphone className="text-red-500" /><span className="text-xs font-bold text-red-500">-€1200</span></div>
                        <div className="font-bold">Mass Rally</div>
                        <div className="text-xs text-gray-500">High risk/reward.</div>
                    </button>
                    <button onClick={() => onAction('fundraise')} className="bg-white p-4 rounded-xl border hover:border-blue-500 hover:shadow-md text-left transition-all">
                        <div className="flex justify-between mb-2"><TrendingUp className="text-green-500" /><span className="text-xs font-bold text-green-500">+€1000</span></div>
                        <div className="font-bold">Fundraiser</div>
                        <div className="text-xs text-gray-500">Lose popularity.</div>
                    </button>
                </div>
            </div>

            <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">National Campaign</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => onAction('tv_ad')} className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 hover:border-indigo-500 hover:shadow-md text-left transition-all">
                        <div className="flex justify-between mb-2"><Megaphone className="text-indigo-500" /><span className="text-xs font-bold text-red-500">-€3000</span></div>
                        <div className="font-bold text-indigo-900">TV Ad Campaign</div>
                        <div className="text-xs text-indigo-700">Boosts ALL regions.</div>
                    </button>
                    <button onClick={() => onAction('debate')} className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 hover:border-indigo-500 hover:shadow-md text-left transition-all">
                        <div className="flex justify-between mb-2"><Users className="text-indigo-500" /><span className="text-xs font-bold text-orange-500">-3 AP</span></div>
                        <div className="font-bold text-indigo-900">National Debate</div>
                        <div className="text-xs text-indigo-700">High stakes, national impact.</div>
                    </button>
                </div>
            </div>
        </div>
    );
};
