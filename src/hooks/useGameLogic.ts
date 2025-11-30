import { useState, useEffect } from 'react';
import {
    CONSTITUENCIES,
    INITIAL_BUDGET,
    INITIAL_ENERGY,
    MAJORITY_SEATS,
    MAX_WEEKS
} from '../constants';
import type {
    Candidate,
    ConstituencyId,
    GameState,
    Party,
    PartyId,
    RegionId,
    EventChoice
} from '../types';
import { EVENTS } from '../events';

// --- Helper: Generate Initial Polling & Candidates ---
const generateCandidates = (partyId: string, constituencyId: string, count: number): Candidate[] => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `${partyId}-${constituencyId}-${i}`,
        name: `${partyId.toUpperCase()} Candidate ${i + 1}`,
        isElected: false,
        charisma: Math.floor(Math.random() * 10) + 1,
        expertise: Math.floor(Math.random() * 10) + 1
    }));
};

export const useGameLogic = () => {
    // 1. Core State
    const [gameState, setGameState] = useState<GameState>(() => {
        // Initialize Parties with default polling
        const constituencyIds = Object.keys(CONSTITUENCIES) as ConstituencyId[];

        // Helper to init party data
        const initParty = (id: PartyId, name: string, color: string, isExtremist: boolean, regions: RegionId[], basePolling: number, demands: string[] = []): Party => {
            const eligibleC = constituencyIds.filter(c => regions.includes(CONSTITUENCIES[c].region));

            const polling: Record<string, number> = {};
            const seats: Record<string, number> = {};
            const candidates: Record<string, Candidate[]> = {};

            constituencyIds.forEach(c => {
                polling[c] = eligibleC.includes(c) ? basePolling : 0;
                seats[c] = 0;
                if (eligibleC.includes(c)) {
                    candidates[c] = generateCandidates(id, c, CONSTITUENCIES[c].seats);
                } else {
                    candidates[c] = [];
                }
            });

            return {
                id, name, color, isExtremist, demands,
                eligibleConstituencies: eligibleC,
                constituencyPolling: polling as Record<ConstituencyId, number>,
                constituencySeats: seats as Record<ConstituencyId, number>,
                totalSeats: 0,
                candidates: candidates as Record<ConstituencyId, Candidate[]>
            };
        };

        return {
            week: 1,
            maxWeeks: MAX_WEEKS,
            budget: INITIAL_BUDGET,
            energy: INITIAL_ENERGY,
            maxEnergy: INITIAL_ENERGY,
            isGameOver: false,
            isCoalitionPhase: false,
            coalitionPartners: [],
            selectedConstituency: 'antwerp',
            parties: {
                player: initParty('player', 'Ecolo-Groen (You)', 'bg-green-600', false, ['flanders', 'wallonia', 'brussels'], 12),
                nva: initParty('nva', 'N-VA', 'bg-yellow-500', false, ['flanders', 'brussels'], 25, ['regional_autonomy', 'strict_immigration']),
                vb: initParty('vb', 'Vlaams Belang', 'bg-gray-800', true, ['flanders', 'brussels'], 22, ['strict_immigration', 'nuclear_exit']),
                vooruit: initParty('vooruit', 'Vooruit', 'bg-red-500', false, ['flanders', 'brussels'], 15, ['wealth_tax', 'public_transport']),
                cdv: initParty('cdv', 'CD&V', 'bg-orange-500', false, ['flanders', 'brussels'], 12, ['retirement_67']),

                ps: initParty('ps', 'PS', 'bg-red-600', false, ['wallonia', 'brussels'], 25, ['wealth_tax', 'retirement_67']),
                mr: initParty('mr', 'MR', 'bg-blue-600', false, ['wallonia', 'brussels'], 22, ['nuclear_exit']),
                ptb: initParty('ptb', 'PTB-PVDA', 'bg-red-800', true, ['flanders', 'wallonia', 'brussels'], 15, ['wealth_tax', 'public_transport']), // National
                lesengages: initParty('lesengages', 'Les Engagés', 'bg-cyan-500', false, ['wallonia', 'brussels'], 15, ['retirement_67']),
            },
            eventLog: ['Welcome to the Federal Campaign! 150 seats are at stake across 11 constituencies.'],
            currentEvent: null
        };
    });

    // Normalize polling on mount to ensure 100%
    useEffect(() => {
        setGameState(prev => {
            const parties = { ...prev.parties };
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
            return { ...prev, parties };
        });
    }, []);

    // 3. Player Actions
    const handleAction = (actionType: 'canvas' | 'posters' | 'rally' | 'fundraise' | 'tv_ad' | 'debate') => {
        if (gameState.energy <= 0 && actionType !== 'fundraise') return;

        let cost = 0;
        let energyCost = 1;
        let popularityGain = 0;
        let logMsg = "";
        const cName = CONSTITUENCIES[gameState.selectedConstituency].name;

        // Get local candidates for player
        const localCandidates = gameState.parties['player'].candidates[gameState.selectedConstituency] || [];
        const leadCandidate = localCandidates[0]; // Assume first is lead
        const avgCharisma = leadCandidate ? leadCandidate.charisma : 5;

        switch (actionType) {
            case 'canvas':
                cost = 0;
                energyCost = 2;
                popularityGain = 1.5;
                logMsg = `Canvassing in ${cName} secured voters.`;
                break;
            case 'posters':
                cost = 800;
                energyCost = 1;
                popularityGain = 2.0;
                logMsg = `Posters plastered all over ${cName}.`;
                break;
            case 'rally':
                cost = 1200;
                energyCost = 3;
                // Charisma modifier: (Charisma / 5) multiplier. 5 is neutral, 10 is double.
                const charismaMod = avgCharisma / 5;
                const isGaffe = Math.random() < (0.2 / charismaMod); // High charisma reduces gaffe chance

                if (isGaffe) {
                    popularityGain = -3.0;
                    logMsg = `GAFFE! The rally in ${cName} was a disaster despite ${leadCandidate?.name}'s efforts.`;
                } else {
                    const baseGain = 5.0;
                    popularityGain = baseGain * charismaMod;
                    logMsg = `Huge rally in ${cName}! ${leadCandidate?.name} (Cha: ${leadCandidate?.charisma}) electrified the crowd.`;
                }
                break;
            case 'fundraise':
                cost = -1000;
                energyCost = 2;
                popularityGain = -1.5;
                logMsg = `Fundraiser in ${cName} filled the war chest.`;
                break;
            case 'tv_ad':
                cost = 3000;
                energyCost = 0;
                popularityGain = 0; // Handled specially
                logMsg = `National TV Ad Campaign aired!`;
                break;
            case 'debate':
                cost = 0;
                energyCost = 3;
                popularityGain = 0; // Handled specially
                logMsg = `Participated in the National Debate.`;
                break;
        }

        if (gameState.budget < cost) {
            alert("Not enough funds!");
            return;
        }
        if (gameState.energy < energyCost) {
            alert("Not enough energy!");
            return;
        }

        setGameState(prev => {
            const parties = { ...prev.parties };

            if (actionType === 'tv_ad') {
                // Boost ALL constituencies
                const cIds = Object.keys(CONSTITUENCIES) as ConstituencyId[];
                cIds.forEach(cId => {
                    const partyId = 'player';
                    const change = 0.5;

                    if (!parties[partyId].eligibleConstituencies.includes(cId)) return;

                    parties[partyId].constituencyPolling[cId] += change;

                    const eligiblePartyIds = (Object.keys(parties) as PartyId[]).filter(id => parties[id].eligibleConstituencies.includes(cId));

                    if (change > 0) {
                        const othersIds = eligiblePartyIds.filter(k => k !== partyId);
                        const reductionPerParty = change / othersIds.length;
                        othersIds.forEach(id => {
                            parties[id].constituencyPolling[cId] = Math.max(0, parties[id].constituencyPolling[cId] - reductionPerParty);
                        });
                    } else {
                        const othersIds = eligiblePartyIds.filter(k => k !== partyId);
                        const gainPerParty = Math.abs(change) / othersIds.length;
                        othersIds.forEach(id => {
                            parties[id].constituencyPolling[cId] += gainPerParty;
                        });
                    }

                    const totalPolling = eligiblePartyIds.reduce((sum, id) => sum + parties[id].constituencyPolling[cId], 0);
                    eligiblePartyIds.forEach(id => {
                        parties[id].constituencyPolling[cId] = (parties[id].constituencyPolling[cId] / totalPolling) * 100;
                    });
                });
            } else if (actionType === 'debate') {
                // Variance in ALL constituencies based on Expertise
                let totalExpertise = 0;
                let candidateCount = 0;
                Object.values(parties['player'].candidates).forEach(list => {
                    list.forEach(c => {
                        totalExpertise += c.expertise;
                        candidateCount++;
                    });
                });
                const avgExpertise = candidateCount > 0 ? totalExpertise / candidateCount : 5;

                const cIds = Object.keys(CONSTITUENCIES) as ConstituencyId[];
                const winThreshold = 0.7 - ((avgExpertise - 5) * 0.05);
                const performance = Math.random();

                let gain = 0;
                let msg = "";
                if (performance > winThreshold) {
                    gain = 2.0;
                    msg = `You won the debate! (Avg Exp: ${avgExpertise.toFixed(1)})`;
                } else if (performance < 0.2) {
                    gain = -1.5;
                    msg = "You stumbled in the debate.";
                } else {
                    gain = 0.5;
                    msg = "Solid debate performance.";
                }
                logMsg = msg;
                cIds.forEach(cId => {
                    const partyId = 'player';
                    const change = gain;

                    if (!parties[partyId].eligibleConstituencies.includes(cId)) return;

                    parties[partyId].constituencyPolling[cId] += change;

                    const eligiblePartyIds = (Object.keys(parties) as PartyId[]).filter(id => parties[id].eligibleConstituencies.includes(cId));

                    if (change > 0) {
                        const othersIds = eligiblePartyIds.filter(k => k !== partyId);
                        const reductionPerParty = change / othersIds.length;
                        othersIds.forEach(id => {
                            parties[id].constituencyPolling[cId] = Math.max(0, parties[id].constituencyPolling[cId] - reductionPerParty);
                        });
                    } else {
                        const othersIds = eligiblePartyIds.filter(k => k !== partyId);
                        const gainPerParty = Math.abs(change) / othersIds.length;
                        othersIds.forEach(id => {
                            parties[id].constituencyPolling[cId] += gainPerParty;
                        });
                    }

                    const totalPolling = eligiblePartyIds.reduce((sum, id) => sum + parties[id].constituencyPolling[cId], 0);
                    eligiblePartyIds.forEach(id => {
                        parties[id].constituencyPolling[cId] = (parties[id].constituencyPolling[cId] / totalPolling) * 100;
                    });
                });
            } else {
                // Local Action
                const partyId = 'player';
                const change = popularityGain;
                const constituencyId = prev.selectedConstituency;

                if (!parties[partyId].eligibleConstituencies.includes(constituencyId)) return prev;

                parties[partyId].constituencyPolling[constituencyId] += change;

                const eligiblePartyIds = (Object.keys(parties) as PartyId[]).filter(id => parties[id].eligibleConstituencies.includes(constituencyId));

                if (change > 0) {
                    const othersIds = eligiblePartyIds.filter(k => k !== partyId);
                    const reductionPerParty = change / othersIds.length;
                    othersIds.forEach(id => {
                        parties[id].constituencyPolling[constituencyId] = Math.max(0, parties[id].constituencyPolling[constituencyId] - reductionPerParty);
                    });
                } else {
                    const othersIds = eligiblePartyIds.filter(k => k !== partyId);
                    const gainPerParty = Math.abs(change) / othersIds.length;
                    othersIds.forEach(id => {
                        parties[id].constituencyPolling[constituencyId] += gainPerParty;
                    });
                }

                const totalPolling = eligiblePartyIds.reduce((sum, id) => sum + parties[id].constituencyPolling[constituencyId], 0);
                eligiblePartyIds.forEach(id => {
                    parties[id].constituencyPolling[constituencyId] = (parties[id].constituencyPolling[constituencyId] / totalPolling) * 100;
                });
            }

            return {
                ...prev,
                budget: prev.budget - cost,
                energy: prev.energy - energyCost,
                parties: parties,
                eventLog: [...prev.eventLog, `Week ${prev.week}: ${logMsg}`]
            };
        });
    };

    // 4. Turn Logic
    const endTurn = () => {
        if (gameState.week >= gameState.maxWeeks) {
            calculateElection();
            return;
        }

        const cIds = Object.keys(CONSTITUENCIES) as ConstituencyId[];
        const partyIds = Object.keys(gameState.parties) as PartyId[];

        setGameState(prev => {
            const nextParties = { ...prev.parties };
            const eventRoll = Math.random();
            const aiLogMessages: string[] = [];

            // 1. AI Turn Logic
            const aiParties = partyIds.filter(id => id !== 'player');

            aiParties.forEach(aiId => {
                // A. Pick Target Constituencies (1 or 2)
                const eligible = nextParties[aiId].eligibleConstituencies;
                const targets: ConstituencyId[] = [];

                // Simple Strategy: Pick 1 random eligible constituency to focus on
                if (eligible.length > 0) {
                    const targetIndex = Math.floor(Math.random() * eligible.length);
                    targets.push(eligible[targetIndex]);
                }

                // B. Apply Campaign Boost to Targets
                targets.forEach(cId => {
                    const boost = (Math.random() * 2.0) + 1.0; // 1% to 3% boost
                    nextParties[aiId].constituencyPolling[cId] += boost;

                    // 20% chance to log a major move
                    if (Math.random() < 0.2) {
                        aiLogMessages.push(`${nextParties[aiId].name} is campaigning hard in ${CONSTITUENCIES[cId].name}!`);
                    }
                });

                // C. General Fluctuation (Small random changes everywhere)
                eligible.forEach(cId => {
                    const fluctuation = (Math.random() * 0.6) - 0.2; // -0.2% to +0.4%
                    nextParties[aiId].constituencyPolling[cId] += fluctuation;
                });
            });

            // 2. Normalize Polling in All Constituencies
            cIds.forEach(c => {
                const regionParties = partyIds.filter(id => nextParties[id].eligibleConstituencies.includes(c));
                const total = regionParties.reduce((sum, id) => sum + nextParties[id].constituencyPolling[c], 0);
                regionParties.forEach(id => {
                    nextParties[id].constituencyPolling[c] = (nextParties[id].constituencyPolling[c] / total) * 100;
                });
            });

            const newLog = [...prev.eventLog, ...aiLogMessages];

            if (eventRoll > 0.85) {
                // Trigger Event
                const randomEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
                return {
                    ...prev,
                    week: prev.week + 1,
                    energy: prev.maxEnergy,
                    parties: nextParties,
                    currentEvent: randomEvent,
                    eventLog: [...newLog, `EVENT: ${randomEvent.title}`]
                };
            }

            return {
                ...prev,
                week: prev.week + 1,
                energy: prev.maxEnergy,
                parties: nextParties,
                eventLog: newLog
            };
        });
    };

    const handleEventChoice = (choice: EventChoice) => {
        setGameState(prev => {
            const effect = choice.effect(prev);
            return {
                ...prev,
                ...effect,
                currentEvent: null
            };
        });
    };

    // 5. Election Logic (D'Hondt)
    const calculateElection = () => {
        setGameState(prev => {
            const parties = { ...prev.parties };
            const partyIds = Object.keys(parties) as PartyId[];
            const cIds = Object.keys(CONSTITUENCIES) as ConstituencyId[];

            // Reset
            partyIds.forEach(id => {
                parties[id].totalSeats = 0;
                cIds.forEach(c => parties[id].constituencySeats[c] = 0);
            });

            // D'Hondt per Constituency
            cIds.forEach(c => {
                const seatsToAlloc = CONSTITUENCIES[c].seats;
                const eligible = partyIds.filter(id => parties[id].eligibleConstituencies.includes(c));

                for (let i = 0; i < seatsToAlloc; i++) {
                    let maxQ = -1;
                    let winner: PartyId | null = null;
                    for (const id of eligible) {
                        const q = parties[id].constituencyPolling[c] / (parties[id].constituencySeats[c] + 1);
                        if (q > maxQ) {
                            maxQ = q;
                            winner = id;
                        }
                    }
                    if (winner) parties[winner].constituencySeats[c]++;
                }
            });

            // Sum Totals & Elect Candidates
            partyIds.forEach(id => {
                let sum = 0;
                cIds.forEach(c => {
                    const seats = parties[id].constituencySeats[c];
                    sum += seats;
                    // Elect candidates
                    parties[id].candidates[c].forEach((cand, idx) => {
                        if (idx < seats) cand.isElected = true;
                    });
                });
                parties[id].totalSeats = sum;
            });

            const playerSeats = parties.player.totalSeats;
            const hasMajority = playerSeats >= MAJORITY_SEATS;

            return {
                ...prev,
                isGameOver: hasMajority,
                isCoalitionPhase: !hasMajority,
                parties: parties,
                eventLog: [...prev.eventLog, `ELECTION OVER! You won ${playerSeats} seats. Majority needed: ${MAJORITY_SEATS}.`]
            };
        });
    };

    // 6. Coalition Logic
    const toggleCoalitionPartner = (partnerId: PartyId) => {
        const partner = gameState.parties[partnerId];
        if (partner.isExtremist) {
            alert(`CORDON SANITAIRE: Cannot ally with ${partner.name}.`);
            return;
        }
        setGameState(prev => {
            const current = prev.coalitionPartners;
            const isPartner = current.includes(partnerId);
            return {
                ...prev,
                coalitionPartners: isPartner ? current.filter(id => id !== partnerId) : [...current, partnerId]
            };
        });
    };

    const formGovernment = () => {
        const total = gameState.parties.player.totalSeats + gameState.coalitionPartners.reduce((sum, id) => sum + gameState.parties[id].totalSeats, 0);
        if (total >= MAJORITY_SEATS) {
            setGameState(prev => ({
                ...prev,
                isGameOver: true,
                isCoalitionPhase: false,
                eventLog: [...prev.eventLog, `GOVERNMENT FORMED with ${total} seats!`]
            }));
        } else {
            alert(`You need ${MAJORITY_SEATS} seats! Currently: ${total}`);
        }
    };

    const setSelectedConstituency = (id: ConstituencyId) => {
        setGameState(prev => ({ ...prev, selectedConstituency: id }));
    };

    // Persistence
    const saveGame = () => {
        localStorage.setItem('belpolsim_save', JSON.stringify(gameState));
        alert('Game Saved!');
    };

    const loadGame = () => {
        const saved = localStorage.getItem('belpolsim_save');
        if (saved) {
            setGameState(JSON.parse(saved));
            alert('Game Loaded!');
        } else {
            alert('No save game found.');
        }
    };

    return {
        gameState,
        handleAction,
        endTurn,
        handleEventChoice,
        toggleCoalitionPartner,
        formGovernment,
        setSelectedConstituency,
        saveGame,
        loadGame
    };
};
