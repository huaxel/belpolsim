import { useEffect, useRef } from 'react';

interface EventLogProps {
    logs: string[];
}

export const EventLog = ({ logs }: EventLogProps) => {
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-800 h-64 overflow-y-auto">
            <h3 className="font-bold mb-2 text-slate-500 uppercase text-xs tracking-wider">Event Log</h3>
            <div className="space-y-2">
                {logs.map((l, i) => <div key={i} className="text-xs p-2 bg-slate-800 text-slate-300 rounded border border-slate-700">{l}</div>)}
                <div ref={logEndRef} />
            </div>
        </div>
    );
};
