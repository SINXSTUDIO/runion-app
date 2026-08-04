"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { User } from 'next-auth';
import { useCart } from '@/context/CartContext';

import { User as UserIcon, Trophy, ShoppingBag, Info, Mail, LogIn, UserPlus, Menu, X, ArrowLeftRight, ShoppingCart, LayoutGrid, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import LanguageSwitcher from './LanguageSwitcher';
import SessionTimer from '@/components/auth/SessionTimer';

interface NavbarProps {
    user?: User;
}

export default function Navbar({ user }: NavbarProps) {
    const t = useTranslations('Navbar');
    const pathname = usePathname();
    const isAdminPage = pathname.startsWith('/secretroom75');
    const [isOpen, setIsOpen] = useState(false);
    const { count, toggleCart } = useCart();

    const navLinks = [
        { href: '/races', label: t('races'), icon: Trophy },
        { href: '/boutique', label: t('results'), icon: ShoppingBag },
        { href: '/about', label: t('about'), icon: Info },
        { href: '/contact', label: t('contact'), icon: Mail },
        { href: '/transfer', label: t('transfer'), icon: ArrowLeftRight, highlight: true },
    ];

    return (
        <>
            <nav className="sticky top-0 z-50 w-full bg-primary/95 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0 relative z-[110]">
                            <Link href="/" className="flex items-center gap-2">
                                <span className="text-2xl font-black font-heading tracking-tighter italic">
                                    <span className="text-white">RUN</span>
                                    <span className="text-accent">ION</span>
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${link.highlight
                                            ? 'text-accent border border-accent/20 bg-accent/5 hover:bg-accent/10 hover:border-accent/40 shadow-[0_0_10px_rgba(0,242,254,0.1)]'
                                            : pathname === link.href
                                                ? 'text-accent font-semibold'
                                                : 'text-zinc-400 hover:text-white'
                                            }`}
                                    >
                                        <link.icon className="w-4 h-4" />
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Right side buttons */}
                        <div className="hidden md:flex items-center gap-4">
                            <LanguageSwitcher />

                            {user ? (
                                <div className="flex items-center gap-3">
                                    <SessionTimer />
                                    {isAdminPage ? (
                                        <Link href="/secretroom75">
                                            <Button variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                                                {t('adminPanel')}
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Link href="/dashboard/profile" className="flex items-center gap-2 group">
                                            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 overflow-hidden relative group-hover:border-accent transition-colors">
                                                {user.image ? (
                                                    <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500">
                                                        <UserIcon className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <Button variant="ghost" size="sm" className="hidden lg:flex gap-2 items-center">
                                            <LogIn className="w-4 h-4 text-accent" />
                                            {t('login')}
                                        </Button>
                                    </Link>
                                    <Link href="/register">
                                        <Button variant="primary" size="sm" className="flex gap-2 items-center">
                                            <UserPlus className="w-4 h-4" />
                                            {t('register')}
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Cart Button on Header */}
                        <div className="md:hidden flex items-center gap-3">
                            <button
                                onClick={toggleCart}
                                className="relative p-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                <ShoppingCart className="w-6 h-6 text-accent" />
                                {count > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                        {count}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay - 100% Fullscreen ENOX App Grid */}
            {isOpen && (
                <div className="fixed inset-0 z-[200] md:hidden bg-zinc-950/98 backdrop-blur-2xl flex flex-col h-full w-full overflow-hidden animate-fade-in">
                    {/* Top Header Badge */}
                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-900/80 shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-black font-heading tracking-tighter italic">
                                <span className="text-white">RUN</span>
                                <span className="text-accent">ION</span>
                            </span>
                            <span className="text-[10px] bg-accent/20 text-accent px-2.5 py-0.5 rounded-full font-mono font-bold border border-accent/30 uppercase">
                                Mobil Menü
                            </span>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* User Status Bar if logged in */}
                    {user && (
                        <div className="mx-4 mt-4 p-3 bg-zinc-900/90 border border-white/10 rounded-2xl flex items-center gap-3 shadow-lg shrink-0">
                            <div className="w-10 h-10 shrink-0 rounded-full bg-zinc-800 border-2 border-accent overflow-hidden relative">
                                {user.image ? (
                                    <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">{t('welcome')}</p>
                                <p className="text-sm font-bold text-white truncate" title={user.name || user.firstName || 'User'}>
                                    {user.name || user.firstName || 'User'}
                                </p>
                            </div>
                            <Link
                                href="/dashboard/profile"
                                onClick={() => setIsOpen(false)}
                                className="px-3.5 py-1.5 rounded-xl bg-accent text-black font-bold text-xs hover:bg-accent-hover transition-colors shadow-md"
                            >
                                Fiókom
                            </Link>
                        </div>
                    )}

                    {/* Grid Title */}
                    <div className="pt-4 px-4 text-center shrink-0">
                        <h3 className="text-base font-black text-white uppercase tracking-wider font-heading">Összes Menüpont</h3>
                        <p className="text-xs text-zinc-400 mt-0.5">Válaszd ki a kívánt modult</p>
                    </div>

                    {/* 3-Column ENOX App Grid */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="grid grid-cols-3 gap-2.5">
                            {/* Home Card */}
                            <Link
                                href="/"
                                onClick={() => setIsOpen(false)}
                                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center min-h-[95px] relative group ${pathname === '/'
                                    ? 'bg-accent/20 border-accent text-accent shadow-[0_0_20px_rgba(0,242,254,0.25)] ring-1 ring-accent'
                                    : 'bg-zinc-900/90 border-white/10 text-zinc-300 hover:bg-zinc-800'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-xl mb-2 flex items-center justify-center transition-colors ${pathname === '/' ? 'bg-accent text-black shadow-md' : 'bg-zinc-800 text-accent group-hover:bg-accent group-hover:text-black'}`}>
                                    <Home className="w-5 h-5" />
                                </div>
                                <span className={`text-[11px] font-bold leading-tight truncate w-full px-0.5 ${pathname === '/' ? 'text-accent font-black' : 'text-zinc-200 group-hover:text-white'}`}>
                                    Főoldal
                                </span>
                            </Link>

                            {/* Nav links */}
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                const Icon = link.icon;

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center min-h-[95px] relative group ${isActive
                                            ? 'bg-accent/20 border-accent text-accent shadow-[0_0_20px_rgba(0,242,254,0.25)] ring-1 ring-accent'
                                            : link.highlight
                                                ? 'bg-zinc-900/90 border-accent/50 text-accent hover:bg-zinc-800'
                                                : 'bg-zinc-900/90 border-white/10 text-zinc-300 hover:bg-zinc-800 hover:border-accent/40'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl mb-2 flex items-center justify-center transition-colors ${isActive || link.highlight ? 'bg-accent text-black shadow-md' : 'bg-zinc-800 text-accent group-hover:bg-accent group-hover:text-black'}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className={`text-[11px] font-bold leading-tight truncate w-full px-0.5 ${isActive || link.highlight ? 'text-accent font-black' : 'text-zinc-200 group-hover:text-white'}`}>
                                            {link.label}
                                        </span>
                                    </Link>
                                );
                            })}

                            {/* Admin link in Grid if admin */}
                            {user && (
                                <Link
                                    href="/secretroom75"
                                    onClick={() => setIsOpen(false)}
                                    className="flex flex-col items-center justify-center p-3 rounded-2xl border border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-center min-h-[95px] relative group"
                                >
                                    <div className="w-10 h-10 rounded-xl mb-2 flex items-center justify-center bg-red-500 text-white shadow-md">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[11px] font-bold leading-tight truncate w-full px-0.5 text-red-400">
                                        Admin
                                    </span>
                                </Link>
                            )}
                        </div>

                        {/* Auth buttons if logged out */}
                        {!user && (
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Link href="/login" onClick={() => setIsOpen(false)}>
                                    <Button variant="ghost" className="w-full h-12 rounded-xl text-sm flex items-center justify-center gap-2 border border-accent/50 text-accent hover:bg-accent hover:text-black transition-all font-bold">
                                        <LogIn className="w-4 h-4" />
                                        {t('login')}
                                    </Button>
                                </Link>
                                <Link href="/register" onClick={() => setIsOpen(false)}>
                                    <Button variant="primary" className="w-full h-12 rounded-xl text-sm flex items-center justify-center gap-2 font-bold uppercase tracking-tighter shadow-[0_0_15px_rgba(0,242,254,0.2)]">
                                        <UserPlus className="w-4 h-4" />
                                        {t('register')}
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Socials & Language Switcher */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <LanguageSwitcher />
                            <div className="flex gap-3">
                                <a href="https://www.facebook.com/runion2021" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-accent hover:text-black hover:bg-accent transition-all border border-accent/40">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                </a>
                                <a href="https://www.instagram.com/runion_hungary" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-accent hover:text-black hover:bg-accent transition-all border border-accent/40">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.981 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Full-width Close Button */}
                    <div className="p-4 border-t border-white/10 bg-zinc-950 shrink-0">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm border border-white/10 transition-colors uppercase tracking-wider shadow-lg"
                        >
                            Bezárás
                        </button>
                    </div>
                </div>
            )}

            {/* ENOX-Style Fixed Bottom Mobile Nav Bar (md:hidden) */}
            <div className="fixed bottom-0 inset-x-0 z-[150] md:hidden bg-zinc-950/98 backdrop-blur-2xl border-t border-white/10 px-2 py-2 flex items-center justify-around shadow-[0_-5px_25px_rgba(0,0,0,0.9)]">
                <Link
                    href="/"
                    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all group ${pathname === '/' ? 'text-accent' : 'text-zinc-400 hover:text-white'
                        }`}
                >
                    <Home className={`w-5 h-5 mb-1 transition-transform group-active:scale-95 ${pathname === '/' ? 'text-accent drop-shadow-[0_0_8px_rgba(0,242,254,0.5)]' : 'text-zinc-400'}`} />
                    <span className={`text-[10px] font-bold tracking-tight truncate max-w-[65px] ${pathname === '/' ? 'text-accent' : 'text-zinc-400'}`}>
                        Főoldal
                    </span>
                </Link>

                <Link
                    href="/races"
                    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all group ${pathname === '/races' ? 'text-accent' : 'text-zinc-400 hover:text-white'
                        }`}
                >
                    <Trophy className={`w-5 h-5 mb-1 transition-transform group-active:scale-95 ${pathname === '/races' ? 'text-accent drop-shadow-[0_0_8px_rgba(0,242,254,0.5)]' : 'text-zinc-400'}`} />
                    <span className={`text-[10px] font-bold tracking-tight truncate max-w-[65px] ${pathname === '/races' ? 'text-accent' : 'text-zinc-400'}`}>
                        Versenyek
                    </span>
                </Link>

                <Link
                    href="/boutique"
                    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all group ${pathname === '/boutique' ? 'text-accent' : 'text-zinc-400 hover:text-white'
                        }`}
                >
                    <ShoppingBag className={`w-5 h-5 mb-1 transition-transform group-active:scale-95 ${pathname === '/boutique' ? 'text-accent drop-shadow-[0_0_8px_rgba(0,242,254,0.5)]' : 'text-zinc-400'}`} />
                    <span className={`text-[10px] font-bold tracking-tight truncate max-w-[65px] ${pathname === '/boutique' ? 'text-accent' : 'text-zinc-400'}`}>
                        Butik
                    </span>
                </Link>

                <Link
                    href={user ? '/dashboard/profile' : '/login'}
                    className={`flex flex-col items-center justify-center flex-1 py-1 transition-all group ${pathname.startsWith('/dashboard') || pathname === '/login' ? 'text-accent' : 'text-zinc-400 hover:text-white'
                        }`}
                >
                    <UserIcon className={`w-5 h-5 mb-1 transition-transform group-active:scale-95 ${pathname.startsWith('/dashboard') || pathname === '/login' ? 'text-accent drop-shadow-[0_0_8px_rgba(0,242,254,0.5)]' : 'text-zinc-400'}`} />
                    <span className={`text-[10px] font-bold tracking-tight truncate max-w-[65px] ${pathname.startsWith('/dashboard') || pathname === '/login' ? 'text-accent' : 'text-zinc-400'}`}>
                        {user ? 'Fiókom' : 'Belépés'}
                    </span>
                </Link>

                {/* ENOX 5th Item: Menü button triggering full screen ENOX App Grid modal */}
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex flex-col items-center justify-center flex-1 py-1 transition-all group"
                >
                    <div className="px-3 py-1 rounded-xl bg-zinc-900 border border-accent/60 text-accent group-active:scale-95 shadow-[0_0_12px_rgba(0,242,254,0.2)] flex flex-col items-center justify-center">
                        <LayoutGrid className="w-5 h-5 text-accent" />
                        <span className="text-[10px] font-black text-accent tracking-wider uppercase mt-0.5">Menü</span>
                    </div>
                </button>
            </div>
        </>
    );
}
