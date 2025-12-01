import React, { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { ToastContext } from './ToastContext';
import type { Toast } from './ToastContext';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`
                            pointer-events-auto flex items-center justify-between p-4 rounded-lg shadow-lg min-w-[300px] animate-in slide-in-from-right-full fade-in duration-300
                            ${toast.type === 'info' ? 'bg-blue-600 text-white' : ''}
                            ${toast.type === 'success' ? 'bg-green-600 text-white' : ''}
                            ${toast.type === 'warning' ? 'bg-yellow-500 text-white' : ''}
                            ${toast.type === 'error' ? 'bg-red-600 text-white' : ''}
                        `}
                    >
                        <span className="font-medium">{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-4 hover:bg-white/20 p-1 rounded-full transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
