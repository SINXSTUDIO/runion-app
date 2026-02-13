import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { serializeData } from '@/lib/utils/serialization';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import prisma from '@/lib/prisma';
import { getUnreadNotificationCount } from '@/actions/notifications';

import { DashboardProvider } from '@/components/dashboard/DashboardContext';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const session = await auth();

    if (!session?.user?.email) {
        redirect('/login');
    }

    // Fetch full user with membership tier
    const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            membershipTier: true
        }
    });

    if (!dbUser) {
        redirect('/login');
    }

    return (
        <DashboardProvider>
            <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white">
                {/* Background decorative elements */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="relative z-10 flex">
                    {/* Sidebar */}
                    <DashboardSidebar user={serializeData(dbUser)} unreadCount={await getUnreadNotificationCount()} />

                    {/* Main content */}
                    {/* lg:ml-64 is hardcoded, but sidebar can be collapsed. 
                        Ideally, we should use a peer-checked or context-based class, but for now let's stick to w-64 as default open.
                        Wait, the user says sidebar is GONE.
                        Maybe z-index issue with the background?
                    */}
                    <div className="flex-1 flex flex-col min-h-screen lg:pl-64 transition-all duration-300">
                        <DashboardHeader user={serializeData(dbUser)} />

                        <main className="flex-1 p-4 md:p-6 lg:p-8">
                            <div className="max-w-7xl mx-auto">
                                {children}
                            </div>
                        </main>

                        {/* Footer */}
                    </div>
                </div>
            </div>
        </DashboardProvider>
    );
}
