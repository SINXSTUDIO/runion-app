'use client';

import React, { useState } from 'react';
import { checkUserEmailStatus, authenticate } from '@/actions/auth';
import { Mail, Lock, UserCheck, UserPlus, ArrowRight, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

interface SmartAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    defaultEmail?: string;
}

export function SmartAuthModal({ isOpen, onClose, onSuccess, defaultEmail = '' }: SmartAuthModalProps) {
    const [step, setStep] = useState<'EMAIL' | 'EXISTING_USER' | 'NEW_USER'>('EMAIL');
    const [email, setEmail] = useState(defaultEmail);
    const [loading, setLoading] = useState(false);
    const [userStatus, setUserStatus] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState('');

    if (!isOpen) return null;

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            setErrorMessage('Kérjük adj meg egy érvényes e-mail címet.');
            return;
        }

        setLoading(true);
        setErrorMessage('');

        const status = await checkUserEmailStatus(email);
        setLoading(false);

        if (status.exists) {
            setUserStatus(status);
            setStep('EXISTING_USER');
        } else {
            setStep('NEW_USER');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-md bg-neutral-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl text-white">

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-white text-xl font-bold transition-colors"
                >
                    ✕
                </button>

                {/* Modal Title */}
                <div className="text-center mb-6">
                    <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 rounded-full inline-block mb-2">
                        ⚡ Villámgyors Belépés & Nevezés
                    </span>
                    <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                        {step === 'EMAIL' && 'Adj meg az E-mail címed'}
                        {step === 'EXISTING_USER' && `Üdv újra, ${userStatus?.lastName} ${userStatus?.firstName}! 👋`}
                        {step === 'NEW_USER' && 'Új Futói Regisztráció'}
                    </h2>
                </div>

                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-sm font-medium">
                        {errorMessage}
                    </div>
                )}

                {/* STEP 1: Single Email Input */}
                {step === 'EMAIL' && (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-neutral-300 mb-1">
                                E-mail Címed
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="peldabanos@gmail.com"
                                    className="w-full pl-10 pr-4 py-3 bg-neutral-800/90 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all transform active:scale-98 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Tovább a Nevezéshez <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        <div className="text-center text-xs text-neutral-400 pt-2">
                            🔒 100%-ban biztonságos és védett adatkezelés.
                        </div>
                    </form>
                )}

                {/* STEP 2A: Existing User Recognized */}
                {step === 'EXISTING_USER' && (
                    <div className="space-y-4">
                        <div className="p-3.5 bg-cyan-950/40 border border-cyan-500/30 rounded-xl flex items-start gap-3 text-sm">
                            <UserCheck className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
                            <div>
                                <span className="font-semibold text-cyan-300">A Fiókod már létezik!</span>
                                <p className="text-neutral-300 text-xs mt-1">
                                    Az összes korábbi adatod (pólóméret, lakcím, számlázási adatok) be van töltve.
                                </p>
                            </div>
                        </div>

                        <form action={async (formData) => {
                            setLoading(true);
                            setErrorMessage('');
                            try {
                                const res = await authenticate(undefined, formData);
                                if (res === 'UNVERIFIED_EMAIL') {
                                    setErrorMessage('Erősítsd meg az e-mail címed a belépéshez!');
                                } else if (typeof res === 'string') {
                                    setErrorMessage(res);
                                } else {
                                    if (onSuccess) onSuccess();
                                    onClose();
                                }
                            } catch (e) {
                                // Redirect happens on success
                            } finally {
                                setLoading(false);
                            }
                        }}>
                            <input type="hidden" name="email" value={email} />

                            <div className="mb-4">
                                <label className="block text-xs font-medium text-neutral-300 mb-1">
                                    Jelszavad
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-3 bg-neutral-800/90 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 transition-colors"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 px-4 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-400/20 transition-all active:scale-98 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Belépés & Kitöltés Beemelése ➔'}
                            </button>
                        </form>

                        <button
                            onClick={() => setStep('EMAIL')}
                            className="w-full text-center text-xs text-neutral-400 hover:text-white transition-colors"
                        >
                            ← Másik e-mail cím megadása
                        </button>
                    </div>
                )}

                {/* STEP 2B: New User Single Step */}
                {step === 'NEW_USER' && (
                    <div className="space-y-4">
                        <div className="p-3.5 bg-blue-950/40 border border-blue-500/30 rounded-xl flex items-start gap-3 text-sm">
                            <UserPlus className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <span className="font-semibold text-blue-300">Új futóként köszöntünk!</span>
                                <p className="text-neutral-300 text-xs mt-1">
                                    Egyetlen lépésben elkészítjük a RUNION fiókokat és elmentjük a nevezésed.
                                </p>
                            </div>
                        </div>

                        <a
                            href={`/register?email=${encodeURIComponent(email)}`}
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 text-center shadow-lg transition-all"
                        >
                            Gyors Profil Kitöltése (1 Perc) ➔
                        </a>

                        <button
                            onClick={() => setStep('EMAIL')}
                            className="w-full text-center text-xs text-neutral-400 hover:text-white transition-colors"
                        >
                            ← Másik e-mail cím megadása
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
