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
                {/* Left: Dashboard Title or Empty */}
                <div className="flex items-center gap-4 flex-1">
                </div>

                {/* Right: Notifications removed as per request */}
                <div className="flex items-center gap-4">
                    {/* Placeholder or empty if nothing else is needed */}
                </div>
            </div>
        </header>
    );
}
