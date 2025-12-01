import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CampaignDashboard } from './CampaignDashboard';
import React from 'react';

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
    const mockGameState = {
        budget: 10000,
        parties: {
            player: {
                campaignStats: {
                    'constituency-1': {
                        awareness: 50,
                        favorability: 50,
                        enthusiasm: 50
                    }
                },
                politicians: {
                    'constituency-1': [
                        { name: 'Politician 1', charisma: 7 }
                    ]
                },
                autoCampaign: null
            }
        },
        constituencies: {
            'constituency-1': {
                id: 'constituency-1',
                name: 'Test Constituency',
                seats: 5,
                demographics: {
                    youth: 0.2,
                    retirees: 0.3,
                    workers: 0.4,
                    upper_class: 0.1
                }
            }
        }
    };

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
});
