/**
 * Core Type Definitions for BelPolSim
 * 
 * This file contains all the core TypeScript interfaces and types used throughout
 * the Belgian Political Simulator. It follows the architecture defined in
 * SYSTEM_ARCHITECTURE.md.
 * 
 * Key Concepts:
 * - Politician: Individual political actors (formerly "Candidate")
 * - GamePhase: Enum-based game state management (campaign → election → coalition → governing)
 * - Parliament: Tracks the 150 elected members of the Belgian Federal Parliament
 */

// ============================================================================
// FOUNDATIONAL TYPES
// ============================================================================

export type PartyId = 'player' | 'nva' | 'ps' | 'mr' | 'vooruit' | 'vb' | 'ptb' | 'cdv' | 'lesengages';
export type RegionId = 'flanders' | 'wallonia' | 'brussels';
export type ConstituencyId =
    | 'antwerp' | 'east_flanders' | 'west_flanders' | 'flemish_brabant' | 'limburg' // Flanders
    | 'hainaut' | 'liege' | 'luxembourg' | 'namur' | 'walloon_brabant'              // Wallonia
    | 'brussels_capital';                                                           // Brussels

export type Language = 'dutch' | 'french' | 'german';
export type CompetencyLevel = 'Federal' | 'Regional' | 'Community';
export type IssueId = 'taxation' | 'immigration' | 'environment' | 'security' | 'social_welfare' | 'state_reform' | 'nuclear_exit' | 'wealth_tax' | 'regional_autonomy' | 'strict_immigration' | 'public_transport' | 'retirement_67';

// ============================================================================
// CAMPAIGN V2: DEMOGRAPHICS & VOTER BEHAVIOR
// ============================================================================

/**
 * Demographic groups within constituencies
 * Each group has different media consumption and issue preferences
 */
export type DemographicGroup = 'youth' | 'retirees' | 'workers' | 'upper_class';

/**
 * Demographic composition of a constituency
 * Weights must sum to 1.0 (representing 100% of population)
 */
export interface DemographicWeights {
    youth: number;        // 18-35 years old
    retirees: number;     // 65+ years old
    workers: number;      // Blue collar workers
    upper_class: number;  // High income earners
}

/**
 * Three-stat campaign model (replaces simple polling)
 * 
 * Awareness: Do voters know who you are? (0-100%)
 * Favorability: Do they like your platform? (0-100%)
 * Enthusiasm: Will they actually vote for you? (0-100%)
 * 
 * Final polling = weighted combination of these three stats
 */
export interface CampaignStats {
    awareness: number;      // Name recognition (easier to increase)
    favorability: number;   // Platform appeal (harder to move)
    enthusiasm: number;     // Voter motivation (volatile)
}

/**
 * Voter profile defining preferences and media consumption
 * Used to calculate campaign action effectiveness
 */
export interface VoterProfile {
    demographic: DemographicGroup;
    preferredIssues: IssueId[];  // Issues this group cares about most
    mediaConsumption: {
        tv: number;           // 0-1: TV watching frequency
        social_media: number; // 0-1: Social media usage
        newspaper: number;    // 0-1: Newspaper reading
        radio: number;        // 0-1: Radio listening
    };
}


// ============================================================================
// GEOGRAPHIC & ELECTORAL STRUCTURES
// ============================================================================

/**
 * Represents an electoral constituency in Belgium
 * Belgium has 11 constituencies that elect members to the Federal Parliament
 */
export interface Constituency {
    id: ConstituencyId;
    name: string;
    region: RegionId;
    seats: number; // Number of parliamentary seats allocated to this constituency
    demographics: DemographicWeights; // Campaign v2: Population breakdown
}

// ============================================================================
// POLITICAL ACTORS
// ============================================================================

/**
 * Represents an individual politician (member of parliament or candidate)
 * 
 * Key fields:
 * - popularity: Used for preference votes (0-100)
 * - ministerialRole: Position in government if appointed (e.g., "Prime Minister", "Minister of Finance")
 * - isElected: Whether this politician won a seat in the most recent election
 */
export interface Politician {
    id: string;
    name: string;
    partyId: PartyId;
    language: Language; // Critical for Cabinet Parity rule
    constituency: ConstituencyId;
    isElected: boolean;
    charisma: number; // 1-10, affects rally effectiveness
    expertise: number; // 1-10, affects debate performance
    internalClout: number; // 0-100, determines list position
    listPosition: number; // Current position on the electoral list (1-based)
    originalListPosition: number; // Initial position (for reference)
    popularity: number; // 0-100, used for preference votes
    ministerialRole: string | null; // Position in government if appointed
}

/**
 * Represents the player's character in the game
 */
export interface PlayerCharacter {
    name: string;
    homeConstituency: ConstituencyId;
    internalClout: number; // 0-100
}

/**
 * Represents a political party in Belgium
 * 
 * Key features:
 * - isExtremist: Triggers Cordon Sanitaire rule (cannot form coalitions)
 * - stances: Party positions on key issues (used for friction calculation)
 * - negotiationThreshold: How much friction the party tolerates in coalition talks
 * - politicians: All candidates/MPs organized by constituency
 */
export interface Party {
    id: PartyId;
    name: string;
    color: string; // Tailwind CSS class (e.g., 'bg-blue-600')
    isExtremist: boolean; // Triggers Cordon Sanitaire
    ideology: { economic: number; social: number }; // -10 to +10 scale
    stances: Stance[]; // Party positions on issues
    eligibleConstituencies: ConstituencyId[]; // Where party can run

    // Campaign v2: Three-stat system per constituency
    campaignStats: Record<ConstituencyId, CampaignStats>; // Awareness/Favorability/Enthusiasm

    // Backward compatibility: Calculated from campaignStats
    constituencyPolling: Record<ConstituencyId, number>; // Current polling %

    constituencySeats: Record<ConstituencyId, number>; // Seats won per constituency
    totalSeats: number; // Total seats in parliament
    politicians: Record<ConstituencyId, Politician[]>; // All politicians by constituency
    negotiationThreshold: number; // 0-100, higher = more willing to compromise
    ministries: number; // Number of ministries held (governing phase)
    supportBase: number; // Core voter loyalty (0-100)
}

// ============================================================================
// ISSUES AND POLICY POSITIONS
// ============================================================================

/**
 * Represents a political issue that parties take positions on
 */
export interface Issue {
    id: IssueId;
    name: string;
    description: string;
    competency: CompetencyLevel; // Federal, Regional, or Community level
}

/**
 * Represents a party's position on a specific issue
 * 
 * Used for:
 * - Calculating ideological friction between parties
 * - Defining coalition agreements
 * - Determining government stability
 */
export interface Stance {
    issueId: IssueId;
    position: number;  // 0-100, representing the party's ideal policy
    salience: number;  // 0-10, how important this issue is to the party
}

// ============================================================================
// GAME EVENTS
// ============================================================================

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

// ============================================================================
// GAME PHASE MANAGEMENT
// ============================================================================

/**
 * Represents the current phase of the game
 * 
 * Flow: campaign → election → consultation → formation → governing
 * 
 * - campaign: Player campaigns for 10 turns
 * - election: Automatic calculation of election results
 * - consultation: King consults parties, appoints Informateur
 * - formation: Informateur/Formateur negotiates coalition
 * - governing: Player manages the government
 */
export type GamePhase = 'campaign' | 'election' | 'consultation' | 'formation' | 'governing';

// ============================================================================
// PARLIAMENT & GOVERNMENT
// ============================================================================

/**
 * Represents the Belgian Federal Parliament
 * 
 * The parliament always contains exactly 150 elected politicians,
 * distributed across parties based on election results.
 */
export interface Parliament {
    seats: Politician[]; // Length should always be 150
}

/**
 * Represents the ruling coalition government
 * 
 * Key Belgian rules enforced:
 * - Cabinet Parity: Equal number of Dutch and French-speaking ministers
 * - Coalition must have majority (≥76 seats)
 */
export interface Government {
    partners: PartyId[];
    primeMinister: Politician | null;
    ministers: Politician[];
    agreement: CoalitionAgreement; // Replaces simple Stance[]
    stability: number; // 0-100
}

export interface CoalitionAgreement {
    policyCompromises: Stance[]; // The agreed-upon policies
    ministerialDistribution: Record<PartyId, number>; // How many ministers each party gets
}

// --- Game State & Engine ---

// ============================================================================
// GOVERNING PHASE STRUCTURES
// ============================================================================

export interface NationalBudget {
    revenue: number; // Total income (taxes, etc.)
    expenses: number; // Total spending
    debt: number; // National debt
    deficit: number; // revenue - expenses
    lastYearGrowth: number; // GDP growth %
}

export interface Crisis {
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    choices: EventChoice[]; // Reusing EventChoice structure
    active: boolean;
    turnsRemaining: number;
}

export interface Law {
    id: string;
    name: string;
    description: string;
    effects: {
        budgetImpact: number; // Change in expenses/revenue
        popularityImpact: number; // Change in public approval
        stabilityImpact: number; // Change in government stability
    };
    status: 'proposed' | 'passed' | 'rejected';
}

// --- Game State & Engine ---

export interface GameState {
    turn: number; // Renamed from week
    maxTurns: number; // Renamed from maxWeeks
    gamePhase: GamePhase; // Replaces boolean flags
    budget: number; // Campaign budget
    energy: number;
    maxEnergy: number;

    playerCharacter: PlayerCharacter;
    playerPartyId: PartyId;
    coalitionPartners: PartyId[];
    selectedConstituency: ConstituencyId;

    // Phase 2: Strategic action tracking
    hasUsedEmergencyRally: boolean; // One-time restriction for emergency rally
    policyAnnouncementsMade: IssueId[]; // Track locked-in policy stances

    parties: Record<PartyId, Party>;
    constituencies: Record<ConstituencyId, Constituency>; // Added from constants
    issues: Record<IssueId, Issue>;

    parliament: Parliament; // Added
    government: Government | null;
    informateur: PartyId | null; // New field
    formateur: PartyId | null; // New field

    // Governing Phase State
    nationalBudget: NationalBudget; // Replaced number with object
    crises: Crisis[];
    laws: Law[];
    publicApproval: number; // 0-100

    eventLog: string[];
    currentEvent: GameEvent | null;
}

export interface ActionResult {
    newState: GameState;
    success: boolean;
    message: string;
}
