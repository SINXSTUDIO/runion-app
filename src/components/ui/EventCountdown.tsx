'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface EventCountdownProps {
    targetDate: string | Date;
    eventTitle: string;
}

export default function EventCountdown({ targetDate, eventTitle }: EventCountdownProps) {
    const t = useTranslations('HomePage.countdown');
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();
            let timeLeft: TimeLeft | null = null;

            if (difference > 0) {
                timeLeft = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return timeLeft;
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);
            if (!newTimeLeft) {
                clearInterval(timer);
                window.location.reload(); // Reload to fetch the next event
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft) return null;

    return (
        <div className="mt-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
            <div className="text-accent/80 text-[10px] md:text-sm font-black tracking-[0.3em] uppercase mb-6 drop-shadow-lg">
                <span className="text-white/40 mr-2">{t('nextEvent')}</span> {eventTitle}
            </div>

            <div className="flex gap-3 md:gap-6 justify-center">
                <TimeBox value={timeLeft.days} label={t('days')} />
                <div className="text-4xl md:text-6xl font-black text-accent/30 self-center hidden md:block">:</div>
                <TimeBox value={timeLeft.hours} label={t('hours')} />
                <div className="text-4xl md:text-6xl font-black text-accent/30 self-center hidden md:block">:</div>
                <TimeBox value={timeLeft.minutes} label={t('minutes')} />
                <div className="text-4xl md:text-6xl font-black text-accent/30 self-center hidden md:block">:</div>
                <TimeBox value={timeLeft.seconds} label={t('seconds')} />
            </div>
        </div>
    );
}

function TimeBox({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center group">
            <div className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-2xl w-20 h-24 md:w-28 md:h-32 flex items-center justify-center mb-3 group-hover:border-accent/40 group-hover:bg-accent/5 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
                <div className="text-4xl md:text-6xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    {value.toString().padStart(2, '0')}
                </div>
            </div>
            <div className="text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-500 group-hover:text-accent transition-colors duration-500">
                {label}
            </div>
        </div>
    );
}
