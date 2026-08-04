'use client';

import { useState, useTransition } from 'react';
import { toggleMaintenance } from '@/actions/settings';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function MaintenanceToggle({ initialState }: { initialState: boolean }) {
    const [isPending, startTransition] = useTransition();
    const t = useTranslations('Admin.Dashboard');
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
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`
                relative flex items-center gap-2 px-4 h-10 rounded-xl transition-all duration-300 ease-in-out font-bold text-xs uppercase tracking-wider
                ${enabled ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20'}
                ${isPending ? 'opacity-70 cursor-wait' : 'cursor-pointer'}
            `}
            aria-label={t('maintenanceMode')}
            title={t('maintenanceMode')}
        >
            {enabled ? (
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            ) : (
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            )}
            <span className="whitespace-nowrap">{t('maintenanceMode')}</span>
            
            <div className={`
                relative w-8 h-4 rounded-full ml-2 transition-colors duration-300
                ${enabled ? 'bg-red-500/50' : 'bg-emerald-500/50'}
            `}>
                <span
                    className={`
                        absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full shadow-sm transform transition-transform duration-300
                        ${enabled ? 'translate-x-4' : 'translate-x-0'}
                    `}
                />
            </div>
        </button>
    );
}
