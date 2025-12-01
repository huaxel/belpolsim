import type { Constituency, ConstituencyId, RegionId } from './types';

export const REGIONS: RegionId[] = ['flanders', 'wallonia', 'brussels'];

export const CONSTITUENCIES: Record<ConstituencyId, Constituency> = {
    // Flanders (87 seats) - Generally younger, more workers
    antwerp: {
        id: 'antwerp',
        name: 'Antwerp',
        region: 'flanders',
        seats: 24,
        demographics: { youth: 0.30, workers: 0.35, retirees: 0.20, upper_class: 0.15 }
    },
    east_flanders: {
        id: 'east_flanders',
        name: 'East Flanders',
        region: 'flanders',
        seats: 20,
        demographics: { youth: 0.25, workers: 0.40, retirees: 0.22, upper_class: 0.13 }
    },
    flemish_brabant: {
        id: 'flemish_brabant',
        name: 'Flemish Brabant',
        region: 'flanders',
        seats: 15,
        demographics: { youth: 0.28, workers: 0.30, retirees: 0.20, upper_class: 0.22 } // More affluent
    },
    limburg: {
        id: 'limburg',
        name: 'Limburg',
        region: 'flanders',
        seats: 12,
        demographics: { youth: 0.26, workers: 0.38, retirees: 0.24, upper_class: 0.12 }
    },
    west_flanders: {
        id: 'west_flanders',
        name: 'West Flanders',
        region: 'flanders',
        seats: 16,
        demographics: { youth: 0.24, workers: 0.36, retirees: 0.26, upper_class: 0.14 }
    },

    // Wallonia (47 seats) - More industrial, aging population
    hainaut: {
        id: 'hainaut',
        name: 'Hainaut',
        region: 'wallonia',
        seats: 17,
        demographics: { youth: 0.22, workers: 0.45, retirees: 0.24, upper_class: 0.09 } // Industrial
    },
    liege: {
        id: 'liege',
        name: 'Liège',
        region: 'wallonia',
        seats: 14,
        demographics: { youth: 0.24, workers: 0.42, retirees: 0.25, upper_class: 0.09 }
    },
    luxembourg: {
        id: 'luxembourg',
        name: 'Luxembourg',
        region: 'wallonia',
        seats: 4,
        demographics: { youth: 0.20, workers: 0.35, retirees: 0.30, upper_class: 0.15 } // Rural, aging
    },
    namur: {
        id: 'namur',
        name: 'Namur',
        region: 'wallonia',
        seats: 7,
        demographics: { youth: 0.23, workers: 0.38, retirees: 0.27, upper_class: 0.12 }
    },
    walloon_brabant: {
        id: 'walloon_brabant',
        name: 'Walloon Brabant',
        region: 'wallonia',
        seats: 5,
        demographics: { youth: 0.26, workers: 0.32, retirees: 0.22, upper_class: 0.20 } // Affluent suburbs
    },

    // Brussels (16 seats) - Cosmopolitan, young, diverse
    brussels_capital: {
        id: 'brussels_capital',
        name: 'Brussels-Capital',
        region: 'brussels',
        seats: 16,
        demographics: { youth: 0.35, workers: 0.30, retirees: 0.18, upper_class: 0.17 } // Young, urban
    }
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
