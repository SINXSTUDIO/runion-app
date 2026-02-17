'use client';

import { logoutUser } from '@/actions/user-actions';
import { useTranslations } from 'next-intl';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LogoutButton() {
    const t = useTranslations('Dashboard.Home');

    return (
        <Button
            variant="ghost"
            onClick={() => logoutUser()}
            className="
                group relative overflow-hidden
                bg-red-950/10 hover:bg-red-950/20
                border border-red-500/30 hover:border-red-500
                text-red-400 hover:text-red-300
                px-6 py-2 rounded-xl
                transition-all duration-300
                flex items-center gap-3
                shadow-[0_0_15px_rgba(239,68,68,0.05)] hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]
            "
        >
            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-bold tracking-wide">{t('logout')}</span>
        </Button>
    );
}
