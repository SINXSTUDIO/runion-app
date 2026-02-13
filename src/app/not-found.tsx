'use client';

import { useEffect, useState } from 'react';

// Global Not Found must define html/body because we don't have a Root Layout (it's in [locale])
export default function NotFound() {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        // Auto redirect to home after 5 seconds
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    window.location.href = '/hu';
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <html lang="hu">
            <head>
                <title>404 - Oldal nem található | Runion</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </head>
            <body className="bg-black text-white">
                <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
                    {/* Dynamic Background */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-cyan-500/5 rounded-full blur-[150px]" />
                        <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-blue-600/5 rounded-full blur-[150px]" />
                    </div>

                    <div className="relative z-10 text-center max-w-2xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-[12rem] md:text-[18rem] font-black text-zinc-900 leading-none select-none">
                                404
                            </h1>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                            Az oldal nem található
                        </h2>

                        <p className="text-xl text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
                            A keresett oldal nem létezik vagy eltávolításra került.
                            {countdown > 0 && (
                                <><br />Átirányítás {countdown} másodperc múlva...</>
                            )}
                        </p>

                        <a
                            href="/hu"
                            className="inline-flex items-center justify-center h-14 px-8 text-lg font-bold rounded-full bg-cyan-500 text-black hover:bg-cyan-400 transition-colors"
                        >
                            Vissza a főoldalra
                        </a>
                    </div>
                </div>
            </body>
        </html>
    );
}
