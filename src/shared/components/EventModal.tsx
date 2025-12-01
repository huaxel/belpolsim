import type { EventChoice, GameEvent } from '@/core';

interface EventModalProps {
    event: GameEvent;
    onChoice: (choice: EventChoice) => void;
}

export const EventModal = ({ event, onChoice }: EventModalProps) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-indigo-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h2>
                <p className="text-gray-600 mb-6">{event.description}</p>

                <div className="space-y-3">
                    {event.choices.map((choice, index) => (
                        <button
                            key={index}
                            onClick={() => onChoice(choice)}
                            className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                        >
                            <div className="font-bold text-indigo-900 group-hover:text-indigo-700">{choice.text}</div>
                            <div className="text-sm text-gray-500">{choice.description}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
