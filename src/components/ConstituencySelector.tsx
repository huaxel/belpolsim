import { CONSTITUENCIES, REGIONS } from '../constants';
import type { Constituency, ConstituencyId } from '../types';

interface ConstituencySelectorProps {
    selectedConstituency: ConstituencyId;
    onSelect: (id: ConstituencyId) => void;
}

export const ConstituencySelector = ({ selectedConstituency, onSelect }: ConstituencySelectorProps) => {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Select Constituency</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {REGIONS.map(r => (
                    <div key={r} className="space-y-2">
                        <h4 className="font-bold text-gray-700 capitalize border-b pb-1">{r}</h4>
                        {(Object.values(CONSTITUENCIES) as Constituency[]).filter(c => c.region === r).map(c => (
                            <button
                                key={c.id}
                                onClick={() => onSelect(c.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${selectedConstituency === c.id
                                    ? 'bg-blue-600 text-white font-bold shadow-md'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {c.name} <span className="opacity-70 text-xs">({c.seats})</span>
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};
