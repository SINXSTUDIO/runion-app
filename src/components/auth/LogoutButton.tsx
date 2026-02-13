'use client';

import { logoutUser } from '@/actions/user-actions';
import { Button } from '@/components/ui/Button';
import { LogOut } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function LogoutButton({ className }: { className?: string }) {
    const locale = useLocale();

    return (
        <Button
            variant="ghost"
            size="sm"
            className={`text-red-400 hover:text-red-300 hover:bg-red-900/20 gap-2 ${className}`}
            onClick={() => logoutUser()}
        >
            <LogOut className="w-4 h-4" />
            Kijelentkezés
        </Button>
    );
}
