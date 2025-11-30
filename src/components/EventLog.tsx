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
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 h-64 overflow-y-auto">
            <h3 className="font-bold mb-2 text-gray-500 uppercase text-xs">Event Log</h3>
            <div className="space-y-2">
                {logs.map((l, i) => <div key={i} className="text-xs p-2 bg-gray-50 rounded border">{l}</div>)}
                <div ref={logEndRef} />
            </div>
        </div>
    );
};
