"use client";

import { Link, usePathname } from '@/i18n/routing';
import LogoutButton from '@/components/auth/LogoutButton';
import LanguageSwitcher from '../LanguageSwitcher';

export default function SecretHeader() {
    const pathname = usePathname();

    return (
        <header className="bg-zinc-950 border-b border-white/5 py-4 px-8 sticky top-0 z-50 backdrop-blur-md bg-zinc-950/80">
            <div className="flex justify-end items-center h-full">
                <div className="flex items-center gap-6">
                    <div className="hidden lg:block">
                        <LanguageSwitcher />
                    </div>
                    <div className="hidden sm:block px-3 py-1 bg-accent/5 border border-accent/10 rounded text-[10px] font-mono text-accent/60 uppercase tracking-widest">
                        Terminal Session Active
                    </div>
                    <LogoutButton />
                </div>
            </div>
        </header>
    );
}
