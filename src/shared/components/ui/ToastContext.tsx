import { createContext, useContext } from 'react';

export interface Toast {
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

export interface ToastContextType {
    addToast: (message: string, type?: Toast['type']) => void;
    removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
