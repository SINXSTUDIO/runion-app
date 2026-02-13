'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import { Timer } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SessionTimerProps {
    timeoutMs?: number; // Default: 10 minutes (600000ms)
    warningThresholdMs?: number; // Default: 1 minute (60000ms)
}

export default function SessionTimer({
    timeoutMs = 10 * 60 * 1000,
    warningThresholdMs = 60 * 1000
}: SessionTimerProps) {
    const t = useTranslations('Auth'); // Assuming we have auth translations, or use fallback
    const [timeLeft, setTimeLeft] = useState(timeoutMs);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const lastActivityRef = useRef<number>(Date.now());

    const logout = useCallback(async () => {
        try {
            await signOut({ callbackUrl: '/' });
        } catch (error) {
            console.error('Auto logout failed:', error);
            window.location.href = '/';
        }
    }, []);

    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
        setTimeLeft(timeoutMs);
    }, [timeoutMs]);

    // Setup activity listeners
    useEffect(() => {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

        const handleActivity = () => {
            // Only reset if significant time passed to avoid too many state updates? 
            // Actually, we just update the ref, state update is in the interval.
            // But here we want the visible timer to jump back to full immediately on activity.
            resetTimer();
        };

        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [resetTimer]);

    // Countdown interval
    useEffect(() => {
        timerRef.current = setInterval(() => {
            const now = Date.now();
            const timeSinceLastActivity = now - lastActivityRef.current;
            const newTimeLeft = Math.max(0, timeoutMs - timeSinceLastActivity);

            setTimeLeft(newTimeLeft);

            if (newTimeLeft <= 0) {
                if (timerRef.current) clearInterval(timerRef.current);
                logout();
            }
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timeoutMs, logout]);

    // Format time mm:ss
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const isWarning = timeLeft < warningThresholdMs;

    return (
        <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-colors duration-300 ${isWarning
                    ? 'bg-red-500/10 border-red-500/50 text-red-500 animate-pulse'
                    : 'bg-zinc-800/50 border-white/10 text-zinc-400'
                }`}
            title="Hátralévő idő kijelentkezésig"
        >
            <Timer className="w-3.5 h-3.5" />
            <span>{formattedTime}</span>
        </div>
    );
}
