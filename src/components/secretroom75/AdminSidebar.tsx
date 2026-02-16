"use client";

import { Link, usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Star,
    Image as ImageIcon,
    ShoppingCart,
    Info,
    Phone,
    FileText,
    ClipboardList,
    Building2,
    Crown,
    Database,
    Package,
    Handshake,
    MessageSquare,
    CreditCard,
    Settings as SettingsIcon,
    Shield,
    ShoppingBag,
    HeartHandshake
} from 'lucide-react';

export default function AdminSidebar() {
    const pathname = usePathname();
    const t = useTranslations('Admin.Sidebar');

    const navLinks = [
        { href: '/secretroom75', label: t('dashboard'), icon: LayoutDashboard },
        { href: '/secretroom75/events', label: t('events'), icon: Calendar },
        { href: '/secretroom75/registrations', label: t('registrations'), icon: ClipboardList },
        { href: '/secretroom75/products', label: t('products'), icon: ShoppingBag },
        { href: '/secretroom75/requests', label: 'Átnevezés', icon: ClipboardList }, // Updated label to shorter version
        { href: '/secretroom75/orders', label: t('orders'), icon: Package }, // Icon changed
        { href: '/secretroom75/users', label: t('users'), icon: Users },
        { href: '/secretroom75/sellers', label: 'Szervezetek (Számlázás)', icon: Building2 },
        { href: '/secretroom75/partners', label: t('partners'), icon: Handshake }, // Visual partners
        { href: '/secretroom75/memberships', label: t('memberships'), icon: CreditCard },
        { href: '/secretroom75/gallery', label: t('gallery'), icon: ImageIcon },
        { href: '/secretroom75/sponsors', label: t('sponsors'), icon: HeartHandshake },
        { href: '/secretroom75/shop-settings', label: 'Boutique Beállítások', icon: ShoppingBag },
        { type: 'divider' },
        { href: '/secretroom75/settings', label: t('settings'), icon: SettingsIcon }, // Icon changed
        { href: '/secretroom75/settings/backup', label: t('backup'), icon: Database },
        { href: '/secretroom75/logs', label: 'Rendszernapló', icon: FileText }, // New link
        { href: '/secretroom75/audit-logs', label: 'Audit Napló', icon: Shield }, // Audit log
        { href: '/secretroom75/about', label: t('about'), icon: Info },
        { href: '/secretroom75/contact', label: t('contact'), icon: Phone },
    ];

    return (
        <aside className="w-56 bg-zinc-950 border-r border-white/5 flex-shrink-0 flex flex-col min-h-screen sticky top-0 h-screen overflow-y-auto">
            <div className="p-4 border-b border-white/5">
                <span className="text-lg font-black font-heading tracking-tighter italic block leading-tight">
                    <span className="text-white block">RUNION</span>
                    <span className="text-accent block text-base">VEZÉRLŐPULT</span>
                </span>
                <span className="text-[9px] text-zinc-500 font-mono mt-1 block">ADMIN CONSOLE v2.0</span>
            </div>

            <nav className="flex-1 px-2 py-2 space-y-0.5">
                {navLinks.map((link, index) => {
                    if (link.type === 'divider') {
                        return <div key={index} className="h-px bg-white/5 my-2 mx-2" />;
                    }

                    const isActive = pathname === link.href;
                    const Icon = link.icon!;

                    return (
                        <Link
                            key={link.href}
                            href={link.href!}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 group text-xs ${isActive
                                ? 'bg-accent text-black font-bold shadow-[0_0_10px_rgba(0,242,254,0.3)]'
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-500 group-hover:text-white'}`} />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-white/5">
                <div className="bg-zinc-900 rounded-lg p-3 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-zinc-400">{t('status')}</span>
                    </div>
                    <div className="text-[9px] text-zinc-600 font-mono leading-tight">
                        {t('uptime')}: 99.9%<br />
                        {t('db')}: CONNECTED<br />
                        REDIS: STANDBY
                    </div>
                </div>
            </div>
        </aside>
    );
}

