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

export interface Politician {
    id: string;
    name: string;
    partyId: PartyId;
    language: Language;
    constituency: ConstituencyId;
    isElected: boolean;
    charisma: number; // 1-10
    expertise: number; // 1-10
    internalClout: number; // 0-100, determines list position
    popularity: number; // Used for preference votes
    ministerialRole: string | null; // Position in government
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
    politicians: Record<ConstituencyId, Politician[]>; // Renamed from candidates
    negotiationThreshold: number; // 0-100, higher means more willing to compromise
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

// --- Game Phase ---

export type GamePhase = 'campaign' | 'election' | 'coalition_formation' | 'governing';

// --- Parliament ---

export interface Parliament {
    seats: Politician[]; // Length should always be 150
}

// --- Government ---

export interface Government {
    partners: PartyId[];
    primeMinister: Politician | null;
    ministers: Politician[];
    agreement: Stance[];
    stability: number; // 0-100
}

// --- Game State & Engine ---

export interface GameState {
    turn: number; // Renamed from week
    maxTurns: number; // Renamed from maxWeeks
    gamePhase: GamePhase; // Replaces boolean flags
    budget: number;
    energy: number;
    maxEnergy: number;

    playerCharacter: PlayerCharacter;
    playerPartyId: PartyId;
    coalitionPartners: PartyId[];
    selectedConstituency: ConstituencyId;

    parties: Record<PartyId, Party>;
    constituencies: Record<ConstituencyId, Constituency>; // Added from constants
    issues: Record<IssueId, Issue>;

    parliament: Parliament; // Added
    government: Government | null;
    nationalBudget: number; // Distinct from campaign budget

    eventLog: string[];
    currentEvent: GameEvent | null;
}

export interface ActionResult {
    newState: GameState;
    success: boolean;
    message: string;
}
