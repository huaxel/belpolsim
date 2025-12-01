import type { Constituency, ConstituencyId, RegionId } from './types';

export const REGIONS: RegionId[] = ['flanders', 'wallonia', 'brussels'];

export const CONSTITUENCIES: Record<ConstituencyId, Constituency> = {
    // Flanders (87 seats)
    antwerp: { id: 'antwerp', name: 'Antwerp', region: 'flanders', seats: 24 },
    east_flanders: { id: 'east_flanders', name: 'East Flanders', region: 'flanders', seats: 20 },
    flemish_brabant: { id: 'flemish_brabant', name: 'Flemish Brabant', region: 'flanders', seats: 15 },
    limburg: { id: 'limburg', name: 'Limburg', region: 'flanders', seats: 12 },
    west_flanders: { id: 'west_flanders', name: 'West Flanders', region: 'flanders', seats: 16 },

    // Wallonia (47 seats)
    hainaut: { id: 'hainaut', name: 'Hainaut', region: 'wallonia', seats: 17 },
    liege: { id: 'liege', name: 'Liège', region: 'wallonia', seats: 14 },
    luxembourg: { id: 'luxembourg', name: 'Luxembourg', region: 'wallonia', seats: 4 },
    namur: { id: 'namur', name: 'Namur', region: 'wallonia', seats: 7 },
    walloon_brabant: { id: 'walloon_brabant', name: 'Walloon Brabant', region: 'wallonia', seats: 5 },

    // Brussels (16 seats)
    brussels_capital: { id: 'brussels_capital', name: 'Brussels-Capital', region: 'brussels', seats: 16 }
};

export const TOTAL_SEATS = 150;
export const MAJORITY_SEATS = 76;
export const ELECTORAL_THRESHOLD = 5.0; // 5% threshold
export const INITIAL_BUDGET = 5000;
export const INITIAL_ENERGY = 5;
export const MAX_WEEKS = 8; // Reduced from 12 based on playtester feedback
export const CAMPAIGN_EVENT_PROBABILITY = 0.25; // 25% chance per turn

export const POLICIES = {
    wealth_tax: { id: 'wealth_tax', name: 'Wealth Tax', description: 'Implement a tax on large fortunes.' },
    nuclear_exit: { id: 'nuclear_exit', name: 'Nuclear Exit', description: 'Close all nuclear power plants by 2035.' },
    retirement_67: { id: 'retirement_67', name: 'Retirement at 67', description: 'Keep retirement age at 67.' },
    regional_autonomy: { id: 'regional_autonomy', name: 'More Regional Autonomy', description: 'Transfer more powers to regions.' },
    strict_immigration: { id: 'strict_immigration', name: 'Strict Immigration', description: 'Limit asylum applications.' },
    public_transport: { id: 'public_transport', name: 'Free Public Transport', description: 'Make trains and buses free.' }
};
