"use client";

import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import SecretHeader from "./SecretHeader";

interface AdminLayoutClientProps {
    children: React.ReactNode;
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="secret-layout min-h-screen bg-black flex">
            {/* Backdrop for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Responsive Sidebar */}
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <SecretHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
