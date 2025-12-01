import type { Crisis } from '../types';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface CrisisModalProps {
    crisis: Crisis;
    onResolve: (crisisId: string, choiceIndex: number) => void;
}

export const CrisisModal = ({ crisis, onResolve }: CrisisModalProps) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-red-500/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-red-900/30 p-6 border-b border-red-500/30 flex items-center gap-4">
                    <div className="p-3 bg-red-500 rounded-full text-white shadow-lg animate-pulse">
                        <AlertTriangle size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">CRISIS ALERT</h2>
                        <p className="text-red-300 font-bold uppercase tracking-wider text-sm">{crisis.title}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <p className="text-slate-300 text-lg leading-relaxed mb-8">
                        {crisis.description}
                    </p>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Available Responses</h3>
                        {crisis.choices.map((choice, index) => (
                            <button
                                key={index}
                                onClick={() => onResolve(crisis.id, index)}
                                className="w-full text-left bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 p-4 rounded-xl transition-all group group-hover:shadow-lg"
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">{choice.text}</span>
                                    <CheckCircle className="text-slate-600 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                                </div>
                                <p className="text-slate-400 text-sm">{choice.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-950 p-4 text-center text-xs text-slate-600 border-t border-slate-800">
                    Crisis Management Protocol Active • Turns Remaining: {crisis.turnsRemaining}
                </div>
            </div>
        </div>
    );
};
