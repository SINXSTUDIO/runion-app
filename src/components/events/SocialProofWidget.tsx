'use client';

import { motion } from 'framer-motion';
import { Users, TrendingUp, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';

interface SocialProofWidgetProps {
    eventId: string;
    totalRegistrations: number;
    distanceCounts: Array<{
        id: string;
        name: string;
        count: number;
    }>;
}

export function SocialProofWidget({ eventId, totalRegistrations, distanceCounts }: SocialProofWidgetProps) {
    const t = useTranslations('EventDetails.socialProof');
    const [count, setCount] = useState(0);

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

            {/* Distance Breakdown */}
            {distanceCounts && distanceCounts.length > 0 && (
                <div className="border-t border-accent/10 pt-4 space-y-3">
                    <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wide font-bold flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Nevezések távonként
                    </p>

                    <div className="space-y-2">
                        {distanceCounts.map((dist) => (
                            dist.count > 0 && (
                                <div key={dist.id} className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-300 font-medium">{dist.name}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-16 bg-zinc-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-accent"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min((dist.count / totalRegistrations) * 100, 100)}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                            />
                                        </div>
                                        <span className="text-white font-bold min-w-[2rem] text-right">{dist.count}</span>
                                    </div>
                                </div>
                            )
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
