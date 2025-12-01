import { useState, useMemo } from 'react';
import type { World } from '@/core';
import { TOTAL_PARLIAMENT_SEATS } from '@/core';

const TOTAL_SEATS = TOTAL_PARLIAMENT_SEATS;
const MAJORITY_SEATS = Math.floor(TOTAL_SEATS / 2) + 1;

// Type aliases for backwards compatibility
type GameState = World;
type PartyId = string;
type IssueId = string;
interface Stance {
    issueId: IssueId;
    position: number;
    salience: number;
}

// Placeholder functions - these need to be implemented in core
const calculateAllFrictions = (_parties: any, _stances: Stance[]): Map<PartyId, number> => new Map();
const evaluateCoalitionOffer = (_partnerId: PartyId, _gameState: GameState, _offer: any): { accepted: boolean; reason: string } => ({ accepted: false, reason: 'Not implemented' });

import { PartnerSelection } from './PartnerSelection';
import { PolicyNegotiation } from './PolicyNegotiation';
import { CoalitionSummary } from './CoalitionSummary';

interface CoalitionInterfaceProps {
    gameState: GameState;
    onTogglePartner: (id: PartyId) => void;
    onFormGovernment: (proposal: { partners: PartyId[], policyStances: Stance[], ministriesOffered: Record<PartyId, number> }) => void;
}

export const CoalitionInterface = ({ gameState, onTogglePartner, onFormGovernment }: CoalitionInterfaceProps) => {
    const { parties, coalitionPartners, issues: gameIssues } = gameState;
    const playerParty = parties[gameState.playerPartyId];

    // Local state for the policy proposal being negotiated
    const [negotiationStances, setNegotiationStances] = useState<Stance[]>(() =>
        playerParty.stances.length > 0 ? playerParty.stances : Object.values(gameIssues).map((issue: any) => ({
            issueId: issue.id,
            position: 50, // Default to a neutral stance if player has no initial stances
            salience: 5 // Default salience
        }))
    );
    const [ministriesOffered, setMinistriesOffered] = useState<Partial<Record<PartyId, number>>>({});

    // Calculate total seats for the current selected partners
    const currentCoalitionSeats = playerParty.totalSeats + coalitionPartners.reduce((acc: number, id: string) => acc + parties[id].totalSeats, 0);
    const majorityReached = currentCoalitionSeats >= MAJORITY_SEATS;

    // Calculate friction for each potential partner in real-time
    const partnerFrictions = useMemo(() => {
        const allFrictions = calculateAllFrictions(parties, negotiationStances);
        // Integrate ministries offered as a "sweetener" to reduce friction
        const frictionsWithSweetener = new Map<PartyId, number>();
        allFrictions.forEach((friction, partyId) => {
            const sweetener = (ministriesOffered[partyId] || 0) * 10; // Each ministry reduces friction by 10 points
            frictionsWithSweetener.set(partyId, Math.max(0, friction - sweetener));
        });
        return frictionsWithSweetener;
    }, [parties, negotiationStances, ministriesOffered]);

    // Calculate AI Feedback for selected partners
    const aiFeedback = useMemo(() => {
        return coalitionPartners.map((partnerId: string) => {
            const evaluation = evaluateCoalitionOffer(partnerId, gameState, {
                partners: [...coalitionPartners, gameState.playerPartyId],
                ministerialDistribution: ministriesOffered as Record<PartyId, number>,
                policyStances: negotiationStances
            });
            return {
                partyId: partnerId,
                partyName: parties[partnerId].name,
                accepted: evaluation.accepted,
                reason: evaluation.reason
            };
        });
    }, [coalitionPartners, gameState, ministriesOffered, negotiationStances, parties]);

    const handleSliderChange = (issueId: IssueId, value: number) => {
        setNegotiationStances(prev => {
            const existingStance = prev.find(s => s.issueId === issueId);
            if (existingStance) {
                return prev.map(s => s.issueId === issueId ? { ...s, position: value } : s);
            } else {
                return [...prev, { issueId, position: value, salience: 5 }];
            }
        });
    };

    const handleMinistryOfferChange = (partyId: PartyId, value: number) => {
        setMinistriesOffered(prev => ({ ...prev, [partyId]: value }));
    };

    const handleFormGovernment = () => {
        onFormGovernment({
            partners: [...coalitionPartners, gameState.playerPartyId],
            policyStances: negotiationStances,
            ministriesOffered: ministriesOffered as Record<PartyId, number>
        });
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-indigo-100">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center">
                <span className="bg-indigo-100 p-2 rounded-lg mr-3">🤝</span>
                Coalition Negotiation (Phase 2)
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <PartnerSelection
                    parties={parties}
                    playerPartyId={gameState.playerPartyId}
                    coalitionPartners={coalitionPartners}
                    partnerFrictions={partnerFrictions}
                    negotiationStances={negotiationStances}
                    gameIssues={gameIssues}
                    ministriesOffered={ministriesOffered}
                    onTogglePartner={onTogglePartner}
                    onMinistryOfferChange={handleMinistryOfferChange}
                />

                <PolicyNegotiation
                    gameIssues={gameIssues}
                    negotiationStances={negotiationStances}
                    coalitionPartners={coalitionPartners}
                    parties={parties}
                    playerParty={playerParty}
                    onSliderChange={handleSliderChange}
                />
            </div>

            <CoalitionSummary
                currentCoalitionSeats={currentCoalitionSeats}
                majorityReached={majorityReached}
                onFormGovernment={handleFormGovernment}
                aiFeedback={aiFeedback}
            />
        </div>
    );
};