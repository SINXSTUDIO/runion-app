'use client';

import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

interface CountdownTimerProps {
    targetDate: Date;
    locale?: string;
}

export function CountdownTimer({ targetDate, locale = 'hu' }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate).getTime() - new Date().getTime();

            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                };
            }
            return null; // Event passed
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft) return null;

    return (
        <div className="flex items-center gap-1.5 bg-accent text-black px-2 py-1 rounded-md text-xs font-bold leading-none shadow-[0_0_10px_rgba(0,242,254,0.3)] animate-pulse">
            <Timer className="w-3 h-3" />
            <span>
                {timeLeft.days > 0 ? `${timeLeft.days} nap ` : ''}
                {timeLeft.hours} óra
                {(timeLeft.days === 0 && timeLeft.minutes > 0) && ` ${timeLeft.minutes} perc`}
            </span>
        </div>
    );
}
