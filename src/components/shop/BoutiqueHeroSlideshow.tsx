"use client";

import { useEffect, useState } from "react";

const IMAGES = [
    '/images/brutal-runner.png',
    '/images/maintenance-bg-cheer.png',
    '/images/maintenance-bg.png'
];

export default function BoutiqueHeroSlideshow() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % IMAGES.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-zinc-950 z-10" />
            <div className="absolute inset-0 bg-black/20 z-10 backdrop-blur-[1px]" />
            {IMAGES.map((src, index) => (
                <div
                    key={src}
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <div
                        className={`w-full h-full bg-cover bg-center animate-ken-burns`}
                        style={{ backgroundImage: `url('${src}')` }}
                    />
                </div>
            ))}
        </div>
    );
}
