export type PartyId = 'player' | 'nva' | 'ps' | 'mr' | 'vooruit' | 'vb' | 'ptb' | 'cdv' | 'lesengages';
export type RegionId = 'flanders' | 'wallonia' | 'brussels';
export type ConstituencyId =
    | 'antwerp' | 'east_flanders' | 'west_flanders' | 'flemish_brabant' | 'limburg' // Flanders
    | 'hainaut' | 'liege' | 'luxembourg' | 'namur' | 'walloon_brabant'              // Wallonia
    | 'brussels_capital';                                                           // Brussels

export interface Constituency {
    id: ConstituencyId;
    name: string;
    region: RegionId;
    seats: number;
}

export interface Candidate {
    id: string;
    name: string;
    isElected: boolean;
    charisma: number; // 1-10
    expertise: number; // 1-10
}

export interface Policy {
    id: string;
    name: string;
    description: string;
}

export interface Party {
    id: PartyId;
    name: string;
    color: string;
    eligibleConstituencies: ConstituencyId[];
    isExtremist: boolean;
    demands: string[]; // Array of Policy IDs they demand
    constituencyPolling: Record<ConstituencyId, number>; // Percentage 0-100 per constituency
    constituencySeats: Record<ConstituencyId, number>;   // Seats per constituency
    totalSeats: number;                        // Sum of all seats
    candidates: Record<ConstituencyId, Candidate[]>; // Candidates per constituency
}

export interface EventChoice {
    text: string;
    effect: (state: GameState) => Partial<GameState>;
    description: string; // Description of the effect for the UI
}

export interface GameEvent {
    id: string;
    title: string;
    description: string;
    choices: EventChoice[];
}

export interface GameState {
    week: number;
    maxWeeks: number;
    budget: number;
    energy: number;
    maxEnergy: number;
    isGameOver: boolean;
    isCoalitionPhase: boolean;
    coalitionPartners: PartyId[];
    selectedConstituency: ConstituencyId; // Current view/action focus
    parties: Record<PartyId, Party>;
    eventLog: string[];
    currentEvent: GameEvent | null;
}
