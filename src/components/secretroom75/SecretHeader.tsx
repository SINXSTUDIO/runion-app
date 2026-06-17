"use client";

import { Link, usePathname } from '@/i18n/routing';
import LogoutButton from '@/components/auth/LogoutButton';
import LanguageSwitcher from '../LanguageSwitcher';
import { Menu } from 'lucide-react';

interface SecretHeaderProps {
    onToggleSidebar?: () => void;
}

export default function SecretHeader({ onToggleSidebar }: SecretHeaderProps) {
    const pathname = usePathname();

    return (
        <header className="bg-zinc-950 border-b border-white/5 py-4 px-4 sm:px-8 sticky top-0 z-35 backdrop-blur-md bg-zinc-950/80 flex items-center justify-between lg:justify-center">
            {/* Mobile Hamburger menu */}
            {onToggleSidebar && (
                <button
                    onClick={onToggleSidebar}
                    className="lg:hidden text-zinc-400 hover:text-white p-2 rounded-lg border border-white/5 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
                    aria-label="Toggle Sidebar"
                >
                    <Menu className="w-5 h-5" />
                </button>
            )}

            <div className="flex justify-center items-center h-full mx-auto lg:mx-0">
                <div className="flex items-center gap-3 sm:gap-6 bg-zinc-900/50 px-4 sm:px-6 py-1.5 rounded-full border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <LanguageSwitcher />
                    <div className="h-4 w-px bg-white/10 hidden sm:block" />
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 bg-accent/5 border border-accent/10 rounded-full text-[9px] font-mono text-accent/80 uppercase tracking-widest">
                        <div className="w-1 h-1 bg-accent rounded-full animate-pulse" />
                        Terminal Session Active
                    </div>
                    <div className="h-4 w-px bg-white/10 hidden sm:block" />
                    <LogoutButton />
                </div>
            </div>
            
            {/* Dummy element on mobile to center the middle element */}
            <div className="w-9 lg:hidden pointer-events-none" aria-hidden="true" />
        </header>
    );
}
