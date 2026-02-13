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

                {process.env.NODE_ENV === 'development' && (
                    <details className="mb-8 text-left bg-zinc-900 p-4 rounded-lg">
                        <summary className="cursor-pointer text-sm font-mono text-red-400 mb-2">
                            Fejlesztői infó
                        </summary>
                        <pre className="text-xs overflow-auto text-zinc-300">
                            {error.message}
                            {'\n'}
                            {error.stack}
                        </pre>
                    </details>
                )}

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
