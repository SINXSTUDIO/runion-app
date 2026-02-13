'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import Image from 'next/image';

export default function ComingSoon() {
    const router = useRouter();
    const [clickCount, setClickCount] = useState(0);

    // Secret entry logic
    useEffect(() => {
        if (clickCount >= 3) {
            // Secret gesture detected
            router.push('/secretroom75');
            setClickCount(0);
        }

        // Reset click count after 1 second of inactivity
        const timer = setTimeout(() => {
            if (clickCount > 0) setClickCount(0);
        }, 1000);

        return () => clearTimeout(timer);
    }, [clickCount, router]);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-black text-white flex flex-col font-sans">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/maintenance-bg-cheer.png"
                    alt="Coming Soon Background"
                    fill
                    className="object-cover opacity-80"
                    priority
                    quality={100}
                />
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-grow flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in duration-1000">
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black font-heading tracking-tighter italic mb-2 select-none">
                    <span className="text-white drop-shadow-lg">RUN</span>
                    <span className="text-blue-600 drop-shadow-[0_0_15px_rgba(37,99,235,0.8)]">ION</span>
                </h1>

                <div className="h-1 w-32 bg-blue-600 rounded-full mb-8 shadow-[0_0_10px_#2563eb]" />

                <h2 className="text-3xl md:text-5xl font-bold tracking-widest uppercase mb-6 text-gray-100 drop-shadow-md">
                    Hamarosan Érkezünk
                </h2>

                <p className="text-lg md:text-xl text-gray-300 max-w-2xl font-light leading-relaxed">
                    Az oldal jelenleg karbantartás alatt áll. <br className="hidden md:block" />
                    Gőzerővel dolgozunk, hogy a lehető legjobb élményt nyújthassuk.
                </p>

                {/* Optional: Newsletter or Status Indicator could go here */}
            </div>

            {/* Minimal Footer */}
            <footer className="relative z-10 w-full p-6 text-center">
                <p className="text-xs md:text-sm text-gray-500/80 font-medium tracking-wide">
                    <span
                        onClick={(e) => {
                            e.preventDefault();
                            setClickCount(prev => prev + 1);
                        }}
                        className="cursor-default hover:text-white transition-colors duration-300 select-none px-1"
                        title="Copyright"
                    >
                        &copy;
                    </span>
                    {new Date().getFullYear()} Runion. Minden jog fenntartva.
                </p>
            </footer>
        </div>
    );
}
