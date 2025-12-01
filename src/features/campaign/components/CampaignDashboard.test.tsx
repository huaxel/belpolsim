import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CampaignDashboard } from './CampaignDashboard';

// Mock core query functions used by CampaignDashboard
vi.mock('@/core', () => ({
    getPartyStats: () => ({
        campaignStats: { 'constituency-1': { awareness: 50, favorability: 50, enthusiasm: 50 } }
    }),
    getPartyResources: () => ({ money: 10000 }),
    getConstituencyData: () => ({
        name: 'Test Constituency',
        seats: 5,
        demographics: { youth: 0.2, retirees: 0.3, workers: 0.4, upper_class: 0.1 }
    }),
    getPartyPoliticians: () => ['pol1'],
    getIdentity: () => ({ name: 'Politician 1' })
}));


// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Target: () => <div data-testid="icon-target" />,
    Smartphone: () => <div data-testid="icon-smartphone" />,
    Tv: () => <div data-testid="icon-tv" />,
    Newspaper: () => <div data-testid="icon-newspaper" />,
    Radio: () => <div data-testid="icon-radio" />,
    Users: () => <div data-testid="icon-users" />,
    TrendingUp: () => <div data-testid="icon-trending-up" />,
    DollarSign: () => <div data-testid="icon-dollar-sign" />,
    Settings: () => <div data-testid="icon-settings" />,
    Lightbulb: () => <div data-testid="icon-lightbulb" />,
    AlertCircle: () => <div data-testid="icon-alert-circle" />,
    CheckCircle: () => <div data-testid="icon-check-circle" />,
    ArrowRight: () => <div data-testid="icon-arrow-right" />,
}));

describe('CampaignDashboard', () => {
    const mockGameState = {} as any; // Minimal placeholder, queries are mocked

    const defaultProps = {
        gameState: mockGameState,
        selectedConstituency: 'constituency-1',
        onPerformAction: vi.fn(),
        onSelectConstituency: vi.fn(),
        onUpdateAutoCampaign: vi.fn()
    };

    it('renders without crashing when constituency data is present in gameState', () => {
        render(<CampaignDashboard {...defaultProps} />);
        expect(screen.getByText('Campaign War Room')).toBeInTheDocument();
        expect(screen.getByText('Test Constituency • 5 seats')).toBeInTheDocument();
    });

    it('renders safely when campaign stats are missing', () => {
        const stateWithMissingStats = {
            ...mockGameState,
            parties: {
                ...mockGameState.parties,
                player: {
                    ...mockGameState.parties.player,
                    campaignStats: {} // Empty stats
                }
            }
        };
        render(<CampaignDashboard {...defaultProps} gameState={stateWithMissingStats} />);
        expect(screen.getByText('Campaign War Room')).toBeInTheDocument();
    });
});
