/**
 * Initial Game State Generation
 * 
 * This file is responsible for creating the initial state of the game,
 * including all parties, politicians, and game parameters.
 */

import {
    CONSTITUENCIES,
    INITIAL_BUDGET,
    INITIAL_ENERGY,
    MAX_WEEKS,
} from '../constants';
import type {
    Politician,
    ConstituencyId,
    GameState,
    Party,
    PartyId,
    RegionId,
    Stance,
    Issue,
    IssueId,
    Language,
} from '../types';

// ============================================================================
// POLITICIAN GENERATION
// ============================================================================

/**
 * Generates politicians for a party in a specific constituency
 * 
 * Each politician is assigned:
 * - Random charisma and expertise (1-10)
 * - Random internal clout (0-100) which determines list position
 * - Random popularity (0-100) for preference votes
 * - No ministerial role initially (null)
 * 
 * @param partyId - The party this politician belongs to
 * @param constituencyId - The constituency they're running in
 * @param count - Number of politicians to generate (typically matches constituency seats)
 * @param language - Language of the politician (Dutch or French)
 * @returns Array of generated politicians
 */
export const generatePoliticians = (partyId: PartyId, constituencyId: ConstituencyId, count: number, language: Language): Politician[] => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `${partyId}-${constituencyId}-${i}`,
        name: `${partyId.toUpperCase()} Politician ${i + 1}`,
        partyId,
        language,
        constituency: constituencyId,
        isElected: false,
        charisma: Math.floor(Math.random() * 10) + 1,
        expertise: Math.floor(Math.random() * 10) + 1,
        internalClout: Math.floor(Math.random() * 100),
        popularity: Math.floor(Math.random() * 100), // New field
        ministerialRole: null, // New field
    }));
};

// ============================================================================
// PARTY INITIALIZATION
// ============================================================================

/**
 * Initializes a political party with all necessary data
 * 
 * This function:
 * - Sets up polling data for all constituencies
 * - Generates politicians for eligible constituencies
 * - Handles language assignment (Dutch for Flanders, French for Wallonia)
 * - Special case: Brussels gets mixed language politicians
 * 
 * @param id - Unique party identifier
 * @param name - Display name of the party
 * @param color - Tailwind CSS color class
 * @param isExtremist - Whether party triggers Cordon Sanitaire
 * @param regions - Regions where party can compete
 * @param basePolling - Starting polling percentage
 * @param ideology - Economic and social ideology scores
 * @param stances - Party positions on key issues
 * @param negotiationThreshold - Willingness to compromise (0-100)
 * @returns Fully initialized Party object
 */
const initParty = (
    id: PartyId,
    name: string,
    color: string,
    isExtremist: boolean,
    regions: RegionId[],
    basePolling: number,
    ideology: { economic: number, social: number },
    stances: Stance[],
    negotiationThreshold: number = 50 // Default threshold
): Party => {
    const constituencyIds = Object.keys(CONSTITUENCIES) as ConstituencyId[];
    const eligibleC = constituencyIds.filter(c => regions.includes(CONSTITUENCIES[c].region));
    const language: Language = regions.includes('flanders') ? 'dutch' : 'french';

    const polling: Record<string, number> = {};
    const seats: Record<string, number> = {};
    const politicians: Record<string, Politician[]> = {};

    constituencyIds.forEach(c => {
        polling[c] = eligibleC.includes(c) ? basePolling : 0;
        seats[c] = 0;
        if (eligibleC.includes(c)) {
            // For Brussels, assume mixed politicians for now. This is a simplification.
            const politicianLang = c === 'brussels_capital' ? (Math.random() > 0.5 ? 'dutch' : 'french') : language;
            politicians[c] = generatePoliticians(id, c, CONSTITUENCIES[c].seats, politicianLang);
        } else {
            politicians[c] = [];
        }
    });

    return {
        id, name, color, isExtremist, stances, ideology,
        eligibleConstituencies: eligibleC,
        constituencyPolling: polling as Record<ConstituencyId, number>,
        constituencySeats: seats as Record<ConstituencyId, number>,
        totalSeats: 0,
        politicians: politicians as Record<ConstituencyId, Politician[]>,
        negotiationThreshold
    };
};

// ============================================================================
// INITIAL STATE CREATION
// ============================================================================

/**
 * Creates the initial game state for a new campaign
 * 
 * This function sets up:
 * - All 12 political issues
 * - All 9 political parties with their politicians
 * - Player character and starting resources
 * - Game phase set to 'campaign'
 * - Empty parliament (filled after election)
 * 
 * @returns Complete initial GameState ready to start the campaign
 */
export const createInitialState = (): GameState => {

    const issues: Record<IssueId, Issue> = {
        'taxation': { id: 'taxation', name: 'Taxation Level', description: 'Overall level of personal and corporate tax.', competency: 'Federal' },
        'immigration': { id: 'immigration', name: 'Immigration Policy', description: 'Strictness of immigration laws.', competency: 'Federal' },
        'environment': { id: 'environment', name: 'Environmental Protection', description: 'Level of investment in green energy and climate goals.', competency: 'Regional' },
        'security': { id: 'security', name: 'Law and Order', description: 'Funding for police and justice system.', competency: 'Federal' },
        'social_welfare': { id: 'social_welfare', name: 'Social Welfare', description: 'Generosity of unemployment benefits and social programs.', competency: 'Federal' },
        'state_reform': { id: 'state_reform', name: 'State Reform', description: 'Devolution of powers to the regions.', competency: 'Federal' },
        'nuclear_exit': { id: 'nuclear_exit', name: 'Nuclear Exit', description: 'Speed of phasing out nuclear power.', competency: 'Federal' },
        'wealth_tax': { id: 'wealth_tax', name: 'Wealth Tax', description: 'Implementation of a tax on large fortunes.', competency: 'Federal' },
        'regional_autonomy': { id: 'regional_autonomy', name: 'Regional Autonomy', description: 'Level of self-governance for the regions.', competency: 'Federal' },
        'strict_immigration': { id: 'strict_immigration', name: 'Strict Immigration', description: 'Enforcement of strict immigration rules.', competency: 'Federal' },
        'public_transport': { id: 'public_transport', name: 'Public Transport Investment', description: 'Funding for trains and buses.', competency: 'Regional' },
        'retirement_67': { id: 'retirement_67', name: 'Retirement Age', description: 'Keeping the retirement age at 67.', competency: 'Federal' },
    };

    const initialState: GameState = {
        turn: 1,
        maxTurns: MAX_WEEKS,
        gamePhase: 'campaign',
        budget: INITIAL_BUDGET,
        energy: INITIAL_ENERGY,
        maxEnergy: INITIAL_ENERGY,
        playerCharacter: {
            name: 'Player',
            homeConstituency: 'antwerp',
            internalClout: 50
        },
        playerPartyId: 'player',
        coalitionPartners: [],
        selectedConstituency: 'antwerp',
        constituencies: CONSTITUENCIES,
        parliament: { seats: [] },
        government: null,
        nationalBudget: 0,
        parties: {
            player: initParty('player', 'Ecolo-Groen (You)', 'bg-green-600', false, ['flanders', 'wallonia', 'brussels'], 12, { economic: -6, social: -7 }, [
                { issueId: 'nuclear_exit', position: 80, salience: 9 },
                { issueId: 'wealth_tax', position: 75, salience: 8 },
                { issueId: 'strict_immigration', position: 20, salience: 4 },
            ], 50),
            nva: initParty('nva', 'N-VA', 'bg-yellow-500', false, ['flanders', 'brussels'], 25, { economic: 6, social: 5 }, [
                { issueId: 'regional_autonomy', position: 90, salience: 10 },
                { issueId: 'strict_immigration', position: 85, salience: 8 },
                { issueId: 'wealth_tax', position: 10, salience: 6 },
            ], 40),
            vb: initParty('vb', 'Vlaams Belang', 'bg-gray-800', true, ['flanders', 'brussels'], 22, { economic: 2, social: 9 }, [
                { issueId: 'strict_immigration', position: 100, salience: 10 },
                { issueId: 'nuclear_exit', position: 50, salience: 3 }, // Less salient
                { issueId: 'public_transport', position: 30, salience: 2 },
            ], 20),
            vooruit: initParty('vooruit', 'Vooruit', 'bg-red-500', false, ['flanders', 'brussels'], 15, { economic: -4, social: -3 }, [
                { issueId: 'wealth_tax', position: 85, salience: 9 },
                { issueId: 'public_transport', position: 80, salience: 7 },
                { issueId: 'retirement_67', position: 20, salience: 8 },
            ], 60),
            cdv: initParty('cdv', 'CD&V', 'bg-orange-500', false, ['flanders', 'brussels'], 12, { economic: 2, social: 4 }, [
                { issueId: 'retirement_67', position: 70, salience: 7 },
                { issueId: 'nuclear_exit', position: 40, salience: 5 },
            ], 70),
            ps: initParty('ps', 'PS', 'bg-red-600', false, ['wallonia', 'brussels'], 25, { economic: -7, social: -4 }, [
                { issueId: 'wealth_tax', position: 90, salience: 9 },
                { issueId: 'retirement_67', position: 15, salience: 8 },
                { issueId: 'regional_autonomy', position: 30, salience: 5 },
            ], 50),
            mr: initParty('mr', 'MR', 'bg-blue-600', false, ['wallonia', 'brussels'], 22, { economic: 7, social: -2 }, [
                { issueId: 'nuclear_exit', position: 20, salience: 6 },
                { issueId: 'wealth_tax', position: 5, salience: 8 },
            ], 50),
            ptb: initParty('ptb', 'PTB-PVDA', 'bg-red-800', true, ['flanders', 'wallonia', 'brussels'], 15, { economic: -9, social: -5 }, [
                { issueId: 'wealth_tax', position: 100, salience: 10 },
                { issueId: 'public_transport', position: 90, salience: 7 },
                { issueId: 'retirement_67', position: 0, salience: 9 },
            ], 20),
            lesengages: initParty('lesengages', 'Les Engagés', 'bg-cyan-500', false, ['wallonia', 'brussels'], 15, { economic: 0, social: 2 }, [
                { issueId: 'retirement_67', position: 60, salience: 6 },
                { issueId: 'nuclear_exit', position: 60, salience: 5 },
            ], 65),
        },
        issues: issues,
        eventLog: ['Welcome to the Federal Campaign! 150 seats are at stake across 11 constituencies.'],
        currentEvent: null
    };

    // Normalize polling to ensure 100%
    const parties = { ...initialState.parties };
    const cIds = Object.keys(CONSTITUENCIES) as ConstituencyId[];

    cIds.forEach(c => {
        const eligible = (Object.keys(parties) as PartyId[]).filter(id => parties[id].eligibleConstituencies.includes(c));
        const total = eligible.reduce((sum, id) => sum + parties[id].constituencyPolling[c], 0);
        if (total > 0) {
            eligible.forEach(id => {
                parties[id].constituencyPolling[c] = (parties[id].constituencyPolling[c] / total) * 100;
            });
        }
    });

    return { ...initialState, parties };
};
