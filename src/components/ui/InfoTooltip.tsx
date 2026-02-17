'use client';

import { Info } from 'lucide-react';
import { useState } from 'react';

interface InfoTooltipProps {
    text: string;
    className?: string;
}

export const InfoTooltip = ({ text, className }: InfoTooltipProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className={`relative inline-flex items-center ${className}`}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            onClick={() => setIsOpen(!isOpen)}
        >
            <Info className={`w-4 h-4 text-zinc-500 hover:text-accent cursor-help transition-colors ${isOpen ? 'text-accent' : ''}`} />

            {/* Tooltip Content */}
            <div className={`
                absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 
                bg-zinc-900/95 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl 
                transition-all duration-200 z-50 pointer-events-none
                ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}
            `}>
                <p className="text-xs text-zinc-300 text-center leading-relaxed font-medium">
                    {text}
                </p>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900/95" />
            </div>
        </div>
    );
};
