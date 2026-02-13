"use client";

import { useEffect, useState, useRef } from "react";

type Sponsor = {
    id: string;
    name: string;
    logoUrl: string;
    order: number;
    active: boolean;
};

type SponsorSliderProps = {
    sponsors: Sponsor[];
};

export default function SponsorSlider({ sponsors: initialSponsors }: SponsorSliderProps) {
    const [sponsors] = useState<Sponsor[]>(initialSponsors);
    const [currentIndex, setCurrentIndex] = useState(0);
    const visibleCount = 5;
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const totalCount = sponsors.length;

    // Auto-scroll logic
    useEffect(() => {
        if (totalCount === 0) return;

        startAutoScroll();
        return () => stopAutoScroll();
    }, [totalCount]);

    const startAutoScroll = () => {
        stopAutoScroll();
        if (totalCount === 0) return;

        intervalRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % totalCount);
        }, 3000); // 3 seconds per slide
    };

    const stopAutoScroll = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    // Calculate visible sponsors with seamless wrapping
    const getVisibleSponsors = () => {
        if (totalCount === 0) return [];
        let visible = [];
        for (let i = 0; i < Math.min(visibleCount, totalCount); i++) {
            const index = (currentIndex + i) % totalCount;
            visible.push(sponsors[index]);
        }
        return visible;
    };

    if (totalCount === 0) return null;

    return (
        <div
            className="w-full overflow-hidden"
            onMouseEnter={stopAutoScroll}
            onMouseLeave={startAutoScroll}
        >
            <div className="flex justify-between items-center gap-8">
                {getVisibleSponsors().map((sponsor, idx) => {
                    // Temporary fix for known bad seed data to stop log spam
                    if (sponsor.logoUrl.includes('sponser.png') || sponsor.logoUrl.includes('ilovebalaton.png')) {
                        return null;
                    }

                    return (
                        <div
                            key={sponsor.id}
                            className="flex-1 min-w-[300px] h-48 bg-white rounded-xl flex items-center justify-center p-6 hover:scale-105 transition-transform duration-300 shadow-lg"
                        >
                            <img
                                src={sponsor.logoUrl}
                                alt={sponsor.name}
                                className="max-h-full max-w-full object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.opacity = '0.3';
                                    (e.target as HTMLImageElement).title = 'Kép nem található';
                                }}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
