'use client';

import { motion } from 'framer-motion';
import { Users, TrendingUp, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';

interface SocialProofWidgetProps {
    eventId: string;
    totalRegistrations: number;
    recentRegistrations?: Array<{
        name: string;
        distanceName: string;
        createdAt: Date;
    }>;
}

export function SocialProofWidget({ eventId, totalRegistrations, recentRegistrations = [] }: SocialProofWidgetProps) {
    const t = useTranslations('EventDetails.socialProof');
    const format = useFormatter();
    const [count, setCount] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Animated counter
    useEffect(() => {
        const duration = 2000; // 2 seconds  
        const steps = 60;
        const increment = totalRegistrations / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= totalRegistrations) {
                setCount(totalRegistrations);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [totalRegistrations]);

    // Ticker animation for recent registrations
    useEffect(() => {
        if (recentRegistrations.length === 0) return;

        const ticker = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % recentRegistrations.length);
        }, 4000); // Change every 4 seconds

        return () => clearInterval(ticker);
    }, [recentRegistrations.length]);

    return (
        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 backdrop-blur-sm">
            {/* Main Counter */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                        <motion.div
                            className="text-3xl font-black text-white font-mono"
                            key={count}
                            initial={{ scale: 1.2, color: '#00f2fe' }}
                            animate={{ scale: 1, color: '#ffffff' }}
                            transition={{ duration: 0.3 }}
                        >
                            {count}+
                        </motion.div>
                        <p className="text-sm text-zinc-400">
                            {t('totalRegistrations', { count: count })}
                        </p>
                    </div>
                </div>

                <TrendingUp className="w-8 h-8 text-green-500 animate-pulse" />
            </div>

            {/* Recent Registrations Ticker */}
            {recentRegistrations.length > 0 && (
                <div className="border-t border-accent/10 pt-4">
                    <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wide font-bold flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {t('recentActivity')}
                    </p>

                    <div className="relative h-12 overflow-hidden">
                        {recentRegistrations.map((reg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{
                                    opacity: currentIndex === index ? 1 : 0,
                                    y: currentIndex === index ? 0 : 20
                                }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0 flex items-center gap-2"
                            >
                                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                <p className="text-sm text-zinc-300">
                                    <span className="font-bold text-white">{reg.name}</span>
                                    {' '}
                                    {t('registeredFor')}
                                    {' '}
                                    <span className="text-accent">{reg.distanceName}</span>
                                </p>
                                <span className="ml-auto text-xs text-zinc-500">
                                    {format.relativeTime(new Date(reg.createdAt))}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Trust Badge */}
            <div className="mt-4 pt-4 border-t border-accent/10">
                <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-[8px] text-white font-bold">✓</span>
                    </div>
                    <span>{t('verified')}</span>
                </div>
            </div>
        </div>
    );
}
