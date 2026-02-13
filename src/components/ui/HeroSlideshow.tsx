"use client";

import { useEffect, useState } from "react";

const IMAGES = [
    '/hero-bg-1.png',
    '/hero-bg-2.png'
];

export default function HeroSlideshow() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % IMAGES.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10" />
            {IMAGES.map((src, index) => (
                <div
                    key={src}
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? "opacity-60" : "opacity-0"
                        }`}
                >
                    <div
                        className={`w-full h-full bg-cover bg-center bg-fixed animate-ken-burns`}
                        style={{ backgroundImage: `url('${src}')` }}
                    />
                </div>
            ))}
        </div>
    );
}
