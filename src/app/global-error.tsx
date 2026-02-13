'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="hu">
            <body className="bg-black text-white">
                <div className="min-h-screen flex items-center justify-center px-4">
                    <div className="max-w-md w-full text-center">
                        <h1 className="text-4xl font-bold mb-4 text-[#00f2fe]">Kritikus Hiba</h1>
                        <p className="mb-6 text-zinc-300">
                            Az alkalmazás kritikus hibába ütközött. Kérjük, frissítsd az oldalt!
                        </p>
                        <button
                            onClick={() => reset()}
                            className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 px-6 rounded-lg transition-colors"
                        >
                            Újratöltés
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
