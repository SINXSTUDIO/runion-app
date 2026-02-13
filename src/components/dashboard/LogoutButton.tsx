'use client';

import { logoutUser } from '@/actions/user-actions';
import { useLocale } from 'next-intl';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LogoutButton() {
    const locale = useLocale();
    return (
        <Button
            variant="ghost"
            onClick={() => logoutUser()}
            className="text-red-400 hover:text-red-300 hover:bg-red-950/20 gap-2 border border-red-900/20"
        >
            <LogOut className="w-4 h-4" />
            Kijelentkezés
        </Button>
    );
}
