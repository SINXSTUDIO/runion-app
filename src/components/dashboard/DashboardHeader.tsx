'use client';

import { Bell, Menu } from 'lucide-react';
import { useState } from 'react';
import { useDashboard } from '@/components/dashboard/DashboardContext';
import { type UserSummary } from '@/types/user';

type DashboardHeaderProps = {
    user: UserSummary;
};

export default function DashboardHeader({ user }: DashboardHeaderProps) {
    const [notificationCount] = useState(3);
    const { toggleSidebar } = useDashboard();

    return (
        <header className="sticky top-0 z-30 bg-black/20 backdrop-blur-xl border-b border-white/10">
            <div className="flex items-center justify-between px-4 md:px-6 py-4">
                {/* Left: Mobile menu */}
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
                        aria-label="Toggle menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                {/* Right: Notifications */}
                <div className="flex items-center gap-4">
                    <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors group">
                        <Bell className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                                {notificationCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
