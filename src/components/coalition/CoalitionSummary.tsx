import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { TOTAL_SEATS } from '../../constants';
import type { PartyId } from '../../types';

interface CoalitionSummaryProps {
    currentCoalitionSeats: number;
    majorityReached: boolean;
    onFormGovernment: () => void;
    aiFeedback: { partyId: PartyId; partyName: string; accepted: boolean; reason: string }[];
}

export const CoalitionSummary = ({
    currentCoalitionSeats,
    majorityReached,
    onFormGovernment,
    aiFeedback
}: CoalitionSummaryProps) => {
    const allAccepted = aiFeedback.every(f => f.accepted);
    const canPropose = majorityReached && allAccepted;

    return (
        <div className="bg-gray-50 p-6 rounded-xl mt-8 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Coalition Status</h3>

            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-500 uppercase font-bold tracking-wider">Parliamentary Support</div>
                        <div className="flex items-baseline space-x-2">
                            <span className={`text-3xl font-black ${majorityReached ? "text-green-600" : "text-red-600"}`}>
                                {currentCoalitionSeats}
                            </span>
                            <span className="text-gray-400 font-medium">/ {TOTAL_SEATS} seats</span>
                        </div>
                        {majorityReached && (
                            <div className="flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs font-bold">
                                <CheckCircle size={14} className="mr-1" /> Majority
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        {aiFeedback.length === 0 && <p className="text-gray-400 italic text-sm">Select partners to see their feedback.</p>}
                        {aiFeedback.map(feedback => (
                            <div key={feedback.partyId} className={`flex items-start p-3 rounded-lg text-sm ${feedback.accepted ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                                <div className="mt-0.5 mr-3 flex-shrink-0">
                                    {feedback.accepted ? <CheckCircle size={16} className="text-green-600" /> : <XCircle size={16} className="text-red-600" />}
                                </div>
                                <div>
                                    <span className="font-bold block text-gray-800">{feedback.partyName}</span>
                                    <span className={feedback.accepted ? 'text-green-700' : 'text-red-700'}>{feedback.reason}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                    <button
                        onClick={onFormGovernment}
                        disabled={!canPropose}
                        className={`w-full md:w-auto px-8 py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 flex items-center justify-center
                            ${canPropose
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }
                        `}
                    >
                        {canPropose ? 'Form Government' : 'Negotiation Incomplete'}
                    </button>
                    {!majorityReached && <p className="text-xs text-red-500 font-medium flex items-center"><AlertTriangle size={12} className="mr-1" /> Majority not reached</p>}
                    {majorityReached && !allAccepted && <p className="text-xs text-red-500 font-medium flex items-center"><AlertTriangle size={12} className="mr-1" /> Partners reject proposal</p>}
                </div>
            </div>
        </div>
    );
};
