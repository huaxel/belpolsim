import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import type { GameState } from '../types';

interface LayoutProps {
    children: React.ReactNode;
    state: GameState;
    activeView: string;
    onViewChange: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, state, activeView, onViewChange }) => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar activeView={activeView} onViewChange={onViewChange} />

            <div className="flex-1 flex flex-col min-w-0">
                <TopBar state={state} />

                <main className="flex-1 overflow-auto p-8 relative">
                    <div className="max-w-7xl mx-auto h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
