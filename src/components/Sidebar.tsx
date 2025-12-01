import React from 'react';
import { LayoutDashboard, Map, Users, Settings, Landmark } from 'lucide-react';

interface SidebarProps {
    activeView: string;
    onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'map', label: 'Map', icon: Map },
        { id: 'parliament', label: 'Parliament', icon: Landmark },
        { id: 'party', label: 'Party', icon: Users },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="w-64 bg-[var(--color-cabinet-charcoal)] border-r border-white/10 flex flex-col h-screen">
            <div className="p-6 border-b border-white/10">
                <h1 className="text-xl font-bold text-[var(--color-royal-gold)] tracking-wider font-serif">FORMATEUR</h1>
                <p className="text-xs text-gray-400 mt-1">Federal Campaign 2029</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-sm transition-all duration-200 ${isActive
                                ? 'bg-[var(--color-royal-gold)]/10 text-[var(--color-royal-gold)] border-l-2 border-[var(--color-royal-gold)]'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10">
                <div className="bg-white/5 rounded-sm p-3">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-2">Next Election</p>
                    <div className="text-sm font-mono text-white">May 26, 2029</div>
                </div>
            </div>
        </div>
    );
};
