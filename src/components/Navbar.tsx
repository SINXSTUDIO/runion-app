"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { User } from 'next-auth';
import { useCart } from '@/context/CartContext';

import { User as UserIcon, Trophy, ShoppingBag, Info, Mail, LogIn, UserPlus, Menu, X, ArrowLeftRight, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import LanguageSwitcher from './LanguageSwitcher';
import SessionTimer from '@/components/auth/SessionTimer';

interface NavbarProps {
    user?: User;
}

export default function Navbar({ user }: NavbarProps) {
    const t = useTranslations('Navbar');
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
                                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <link.icon className={`w-4 h-4 ${link.highlight ? 'text-accent' : 'text-accent'}`} />
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Side (Language & Auth) - Desktop */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Cart Icon */}
                        <button
                            onClick={toggleCart}
                            className="relative p-2 text-zinc-400 hover:text-white transition-colors mr-2"
                            aria-label="Kosár"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {count > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                    {count}
                                </span>
                            )}
                        </button>

                        <LanguageSwitcher />
                        <div className="h-6 w-px bg-white/20 mx-2"></div>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <SessionTimer />



                                <Link href="/dashboard/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
                                    <div className="text-right hidden lg:block">
                                        <p className="text-xs text-zinc-400 group-hover:text-accent transition-colors">{t('welcome')}</p>
                                        <p className="text-sm font-bold text-white">{user.name || user.firstName || 'User'}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-700 overflow-hidden group-hover:border-accent transition-colors relative">
                                        {user.image ? (
                                            <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500">
                                                <UserIcon className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                </Link>
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

                    {/* Mobile menu button & Cart */}
                    <div className="md:hidden flex items-center gap-4 relative z-[110]">
                        {/* Mobile Cart */}
                        <button
                            onClick={toggleCart}
                            className="relative p-2 text-zinc-400 hover:text-white transition-colors"
                        >
                            <ShoppingCart className="w-6 h-6" />
                            {count > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                    {count}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`inline-flex items-center justify-center p-2.5 rounded-xl transition-all duration-300 ${isOpen
                                ? 'bg-accent text-black scale-110 rotate-90 shadow-[0_0_20px_rgba(0,242,254,0.4)]'
                                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div >

            {/* Mobile Menu Overlay */}
            {
                isOpen && (
                    <div className="fixed inset-0 z-[100] md:hidden">
                        {/* Backdrop Blur Overlay */}
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-xl animate-fade-in"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Floating Menu Card */}
                        <div className="absolute top-20 right-4 left-4 bg-zinc-900/95 border border-white/10 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-slide-in-top">
                            {/* Navigation Links */}
                            <div className="flex-1 overflow-y-auto py-8 px-6 space-y-4 relative">
                                {/* Inner subtle glow for depth */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/5 blur-[100px] pointer-events-none" />

                                {navLinks.map((link, index) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-accent/10 border border-transparent hover:border-accent/20 transition-all group opacity-0 animate-slide-in-left"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:bg-accent group-hover:text-black transition-colors">
                                            <link.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <span className="text-lg font-bold text-white block">{link.label}</span>
                                            <span className="text-xs text-zinc-500 group-hover:text-accent/70 transition-colors uppercase tracking-widest">
                                                {link.href.replace('/', '') || 'Home'}
                                            </span>
                                        </div>
                                    </Link>
                                ))}


                            </div>

                            {/* Footer Actions & Socials */}
                            <div className="p-6 bg-black/40 border-t border-white/5 space-y-6">
                                <div className="grid grid-cols-2 gap-3 opacity-0 animate-fade-in" style={{ animationDelay: '500ms' }}>
                                    {user ? (
                                        <Link href="/dashboard/profile" onClick={() => setIsOpen(false)} className="col-span-2">
                                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors">
                                                <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-zinc-700 overflow-hidden relative">
                                                    {user.image ? (
                                                        <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500">
                                                            <UserIcon className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs text-zinc-400">{t('welcome')}</p>
                                                    <p className="text-lg font-bold text-white">{user.name || user.firstName || 'User'}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ) : (
                                        <>
                                            <Link href="/login" onClick={() => setIsOpen(false)}>
                                                <Button variant="ghost" className="w-full h-12 rounded-xl text-sm flex items-center justify-center gap-2 border border-white/5 hover:bg-white/5">
                                                    <LogIn className="w-4 h-4 text-accent" />
                                                    {t('login')}
                                                </Button>
                                            </Link>
                                            <Link href="/register" onClick={() => setIsOpen(false)}>
                                                <Button variant="primary" className="w-full h-12 rounded-xl text-sm flex items-center justify-center gap-2 font-bold uppercase tracking-tighter shadow-[0_0_15px_rgba(0,242,254,0.2)]">
                                                    <UserPlus className="w-4 h-4 text-accent" />
                                                    {t('register')}
                                                </Button>
                                            </Link>
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-white/5 opacity-0 animate-fade-in" style={{ animationDelay: '600ms' }}>
                                    <LanguageSwitcher />
                                    <div className="flex gap-4">
                                        <a href="https://www.facebook.com/runion2021" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-accent/20 transition-all border border-transparent hover:border-accent/30 shadow-inner">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                        </a>
                                        <a href="https://www.instagram.com/runion_hungary" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-accent/20 transition-all border border-transparent hover:border-accent/30 shadow-inner">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.981 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                                        </a>
                                        <a href="https://strava.com" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-accent/20 transition-all border border-transparent hover:border-accent/30 shadow-inner">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.065l-2.085 4.116zm-5.283-1.258V12.16H7.04L10.104 6l3.064 6.161h-3.064v4.525z" /></svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </nav >
    );
}
