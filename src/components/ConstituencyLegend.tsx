/**
 * Constituency Importance Legend
 * 
 * Shows what the constituency highlighting colors mean
 */

import { Info } from 'lucide-react';

export const ConstituencyLegend = () => {
    return (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center">
                <Info size={16} className="mr-2" />
                Constituency Importance
            </h3>

            <div className="space-y-2 text-xs">
                <div className="flex items-center">
                    <div className="w-4 h-4 rounded border-2 border-red-500 bg-red-900/20 mr-2"></div>
                    <span className="text-red-400 font-bold mr-2">🔥 Critical</span>
                    <span className="text-slate-400">Within 3% - swing race</span>
                </div>

                <div className="flex items-center">
                    <div className="w-4 h-4 rounded border-2 border-yellow-500 bg-yellow-900/20 mr-2"></div>
                    <span className="text-yellow-400 font-bold mr-2">⚔️ Competitive</span>
                    <span className="text-slate-400">Within 8% - winnable</span>
                </div>

                <div className="flex items-center">
                    <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-900/20 mr-2"></div>
                    <span className="text-green-400 font-bold mr-2">✅ Safe</span>
                    <span className="text-slate-400">Leading by 8%+</span>
                </div>

                <div className="flex items-center">
                    <div className="w-4 h-4 rounded border-2 border-gray-600 bg-gray-900/20 mr-2"></div>
                    <span className="text-gray-400 font-bold mr-2">❌ Lost</span>
                    <span className="text-slate-400">Behind by 8%+</span>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-slate-400 text-xs italic">
                    💡 Focus your campaign on critical and competitive constituencies for maximum impact
                </p>
            </div>
        </div>
    );
};
