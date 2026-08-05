'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    // Pass through Next.js internal redirects and not found errors without triggering Error Boundary UI
    if (
        error?.digest?.startsWith('NEXT_REDIRECT') ||
        error?.digest?.startsWith('NEXT_NOT_FOUND') ||
        error?.message?.includes('NEXT_REDIRECT') ||
        error?.message?.includes('NEXT_NOT_FOUND')
    ) {
        return null;
    }

    useEffect(() => {
        // Log to error reporting service (Sentry, etc.)
        console.error('[Global Error Boundary]', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <h1 className="text-4xl font-bold mb-4 text-accent">Hoppá! Valami hiba történt</h1>
                <p className="text-zinc-400 mb-8">
                    Sajnáljuk, de valami váratlan probléma lépett fel. Próbáld újra!
                </p>

                <div className="mb-8 text-left bg-zinc-900/90 border border-red-500/30 p-4 rounded-xl max-w-lg mx-auto">
                    <p className="text-xs font-mono text-red-400 font-bold mb-2">
                        HIBA RÉSZLETEI:
                    </p>
                    <pre className="text-xs overflow-auto text-zinc-300 font-mono whitespace-pre-wrap max-h-48">
                        {error?.message || 'Ismeretlen szerveroldali hiba'}
                        {'\n'}
                        {error?.digest ? `Digest: ${error.digest}` : ''}
                        {'\n'}
                        {error?.stack || ''}
                    </pre>
                </div>

                <Button onClick={() => reset()} className="mb-4">
                    Újrapróbálkozás
                </Button>

                <a href="/" className="text-accent hover:underline block">
                    Vissza a főoldalra
                </a>
            </div>
        </div>
    );
}
