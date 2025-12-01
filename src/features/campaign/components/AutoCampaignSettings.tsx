import React, { useState } from 'react';
import { Settings, Save, X } from 'lucide-react';

// AutoCampaignStrategy type definition
interface AutoCampaignStrategy {
    isEnabled: boolean;
    budgetLimit: number;
    priorities: {
        critical: boolean;
        competitive: boolean;
        safe: boolean;
    };
    regions: Record<string, boolean>;
}

interface AutoCampaignSettingsProps {
    strategy: AutoCampaignStrategy;
    onUpdate: (settings: AutoCampaignStrategy) => void;
    onClose: () => void;
}

export const AutoCampaignSettings: React.FC<AutoCampaignSettingsProps> = ({
    strategy,
    onUpdate,
    onClose
}) => {
    const [settings, setSettings] = useState<AutoCampaignStrategy>(strategy);

    const handleSave = () => {
        onUpdate(settings);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <Settings className="mr-2 text-indigo-400" size={24} />
                        Auto-Campaign Settings
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Master Toggle */}
                    <div className="flex items-center justify-between bg-slate-800 p-4 rounded-lg">
                        <div>
                            <div className="font-bold text-white">Enable Auto-Campaign</div>
                            <div className="text-xs text-slate-400">Automatically run campaigns at end of turn</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.isEnabled}
                                onChange={(e) => setSettings({ ...settings, isEnabled: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    {/* Budget Limit */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-bold text-slate-300">Budget Limit (per turn)</label>
                            <span className="text-sm font-mono text-green-400">€{settings.budgetLimit.toLocaleString()}</span>
                        </div>
                        <input
                            type="range"
                            min="1000"
                            max="50000"
                            step="1000"
                            value={settings.budgetLimit}
                            onChange={(e) => setSettings({ ...settings, budgetLimit: parseInt(e.target.value) })}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                    </div>

                    {/* Priorities */}
                    <div>
                        <label className="text-sm font-bold text-slate-300 mb-2 block">Target Priorities</label>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-3 p-2 rounded hover:bg-slate-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.priorities.critical}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        priorities: { ...settings.priorities, critical: e.target.checked }
                                    })}
                                    className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-600 ring-offset-slate-800 focus:ring-2"
                                />
                                <span className="text-slate-200">Critical Regions (Margin &lt; 3%)</span>
                            </label>
                            <label className="flex items-center space-x-3 p-2 rounded hover:bg-slate-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.priorities.competitive}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        priorities: { ...settings.priorities, competitive: e.target.checked }
                                    })}
                                    className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-600 ring-offset-slate-800 focus:ring-2"
                                />
                                <span className="text-slate-200">Competitive Regions (Margin &lt; 7%)</span>
                            </label>
                            <label className="flex items-center space-x-3 p-2 rounded hover:bg-slate-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.priorities.safe}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        priorities: { ...settings.priorities, safe: e.target.checked }
                                    })}
                                    className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-600 ring-offset-slate-800 focus:ring-2"
                                />
                                <span className="text-slate-200">Safe Regions (Maintenance)</span>
                            </label>
                        </div>
                    </div>

                    {/* Regions */}
                    <div>
                        <label className="text-sm font-bold text-slate-300 mb-2 block">Active Regions</label>
                        <div className="flex space-x-4">
                            {Object.keys(settings.regions).map(region => (
                                <label key={region} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.regions[region as keyof typeof settings.regions]}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            regions: { ...settings.regions, [region]: e.target.checked }
                                        })}
                                        className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-600 ring-offset-slate-800 focus:ring-2"
                                    />
                                    <span className="text-slate-200 capitalize">{region}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-800 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-300 hover:text-white font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center"
                    >
                        <Save size={18} className="mr-2" />
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};
