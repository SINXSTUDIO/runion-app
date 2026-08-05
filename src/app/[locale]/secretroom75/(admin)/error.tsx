'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('[Admin Dashboard Error]', error);
    }, [error]);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 flex flex-col items-center justify-center min-h-[50vh]">
            <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] max-w-2xl w-full flex flex-col items-center text-center space-y-6">
                <div className="p-4 bg-red-500/20 rounded-full">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white font-heading tracking-tighter">Hiba történt a felület betöltésekor</h2>
                    <p className="text-zinc-400 text-sm">
                        A szerver oldali renderelés során váratlan hiba lépett fel. 
                        Az alábbi részletek segíthetnek a hiba elhárításában:
                    </p>
                </div>

                <div className="w-full bg-zinc-950/80 rounded-xl p-4 text-left border border-white/5 overflow-auto max-h-48">
                    <p className="text-red-400 font-mono text-sm break-all">
                        <strong>Message:</strong> {error.message || 'Ismeretlen hiba (Internal Server Error)'}
                    </p>
                    {error.digest && (
                        <p className="text-zinc-500 font-mono text-xs mt-2">
                            <strong>Digest:</strong> {error.digest}
                        </p>
                    )}
                </div>

                <Button 
                    onClick={() => reset()}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl px-8 h-12"
                >
                    Újrapróbálkozás (Reset)
                </Button>
            </div>
        </div>
    );
}
