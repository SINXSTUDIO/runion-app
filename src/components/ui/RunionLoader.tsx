"use client";

import { Trophy, Timer, Zap } from 'lucide-react';

interface RunionLoaderProps {
    text?: string;
    fullScreen?: boolean;
}

export default function RunionLoader({ text = "BETÖLTÉS...", fullScreen = true }: RunionLoaderProps) {
    const loaderContent = (
        <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in z-50">
            {/* Animated Logo Container with Neon Glow */}
            <div className="relative mb-8 flex items-center justify-center">
                {/* Outer Pulsing Glow Ring */}
                <div className="absolute w-28 h-28 rounded-full bg-accent/20 animate-ping opacity-75 blur-md" />
                <div className="absolute w-36 h-36 rounded-full border border-accent/30 animate-spin-slow" />
                <div className="absolute w-44 h-44 rounded-full border border-dashed border-white/10 animate-reverse-spin" />

                {/* Inner Glowing Badge */}
                <div className="relative w-20 h-20 rounded-2xl bg-zinc-900 border border-accent/50 flex items-center justify-center shadow-[0_0_30px_rgba(0,242,254,0.3)] group">
                    <Zap className="w-10 h-10 text-accent animate-pulse" />
                </div>
            </div>

            {/* RUNION Brand Title */}
            <div className="text-3xl font-black font-heading tracking-tighter italic mb-3">
                <span className="text-white">RUN</span>
                <span className="text-accent drop-shadow-[0_0_15px_rgba(0,242,254,0.6)]">ION</span>
            </div>

            {/* Animated Loading Bar & Status */}
            <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden mb-4 relative">
                <div className="h-full bg-gradient-to-r from-cyan-400 via-accent to-emerald-400 rounded-full animate-loader-bar" />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 animate-pulse">
                {text}
            </p>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[9999]">
                {loaderContent}
            </div>
        );
    }

    return (
        <div className="min-h-[400px] w-full flex items-center justify-center bg-black/50 backdrop-blur-md rounded-3xl border border-white/5">
            {loaderContent}
        </div>
    );
}
