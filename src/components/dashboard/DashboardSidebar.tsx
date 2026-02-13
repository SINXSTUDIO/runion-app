'use client';

import { Link } from '@/i18n/routing';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Trophy,
    FileText,
    User,
    Bell,
    ChevronLeft,
    ChevronRight,
    ShoppingBag,
    Crown
} from 'lucide-react';
import { useDashboard } from '@/components/dashboard/DashboardContext';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

type DashboardSidebarProps = {
    user: any;
    unreadCount?: number;
};

export default function DashboardSidebar({ user, unreadCount = 0 }: DashboardSidebarProps) {
    const pathname = usePathname();
    const { sidebarOpen, setSidebarOpen, toggleSidebar } = useDashboard();
    const collapsed = !sidebarOpen; // Map context state to local logic
    const t = useTranslations('Dashboard.Sidebar');
    const locale = useLocale();

    const navItems = [
        { href: '/dashboard', label: t('overview'), icon: LayoutDashboard },
        { href: '/dashboard/registrations', label: t('registrations'), icon: Trophy },
        { href: '/dashboard/orders', label: t('orders'), icon: ShoppingBag },
        { href: '/dashboard/documents', label: t('documents'), icon: FileText },
        { href: '/dashboard/membership', label: t('membership'), icon: Crown },
        { href: '/dashboard/profile', label: t('profile'), icon: User },
        { href: '/dashboard/notifications', label: t('notifications'), icon: Bell, isNotifications: true },
    ];

    const handleLinkClick = () => {
        // Close sidebar on mobile when a link is clicked
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    return (
        <>
            {/* Mobile overlay backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity z-40 ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 h-screen bg-zinc-900/50 backdrop-blur-xl border-r border-white/10
          transition-all duration-300 z-50
          ${collapsed ? '-translate-x-full lg:w-20' : 'translate-x-0 w-64'}
        `}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    {!collapsed && (
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center font-black text-white">
                                R
                            </div>
                            <span className="font-black text-xl italic tracking-tighter">RUNION</span>
                        </Link>
                    )}

                    <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors lg:block hidden"
                    >
                        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                    {/* Mobile Close Button (Visible only on mobile inside sidebar) */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors lg:hidden block"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </div>

                {/* User Info Card */}
                {!collapsed && (
                    <div className="p-6 border-b border-white/10">
                        <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="relative">
                                    {user.image ? (
                                        <Image
                                            src={user.image}
                                            alt={user.name || 'User'}
                                            width={48}
                                            height={48}
                                            className="rounded-full border-2 border-accent"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {user.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-zinc-900 rounded-full" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white truncate">
                                        {
                                            user?.name ||
                                            (user?.lastName && user?.firstName ? `${user.lastName} ${user.firstName}` : 'Felhasználó')
                                        }
                                    </p>
                                    <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-500">{t('membership')}:</span>
                                <span className="text-accent font-bold">
                                    {user.membershipTier?.name || t('memberType')}
                                </span>
                            </div>
                            {user.membershipExpiresAt && (
                                <div className="flex items-center justify-between text-xs mt-1">
                                    <span className="text-zinc-500">{t('expires')}:</span>
                                    <span className="text-zinc-400">
                                        {new Date(user.membershipExpiresAt).toLocaleDateString(locale)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="p-4 space-y-2 overflow-y-auto flex-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={handleLinkClick}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative
                  ${isActive
                                        ? 'bg-gradient-to-r from-accent/20 to-accent/5 text-white border border-accent/30'
                                        : 'hover:bg-white/5 text-zinc-400 hover:text-white'
                                    }
                  ${collapsed ? 'justify-center' : ''}
                `}
                            >
                                <div className="relative">
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : 'group-hover:text-accent'} transition-colors`} />
                                    {/* Notification Badge */}
                                    {item.isNotifications && unreadCount > 0 && (
                                        <span className={`
                                            absolute -top-1 -right-1
                                            w-2.5 h-2.5 bg-red-500 rounded-full
                                            border border-zinc-900
                                            animate-pulse
                                        `} />
                                    )}
                                </div>
                                {!collapsed && (
                                    <span className="font-medium flex-1 items-center justify-between flex">
                                        {item.label}
                                        {item.isNotifications && unreadCount > 0 && (
                                            <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-xs font-bold rounded-md">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Action */}
                {!collapsed && (
                    <div className="p-4 border-t border-white/10 space-y-2">
                        {user.role === 'ADMIN' && (
                            <Link
                                href="/secretroom75"
                                onClick={handleLinkClick}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors text-red-500 hover:text-red-400"
                            >
                                <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold">A</div>
                                <span className="text-sm font-bold uppercase">{t('admin')}</span>
                            </Link>
                        )}
                        <Link
                            href="/"
                            onClick={handleLinkClick}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-zinc-400 hover:text-white"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="text-sm font-medium">{t('backToHome')}</span>
                        </Link>
                    </div>
                )}
            </aside >
        </>
    );
}
