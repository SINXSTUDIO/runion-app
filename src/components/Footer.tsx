"use client";

import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useState, useEffect } from 'react';

export default function Footer() {
    const t = useTranslations('Footer');
    const router = useRouter();
    const [clickCount, setClickCount] = useState(0);

    const handleSecretClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setClickCount(prev => prev + 1);
    };

    useEffect(() => {
        if (clickCount === 0) return;

        const timeout = setTimeout(() => {
            setClickCount(0);
        }, 1000);

        if (clickCount >= 3) {
            clearTimeout(timeout);
            router.push('/secretroom75');
            setClickCount(0);
        }

        return () => clearTimeout(timeout);
    }, [clickCount, router]);

    return (
        <footer className="relative bg-gradient-to-b from-primary via-primary to-black/50 border-t border-white/10 mt-auto overflow-hidden">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5 pointer-events-none" />

            {/* Animated Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
                backgroundImage: `linear-gradient(0deg, rgba(255,255,255,0.1) 1px, transparent 1px),
                                 linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
            }} />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">

                    {/* Brand & Description */}
                    <div className="md:col-span-1 flex flex-col items-center md:items-start gap-4">
                        <Link href="/" className="group">
                            <span className="text-3xl font-black font-heading tracking-tighter italic">
                                <span className="text-white group-hover:text-accent transition-colors">RUN</span>
                                <span className="text-accent group-hover:text-white transition-colors">ION</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm text-center md:text-left leading-relaxed">
                            {t('tagline') || 'Your premier running events platform'}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                            {t('quickLinks') || 'Gyorslinkek'}
                        </h3>
                        <nav className="flex flex-col gap-2 text-sm">
                            <Link href="/races" className="text-gray-400 hover:text-accent transition-colors hover:translate-x-1 transform duration-200">
                                {t('races') || 'Versenyek'}
                            </Link>
                            <Link href="/boutique" className="text-gray-400 hover:text-accent transition-colors hover:translate-x-1 transform duration-200">
                                {t('boutique') || 'Webshop'}
                            </Link>
                            <Link href="/about" className="text-gray-400 hover:text-accent transition-colors hover:translate-x-1 transform duration-200">
                                {t('about') || 'Rólunk'}
                            </Link>
                            <Link href="/contact" className="text-gray-400 hover:text-accent transition-colors hover:translate-x-1 transform duration-200">
                                {t('contact') || 'Kapcsolat'}
                            </Link>
                        </nav>
                    </div>

                    {/* Legal */}
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                            {t('legal') || 'Jogi'}
                        </h3>
                        <nav className="flex flex-col gap-2 text-sm">
                            <Link href="/privacy" className="text-gray-400 hover:text-accent transition-colors hover:translate-x-1 transform duration-200">
                                {t('privacy') || 'Adatvédelem'}
                            </Link>
                            <Link href="/terms" className="text-gray-400 hover:text-accent transition-colors hover:translate-x-1 transform duration-200">
                                {t('terms') || 'ÁSZF'}
                            </Link>
                        </nav>
                    </div>

                    {/* Social */}
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                            {t('connect') || 'Kövess minket'}
                        </h3>

                        {/* Social Icons - Facebook & Instagram */}
                        <div className="flex gap-3">
                            {/* Facebook */}
                            <a
                                href="https://www.facebook.com/runion2021"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative"
                                aria-label="Facebook"
                            >
                                <div className="absolute inset-0 bg-accent/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-accent hover:border-accent/50 transition-all group-hover:scale-110">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </div>
                            </a>

                            {/* Instagram */}
                            <a
                                href="https://www.instagram.com/runion_hungary"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative"
                                aria-label="Instagram"
                            >
                                <div className="absolute inset-0 bg-accent/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-accent hover:border-accent/50 transition-all group-hover:scale-110">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar - 4 Sections (Smaller) */}
                <div className="border-t border-white/5 py-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-4 md:gap-3 items-center text-xs">

                        {/* 1. Copyright */}
                        <div className="flex items-center justify-center md:justify-start gap-1.5 text-gray-500 order-1">
                            <span
                                onClick={handleSecretClick}
                                className="cursor-default hover:text-accent transition-colors"
                            >
                                ©
                            </span>
                            <span className="text-[11px]">{new Date().getFullYear()} Runion.</span>
                            <span className="hidden lg:inline text-[11px]">{t('rights')}</span>
                        </div>

                        {/* 2. Security Level */}
                        <div className="flex justify-center md:justify-start order-2 sm:order-3 md:order-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
                                <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span className="text-[10px] font-semibold text-blue-400 tracking-wider uppercase">
                                    SSL Secured
                                </span>
                            </div>
                        </div>

                        {/* 3. Powered By Sinx */}
                        <div className="flex justify-center order-3 sm:order-4 md:order-3">
                            <a
                                href="https://sinxstudio.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 border border-white/5 hover:border-accent/50 hover:bg-white/10 transition-all"
                            >
                                <span className="text-gray-400 group-hover:text-accent transition-colors text-[10px] font-medium">
                                    Powered by
                                </span>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/sinx-logo.png"
                                    alt="Sinx Software Studio"
                                    className="h-4 w-auto opacity-70 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                                />
                            </a>
                        </div>

                        {/* 4. System Status */}
                        <div className="flex justify-center md:justify-end order-4 sm:order-2 md:order-4">
                            <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-500/20 backdrop-blur-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-lg shadow-emerald-400/50"></span>
                                </span>
                                <span className="text-[10px] font-semibold text-emerald-400 tracking-wider uppercase">
                                    System Online
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Bottom Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
        </footer>
    );
}
