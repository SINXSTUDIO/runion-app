"use client";

import { Link, usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Image as ImageIcon,
    ShoppingBag,
    Info,
    Phone,
    FileText,
    ClipboardList,
    Building2,
    Database,
    Package,
    Handshake,
    CreditCard,
    Settings as SettingsIcon,
    Shield,
    HeartHandshake,
    X
} from 'lucide-react';

import { useState, useEffect } from 'react';
import versionInfo from '@/lib/version.json';

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const t = useTranslations('Admin.Sidebar');
    const [currentTime, setCurrentTime] = useState<string>('');

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const yyyy = now.getFullYear();
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            const hh = String(now.getHours()).padStart(2, '0');
            const min = String(now.getMinutes()).padStart(2, '0');
            const ss = String(now.getSeconds()).padStart(2, '0');
            setCurrentTime(`${yyyy}.${mm}.${dd}. ${hh}:${min}:${ss}`);
        };

        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    // Grouped links for a cleaner structure
    const linkGroups = [
        {
            title: "Áttekintés",
            links: [
                { href: '/secretroom75', label: t('dashboard'), icon: LayoutDashboard },
                { href: '/secretroom75/events', label: t('events'), icon: Calendar },
                { href: '/secretroom75/registrations', label: t('registrations'), icon: ClipboardList },
                { href: '/secretroom75/requests', label: 'Átnevezés', icon: ClipboardList },
            ]
        },
        {
            title: "Webshop & Butik",
            links: [
                { href: '/secretroom75/products', label: t('products'), icon: ShoppingBag },
                { href: '/secretroom75/orders', label: t('orders'), icon: Package },
                { href: '/secretroom75/shop-settings', label: 'Boutique Beállítások', icon: SettingsIcon },
            ]
        },
        {
            title: "Közösség",
            links: [
                { href: '/secretroom75/users', label: t('users'), icon: Users },
                { href: '/secretroom75/memberships', label: t('memberships'), icon: CreditCard },
                { href: '/secretroom75/sellers', label: 'Szervezetek', icon: Building2 },
                { href: '/secretroom75/partners', label: t('partners'), icon: Handshake },
                { href: '/secretroom75/sponsors', label: t('sponsors'), icon: HeartHandshake },
            ]
        },
        {
            title: "Rendszer",
            links: [
                { href: '/secretroom75/gallery', label: t('gallery'), icon: ImageIcon },
                { href: '/secretroom75/settings', label: t('settings'), icon: SettingsIcon },
                { href: '/secretroom75/settings/backup', label: t('backup'), icon: Database },
                { href: '/secretroom75/logs', label: 'Rendszernapló', icon: FileText },
                { href: '/secretroom75/audit-logs', label: 'Audit Napló', icon: Shield },
            ]
        },
        {
            title: "Támogatás",
            links: [
                { href: '/secretroom75/about', label: t('about'), icon: Info },
                { href: '/secretroom75/contact', label: t('contact'), icon: Phone },
            ]
        }
    ];

    return (
        <aside 
            className={`w-64 bg-zinc-950 border-r border-white/5 flex-shrink-0 flex flex-col min-h-screen fixed lg:sticky top-0 h-screen overflow-y-auto z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:flex ${
                isOpen ? 'translate-x-0 shadow-[5px_0_30px_rgba(0,0,0,0.8)]' : '-translate-x-full'
            }`}
        >
            {/* Sidebar Header */}
            <div className="p-5 border-b border-white/5 bg-zinc-950/50 backdrop-blur-sm flex justify-between items-center">
                <div>
                    <span className="text-xl font-black font-heading tracking-tighter italic block leading-tight">
                        <span className="text-white block">RUNION</span>
                        <span className="text-accent block text-base tracking-widest">VEZÉRLŐPULT</span>
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono mt-1 block">ADMIN CONSOLE v2.0</span>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="lg:hidden text-zinc-400 hover:text-white p-1.5 rounded-lg border border-white/5 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
                        aria-label="Close Sidebar"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Sidebar Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-6">
                {linkGroups.map((group, groupIdx) => (
                    <div key={groupIdx} className="space-y-1">
                        <h4 className="px-3 text-[9px] font-bold tracking-widest text-zinc-500 uppercase font-mono mb-1.5">
                            {group.title}
                        </h4>
                        <div className="space-y-0.5">
                            {group.links.map((link) => {
                                const isActive = pathname === link.href;
                                const Icon = link.icon;

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={onClose}
                                        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-all duration-150 group text-xs border-l-2 ${isActive
                                            ? 'bg-accent/10 text-accent font-semibold border-accent shadow-[inset_4px_0_15px_-4px_rgba(0,242,254,0.15)]'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50 border-transparent hover:translate-x-0.5'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 transition-colors duration-150 ${isActive ? 'text-accent' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                                        <span>{link.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-white/5 bg-zinc-950/50 space-y-2.5">
                {/* Rendszer verzió és pontos idő doboz */}
                <div className="bg-zinc-900/40 rounded-lg p-3 border border-white/5 shadow-inner">
                    <div className="text-[9px] text-zinc-500 font-mono leading-normal space-y-1">
                        <div className="flex justify-between items-center">
                            <span>IDŐ:</span>
                            <span className="text-zinc-300 font-bold">{currentTime || 'Betöltés...'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>VERZIÓ:</span>
                            <span className="text-accent font-bold">#{versionInfo.version}</span>
                        </div>
                        <div className="text-[8px] text-zinc-600 font-mono pt-1 border-t border-white/5 text-right">
                            BUILT: {versionInfo.builtAt}
                        </div>
                    </div>
                </div>

                {/* Eredeti Rendszerállapot doboz */}
                <div className="bg-zinc-900/40 rounded-lg p-3 border border-white/5 shadow-inner">
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-zinc-400">{t('status')}</span>
                    </div>
                    <div className="text-[9px] text-zinc-600 font-mono leading-tight space-y-0.5">
                        <div className="flex justify-between">
                            <span>{t('uptime')}:</span>
                            <span className="text-zinc-400">99.9%</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{t('db')}:</span>
                            <span className="text-emerald-500 font-semibold">CONNECTED</span>
                        </div>
                        <div className="flex justify-between">
                            <span>REDIS:</span>
                            <span className="text-amber-500 font-semibold">STANDBY</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
