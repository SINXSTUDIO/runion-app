'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { verifyEmail, sendVerificationCode } from '@/actions/auth';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { KeyRound, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string || 'hu';

    // Auth translations are currently in 'Auth.Register', but let's use what we need
    // or provide fallback strings.

    const emailParam = searchParams.get('email') || '';
    const codeParam = searchParams.get('code') || '';

    const [email, setEmail] = useState(emailParam);
    const [code, setCode] = useState(codeParam);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        // Auto-verify if both params are present
        if (emailParam && codeParam && status === 'idle') {
            handleVerify(emailParam, codeParam);
        }
    }, [emailParam, codeParam]);

    const handleVerify = async (verifyEmailAddr: string, verifyCode: string) => {
        if (!verifyEmailAddr || !verifyCode) {
            setStatus('error');
            setErrorMessage('Kérlek add meg az email címedet és a kódot.');
            return;
        }

        setStatus('loading');
        setErrorMessage('');

        try {
            const result = await verifyEmail(verifyEmailAddr, verifyCode);
            if (result.success) {
                setStatus('success');
            } else {
                setStatus('error');
                setErrorMessage(result.error || 'Hiba történt az ellenőrzés során.');
            }
        } catch (e) {
            setStatus('error');
            setErrorMessage('Hálózati vagy szerver hiba történt.');
        }
    };

    const handleResend = async () => {
        if (!email) {
            setErrorMessage('Kérlek add meg az email címedet az újraküldéshez.');
            return;
        }

        setStatus('loading');
        try {
            const res = await sendVerificationCode(email);
            if (res.success) {
                setStatus('idle');
                alert('Új megerősítő link elküldve az email címedre!');
            } else {
                setStatus('error');
                setErrorMessage(res.error || 'Nem sikerült elküldeni az emailt.');
            }
        } catch (e) {
            setStatus('error');
            setErrorMessage('Hiba történt a küldés során.');
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 z-10 shadow-2xl relative">

                <div className="flex justify-center mb-8">
                    <Link href={`/${locale}`}>
                        <Image
                            src="/logo.png"
                            alt="RUNION"
                            width={100}
                            height={40}
                            className="object-contain"
                            priority
                        />
                    </Link>
                </div>

                {status === 'loading' && (
                    <div className="text-center space-y-4 animate-in fade-in duration-300">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-2">
                            <RefreshCw className="w-8 h-8 text-accent animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Hitelesítés folyamatban...</h2>
                        <p className="text-zinc-400">Kérlek várj, amíg ellenőrizzük a fiókodat.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-2 ring-4 ring-green-500/20">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Sikeres Aktiválás!</h2>
                        <p className="text-zinc-400">
                            A fiókodat sikeresen hitelesítettük. Most már be tudsz jelentkezni.
                        </p>
                        <Button
                            className="w-full h-12 bg-accent text-black font-bold hover:bg-accent/90"
                            onClick={() => router.push(`/${locale}/login`)}
                        >
                            Tovább a Bejelentkezéshez
                        </Button>
                    </div>
                )}

                {(status === 'idle' || status === 'error') && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800 mb-2">
                                <KeyRound className="w-8 h-8 text-zinc-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Fiók Hitelesítése</h2>
                            <p className="text-zinc-400 text-sm">
                                Kérlek add meg a kódot, amit emailben kaptál.
                            </p>
                        </div>

                        {status === 'error' && errorMessage && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-red-400 text-sm items-start">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p>{errorMessage}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email cím</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                                    placeholder="pelda@email.hu"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Hitelesítő Kód</label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all text-center tracking-[0.5em] font-mono text-lg"
                                    placeholder="000000"
                                    maxLength={6}
                                />
                            </div>

                            <Button
                                onClick={() => handleVerify(email, code)}
                                disabled={!email || code.length < 6}
                                className="w-full h-12 bg-accent text-black font-bold hover:bg-accent/90"
                            >
                                Hitelesítés
                            </Button>

                            <div className="text-center pt-4 border-t border-zinc-800 mt-6">
                                <button
                                    onClick={handleResend}
                                    className="text-zinc-500 hover:text-white text-sm transition-colors"
                                >
                                    Nem kaptad meg a kódot? <span className="underline decoration-dashed">Újraküldés</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Wrapping in Suspense because we use useSearchParams
export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-accent animate-spin" />
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}
