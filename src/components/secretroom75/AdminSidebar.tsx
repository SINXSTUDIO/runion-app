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
    X,
    User as UserIcon
} from 'lucide-react';

import { useState, useEffect } from 'react';
import versionInfo from '@/lib/version.json';
import { User } from 'next-auth';

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    user?: User;
}

export default function AdminSidebar({ isOpen = false, onClose, user }: AdminSidebarProps) {
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

    // Grouped links with Next-intl dynamic translation
    const linkGroups = [
        {
            title: t('groups.overview'),
            links: [
                { href: '/secretroom75', label: t('dashboard'), icon: LayoutDashboard },
                { href: '/secretroom75/events', label: t('events'), icon: Calendar },
                { href: '/secretroom75/registrations', label: t('registrations'), icon: ClipboardList },
                { href: '/secretroom75/requests', label: t('links.requests'), icon: ClipboardList },
            ]
        },
        {
            title: t('groups.shop'),
            links: [
                { href: '/secretroom75/products', label: t('products'), icon: ShoppingBag },
                { href: '/secretroom75/orders', label: t('orders'), icon: Package },
                { href: '/secretroom75/shop-settings', label: t('links.shopSettings'), icon: SettingsIcon },
            ]
        },
        {
            title: t('groups.community'),
            links: [
                { href: '/secretroom75/users', label: t('users'), icon: Users },
                { href: '/secretroom75/memberships', label: t('memberships'), icon: CreditCard },
                { href: '/secretroom75/sellers', label: t('links.sellers'), icon: Building2 },
                { href: '/secretroom75/partners', label: t('partners'), icon: Handshake },
                { href: '/secretroom75/sponsors', label: t('sponsors'), icon: HeartHandshake },
            ]
        },
        {
            title: t('groups.system'),
            links: [
                { href: '/secretroom75/gallery', label: t('gallery'), icon: ImageIcon },
                { href: '/secretroom75/settings', label: t('settings'), icon: SettingsIcon },
                { href: '/secretroom75/settings/backup', label: t('backup'), icon: Database },
                { href: '/secretroom75/logs', label: t('links.logs'), icon: FileText },
                { href: '/secretroom75/audit-logs', label: t('links.auditLogs'), icon: Shield },
            ]
        },
        {
            title: t('groups.support'),
            links: [
                { href: '/secretroom75/about', label: t('about'), icon: Info },
                { href: '/secretroom75/contact', label: t('contact'), icon: Phone },
            ]
        }
    ];

    // Flatten links for mobile ENOX 3-column app grid view
    const allMobileLinks = linkGroups.flatMap(group => group.links);

    return (
        <>
            {/* Desktop Sidebar (lg:flex) */}
            <aside
                className="hidden lg:flex w-64 bg-zinc-950 border-r border-white/5 flex-shrink-0 flex-col min-h-screen sticky top-0 h-screen overflow-y-auto z-50"
            >
                {/* Sidebar Header */}
                <div className="p-5 border-b border-white/5 bg-zinc-950/50 backdrop-blur-sm flex justify-between items-center">
                    <div>
                        <span className="text-xl font-black font-heading tracking-tighter italic block leading-tight">
                            <span className="text-white block">RUNION</span>
                            <span className="text-accent block text-base tracking-widest">{t('controlPanel')}</span>
                        </span>
                        <span className="text-[9px] text-zinc-500 font-mono mt-1 block">ADMIN CONSOLE v2.0</span>
                    </div>
                </div>

                {/* User Profile in Admin Sidebar */}
                {user && (
                    <div className="p-4 mx-3 mt-4 bg-zinc-900/40 border border-white/5 rounded-2xl flex items-center gap-3 shadow-inner backdrop-blur-sm">
                        <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 overflow-hidden relative shrink-0">
                            {user.image ? (
                                <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500">
                                    <UserIcon className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest leading-none">{t('welcome')}</p>
                            <p className="text-xs font-bold text-white truncate mt-1" title={user.name || user.firstName || user.email || 'Admin'}>
                                {user.name || user.firstName || user.email || 'Admin'}
                            </p>
                        </div>
                    </div>
                )}

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
                                <span>{t('time')}:</span>
                                <span className="text-zinc-300 font-bold">{currentTime || t('loading')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>{t('version')}:</span>
                                <span className="text-accent font-bold">#{versionInfo.version}</span>
                            </div>
                            <div className="text-[8px] text-zinc-600 font-mono pt-1 border-t border-white/5 text-right">
                                BUILT: {versionInfo.builtAt}
                            </div>
                        </div>
                    </div>

                    {/* Rendszerállapot doboz */}
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

            {/* Mobile Fullscreen ENOX App Grid Modal (lg:hidden) */}
            {isOpen && (
                <div className="fixed inset-0 z-[200] lg:hidden bg-zinc-950/98 backdrop-blur-2xl flex flex-col h-full w-full overflow-hidden animate-fade-in">
                    {/* Top Header Badge */}
                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-900/80">
                        <div>
                            <span className="text-lg font-black font-heading tracking-tight text-white block">
                                RUNION <span className="text-accent">VEZÉRLŐPULT</span>
                            </span>
                            <span className="text-[10px] text-accent font-mono font-semibold">VERSION v2.1-#{versionInfo.version}</span>
                        </div>

                        {user && (
                            <div className="flex items-center gap-2 bg-zinc-800/80 px-3 py-1.5 rounded-full border border-accent/40 shadow-[0_0_10px_rgba(0,242,254,0.15)]">
                                <div className="w-6 h-6 rounded-full bg-accent text-black flex items-center justify-center font-bold text-xs">
                                    {user.name?.[0] || 'A'}
                                </div>
                                <span className="text-xs font-bold text-white truncate max-w-[110px]">
                                    {user.name || user.firstName || 'Admin'}
                                </span>
                            </div>
                        )}

                        {onClose && (
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    {/* Grid Title */}
                    <div className="pt-4 px-4 text-center">
                        <h3 className="text-base font-black text-white uppercase tracking-wider font-heading">Összes Menüpont</h3>
                        <p className="text-xs text-zinc-400 mt-0.5">Válaszd ki a kívánt modult</p>
                    </div>

                    {/* 3-Column ENOX App Grid */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-3 gap-2.5">
                            {allMobileLinks.map((link) => {
                                const isActive = pathname === link.href;
                                const Icon = link.icon;

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={onClose}
                                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center min-h-[95px] relative group ${isActive
                                            ? 'bg-accent/20 border-accent text-accent shadow-[0_0_20px_rgba(0,242,254,0.25)] ring-1 ring-accent'
                                            : 'bg-zinc-900/90 border-white/10 text-zinc-300 hover:bg-zinc-800 hover:border-accent/40'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl mb-2 flex items-center justify-center transition-colors ${isActive ? 'bg-accent text-black shadow-md' : 'bg-zinc-800 text-accent group-hover:bg-accent group-hover:text-black'}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className={`text-[11px] font-bold leading-tight truncate w-full px-0.5 ${isActive ? 'text-accent' : 'text-zinc-200 group-hover:text-white'}`}>
                                            {link.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom Full-width Close Button */}
                    <div className="p-4 border-t border-white/10 bg-zinc-950">
                        <button
                            onClick={onClose}
                            className="w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm border border-white/10 transition-colors uppercase tracking-wider shadow-lg"
                        >
                            Bezárás
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
