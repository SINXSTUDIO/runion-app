'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type DashboardContextType = {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    // Default to false (meaning NOT collapsed/Hidden, so OPEN on Mobile?)
    // Wait, the logic in Sidebar was: collapsed ? Hidden : Shown.
    // Let's stick to that naming or switch to `sidebarOpen`.
    // Sidebar logic: collapsed ? '-translate-x-full' (Hidden) : 'translate-x-0' (Shown).
    // So `collapsed=true` means Hidden on Mobile.
    // If we want it HIDDEN by default on mobile, we need `collapsed=true`.
    // But on Desktop `collapsed=true` means Small (w-20).
    // We want Expanded (w-64) on Desktop.

    // To solve this conflict properly without hydration mismatch:
    // Use CSS media queries for default state logic if possible, OR
    // Just default to `false` (Expanded/Shown) and let user close it on mobile.
    // OR better: `sidebarOpen` usually implies Mobile Open.
    // Let's implement `isSidebarOpen` specifically for mobile overlay?
    // And `isCollapsed` for desktop?
    // The current Sidebar mixes them.
    // Let's keep using `collapsed` state variable in Context to match existing logic for now, 
    // initialized to `true` (Hidden on Mobile, Collapsed on Desktop). 
    // Wait, user probably wants Expanded Desktop.
    // Let's init `false` (Expanded/Shown). 
    // If it shows up on Mobile initially, user can close it. 
    // But fixing the hamburger button allows reopening.

    // Actually, usually on Mobile it should be hidden.
    // Let's try `true` (Hidden/Collapsed) as default. 
    // This gives W-20 on Desktop (Collapsed). Maybe that's acceptable or preferred? 
    // Or I check window width? No, hydration error.

    // Let's just use `false` (Open/Expanded) for now. Providing control is the key fix.

    const [collapsed, setCollapsed] = useState(false); // Start expanded (Open on Desktop)

    const toggleSidebar = () => setCollapsed(prev => !prev);

    return (
        <DashboardContext.Provider value={{ sidebarOpen: !collapsed, setSidebarOpen: (v) => setCollapsed(!v), toggleSidebar }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}
