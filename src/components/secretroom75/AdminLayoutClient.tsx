"use client";

import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import SecretHeader from "./SecretHeader";
import { User } from "next-auth";
import { Link, usePathname } from "@/i18n/routing";
import { LayoutDashboard, Calendar, ClipboardList, Package, LayoutGrid } from "lucide-react";

interface AdminLayoutClientProps {
    children: React.ReactNode;
    user?: User;
}

export default function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    const adminBottomNavItems = [
        { href: '/secretroom75', label: 'Vezérlőpult', icon: LayoutDashboard },
        { href: '/secretroom75/events', label: 'Események', icon: Calendar },
        { href: '/secretroom75/registrations', label: 'Nevezések', icon: ClipboardList },
        { href: '/secretroom75/orders', label: 'Rendelések', icon: Package },
    ];

    return (
        <div className="secret-layout min-h-screen bg-black flex relative">
            {/* Backdrop for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Responsive Sidebar */}
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
                <SecretHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                    {children}
                </main>
            </div>

            {/* ENOX-Style Fixed Bottom Mobile Nav Bar (lg:hidden) */}
            <div className="fixed bottom-0 inset-x-0 z-[150] lg:hidden bg-zinc-950/95 backdrop-blur-2xl border-t border-white/10 px-2 py-2 flex items-center justify-around shadow-[0_-5px_25px_rgba(0,0,0,0.8)]">
                {adminBottomNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all group ${
                                isActive ? 'text-accent' : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            <Icon className={`w-5 h-5 mb-1 transition-transform group-active:scale-95 ${isActive ? 'text-accent drop-shadow-[0_0_8px_rgba(0,242,254,0.5)]' : 'text-zinc-400'}`} />
                            <span className={`text-[10px] font-bold tracking-tight truncate max-w-[65px] ${isActive ? 'text-accent' : 'text-zinc-400'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}

                {/* ENOX 5th Item: Menü button triggering full screen ENOX App Grid modal */}
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="flex flex-col items-center justify-center flex-1 py-1 transition-all group"
                >
                    <div className="px-3 py-1 rounded-xl bg-zinc-900 border border-accent/60 text-accent group-active:scale-95 shadow-[0_0_12px_rgba(0,242,254,0.2)] flex flex-col items-center justify-center">
                        <LayoutGrid className="w-5 h-5 text-accent" />
                        <span className="text-[10px] font-black text-accent tracking-wider uppercase mt-0.5">Menü</span>
                    </div>
                </button>
            </div>
        </div>
    );
}
