"use client";

import { useState, useEffect } from "react";
import { differenceInSeconds } from "date-fns";

export default function Countdown({ targetDate }: { targetDate: Date }) {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const diff = differenceInSeconds(new Date(targetDate), new Date());
            setTimeLeft(diff > 0 ? diff : 0);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    const days = Math.floor(timeLeft / (3600 * 24));
    const hours = Math.floor((timeLeft % (3600 * 24)) / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    if (timeLeft <= 0) return null;

    return (
        <div className="flex justify-center gap-4 text-center font-mono my-8">
            <TimeUnit value={days} label="NAP" />
            <div className="text-4xl font-bold text-accent">:</div>
            <TimeUnit value={hours} label="ÓRA" />
            <div className="text-4xl font-bold text-accent">:</div>
            <TimeUnit value={minutes} label="PERC" />
            <div className="text-4xl font-bold text-accent">:</div>
            <TimeUnit value={seconds} label="MP" />
        </div>
    );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="text-4xl md:text-6xl font-black text-white bg-zinc-900 border border-zinc-800 rounded-lg p-4 min-w-[80px] md:min-w-[100px] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                {String(value).padStart(2, '0')}
            </div>
            <span className="text-xs md:text-sm text-accent mt-2 font-bold tracking-widest">{label}</span>
        </div>
    );
}
