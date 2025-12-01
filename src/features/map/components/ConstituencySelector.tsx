// Type aliases for backwards compatibility
type ConstituencyId = string;
interface Constituency {
    id: ConstituencyId;
    name: string;
    region: string;
    seats: number;
}

// Placeholder data - should be accessed from core
const REGIONS = ['flanders', 'brussels', 'wallonia'];
const CONSTITUENCIES: Record<ConstituencyId, Constituency> = {
    antwerp: { id: 'antwerp', name: 'Antwerpen', region: 'flanders', seats: 24 },
    east_flanders: { id: 'east_flanders', name: 'Oost-Vlaanderen', region: 'flanders', seats: 20 },
    west_flanders: { id: 'west_flanders', name: 'West-Vlaanderen', region: 'flanders', seats: 16 },
    flemish_brabant: { id: 'flemish_brabant', name: 'Vlaams-Brabant', region: 'flanders', seats: 15 },
    limburg: { id: 'limburg', name: 'Limburg', region: 'flanders', seats: 12 },
    brussels_capital: { id: 'brussels_capital', name: 'Brussels', region: 'brussels', seats: 15 },
    walloon_brabant: { id: 'walloon_brabant', name: 'Brabant wallon', region: 'wallonia', seats: 5 },
    hainaut: { id: 'hainaut', name: 'Hainaut', region: 'wallonia', seats: 18 },
    liege: { id: 'liege', name: 'Liège', region: 'wallonia', seats: 15 },
    namur: { id: 'namur', name: 'Namur', region: 'wallonia', seats: 6 },
    luxembourg: { id: 'luxembourg', name: 'Luxembourg', region: 'wallonia', seats: 4 }
};

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
