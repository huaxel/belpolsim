export type PartyId = 'player' | 'nva' | 'ps' | 'mr' | 'vooruit' | 'vb' | 'ptb' | 'cdv' | 'lesengages';
export type RegionId = 'flanders' | 'wallonia' | 'brussels';
export type ConstituencyId =
    | 'antwerp' | 'east_flanders' | 'west_flanders' | 'flemish_brabant' | 'limburg' // Flanders
    | 'hainaut' | 'liege' | 'luxembourg' | 'namur' | 'walloon_brabant'              // Wallonia
    | 'brussels_capital';                                                           // Brussels

export type Language = 'dutch' | 'french' | 'german';
export type CompetencyLevel = 'Federal' | 'Regional' | 'Community';
export type IssueId = 'taxation' | 'immigration' | 'environment' | 'security' | 'social_welfare' | 'state_reform' | 'nuclear_exit' | 'wealth_tax' | 'regional_autonomy' | 'strict_immigration' | 'public_transport' | 'retirement_67';


// --- Core Data Structures ---

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
    internalClout: number; // 0-100, determines list position
    language: Language;
}

export interface PlayerCharacter {
    name: string;
    homeConstituency: ConstituencyId;
    internalClout: number; // 0-100
}

export interface Party {
    id: PartyId;
    name: string;
    color: string;
    isExtremist: boolean;
    ideology: { economic: number; social: number };
    stances: Stance[]; // Replaces demands and redLines
    eligibleConstituencies: ConstituencyId[];
    constituencyPolling: Record<ConstituencyId, number>;
    constituencySeats: Record<ConstituencyId, number>;
    totalSeats: number;
    candidates: Record<ConstituencyId, Candidate[]>;
}

// --- Issues and Stances (for Friction System) ---

export interface Issue {
    id: IssueId;
    name: string;
    description: string;
    competency: CompetencyLevel;
}

export interface Stance {
    issueId: IssueId;
    position: number;  // 0-100, representing the party's ideal policy
    salience: number;  // 0-10, how important this issue is to the party
}

// --- Events ---

export interface EventChoice {
    text: string;
    description: string;
    effect: (state: GameState) => Partial<GameState>;
}

export interface GameEvent {
    id: string;
    title: string;
    description: string;
    choices: EventChoice[];
}

// --- Game State & Engine ---

export interface GameState {
    week: number;
    maxWeeks: number;
    budget: number;
    energy: number;
    maxEnergy: number;

    playerCharacter: PlayerCharacter;
    playerPartyId: PartyId;
    isGameOver: boolean;
    isCoalitionPhase: boolean;
    coalitionPartners: PartyId[];
    selectedConstituency: ConstituencyId;

    parties: Record<PartyId, Party>;
    issues: Record<IssueId, Issue>;
    eventLog: string[];
    currentEvent: GameEvent | null;
}

export interface ActionResult {
    newState: GameState;
    success: boolean;
    message: string;
}
