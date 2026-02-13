'use client';

import { useState, useTransition } from 'react';
import { toggleMaintenance } from '@/actions/settings';
import { useRouter } from 'next/navigation';

export default function MaintenanceToggle({ initialState }: { initialState: boolean }) {
    const [isPending, startTransition] = useTransition();
    const [enabled, setEnabled] = useState(initialState);
    const router = useRouter();

    const handleToggle = () => {
        const newState = !enabled;
        setEnabled(newState); // Optimistic

        startTransition(async () => {
            const result = await toggleMaintenance(newState);
            if (!result.success) {
                setEnabled(!newState); // Revert on failure
                console.error('Failed to toggle maintenance mode');
            } else {
                router.refresh();
            }
        });
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-4 rounded-xl flex items-center justify-between shadow-lg max-w-md">
            <div className="flex flex-col gap-1">
                <h3 className="text-white font-bold flex items-center gap-2">
                    {enabled ? (
                        <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    ) : (
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                    )}
                    Karbantartási Mód
                </h3>
                <p className="text-xs text-gray-400">
                    {enabled
                        ? "Az oldal jelenleg \"Coming Soon\" módban van."
                        : "Az oldal nyilvános és elérhető."}
                </p>
            </div>

            <button
                onClick={handleToggle}
                disabled={isPending}
                className={`
          relative w-14 h-8 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/50
          ${enabled ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-gray-600 hover:bg-gray-500'}
          ${isPending ? 'opacity-70 cursor-wait' : 'cursor-pointer'}
        `}
                aria-label="Toggle Maintenance Mode"
            >
                <span
                    className={`
            absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300
            ${enabled ? 'translate-x-6' : 'translate-x-0'}
          `}
                />
            </button>
        </div>
    );
}
