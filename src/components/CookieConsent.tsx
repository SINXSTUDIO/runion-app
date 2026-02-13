'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from './ui/Button';
import { Cookie, X } from 'lucide-react';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);
    const t = useTranslations('CookieConsent');

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-[100] animate-in fade-in slide-in-from-bottom-10 duration-500">
            <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                {/* Decorative pulse background */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-all duration-700" />

                <div className="flex gap-4 relative z-10">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                        <Cookie className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-white tracking-tight">{t('title')}</h3>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed mb-6">
                            {t('description')}
                            <Link href="/privacy" className="text-accent hover:underline ml-1 font-medium italic">
                                {t('policy')}
                            </Link>
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={handleAccept}
                                className="flex-1 bg-accent hover:bg-accent-hover text-black font-bold uppercase tracking-wider text-xs py-3"
                            >
                                {t('accept')}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleDecline}
                                className="flex-1 border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-bold uppercase tracking-wider text-xs py-3"
                            >
                                {t('decline')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
