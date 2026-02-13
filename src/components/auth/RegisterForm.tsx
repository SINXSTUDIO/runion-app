'use client';

import { useActionState } from 'react';
import { register, verifyEmail, sendVerificationCode } from '@/actions/auth';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { User, Mail, Lock, Check, KeyRound } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function RegisterForm() {
    const [state, dispatch, isPending] = useActionState(register, { success: false });
    const t = useTranslations('Auth.Register');
    const [isReady, setIsReady] = useState(false);

    // 2FA State
    const [step, setStep] = useState<'register' | 'verify'>('register');
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [verifyError, setVerifyError] = useState('');
    const [verifySuccess, setVerifySuccess] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string || 'hu';

    useEffect(() => {
        // Simple time-trap: enable submit after 1.5 seconds
        const timer = setTimeout(() => setIsReady(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (state?.requiresVerification && state.email) {
            setEmail(state.email);
            setStep('verify');
        }
    }, [state]);

    const handleVerify = async () => {
        setIsVerifying(true);
        setVerifyError('');
        try {
            const result = await verifyEmail(email, verificationCode);
            if (result.success) {
                setVerifySuccess('Sikeres aktiválás! Átirányítás a bejelentkezéshez...');
                setTimeout(() => {
                    router.push(`/${locale}/login`);
                }, 2000);
            } else {
                setVerifyError(result.error || 'Hiba történt az ellenőrzés során.');
            }
        } catch (e) {
            setVerifyError('Hálózati vagy szerver hiba történt.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        await sendVerificationCode(email);
        alert('Kód újraküldve!');
    };

    if (step === 'verify') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-2">
                        <KeyRound className="w-6 h-6 text-accent" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Email Megerősítése</h2>
                    <p className="text-zinc-400 text-sm">
                        Küldtünk egy 6-jegyű kódot a(z) <span className="text-accent font-medium">{email}</span> címre.
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Megerősítő Kód</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <KeyRound className="h-5 w-5 text-zinc-500 group-focus-within:text-accent transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl leading-5 bg-zinc-900/50 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:bg-zinc-900 focus:border-accent focus:ring-1 focus:ring-accent sm:text-sm h-12 transition-all duration-200 tracking-[0.5em] font-mono text-center"
                            placeholder="000000"
                            maxLength={6}
                        />
                    </div>
                </div>

                <div className="min-h-[20px]">
                    {verifyError && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                            {verifyError}
                        </div>
                    )}
                    {verifySuccess && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-2 text-green-400 text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                            {verifySuccess}
                        </div>
                    )}
                </div>

                <Button
                    onClick={handleVerify}
                    disabled={isVerifying || verificationCode.length < 6}
                    className="w-full h-12 text-base font-bold bg-accent text-black hover:bg-accent/90 transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(0,242,254,0.1)] hover:shadow-[0_0_30px_rgba(0,242,254,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {isVerifying ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            Ellenőrzés...
                        </span>
                    ) : 'Megerősítés'}
                </Button>

                <div className="text-center pt-2">
                    <button type="button" onClick={handleResend} className="text-zinc-500 hover:text-white text-xs transition-colors">
                        Nem kaptad meg a kódot? <span className="underline decoration-dotted">Kód újraküldése</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form action={dispatch} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider" htmlFor="lastName">{t('lastName')}</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-zinc-500 group-focus-within:text-accent transition-colors" />
                        </div>
                        <input
                            className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl leading-5 bg-zinc-900/50 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:bg-zinc-900 focus:border-accent focus:ring-1 focus:ring-accent sm:text-sm h-12 transition-all duration-200"
                            id="lastName"
                            type="text"
                            name="lastName"
                            required
                            placeholder="Kovács"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider" htmlFor="firstName">{t('firstName')}</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-zinc-500 group-focus-within:text-accent transition-colors" />
                        </div>
                        <input
                            className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl leading-5 bg-zinc-900/50 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:bg-zinc-900 focus:border-accent focus:ring-1 focus:ring-accent sm:text-sm h-12 transition-all duration-200"
                            id="firstName"
                            type="text"
                            name="firstName"
                            required
                            placeholder="János"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider" htmlFor="email">{t('email')}</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-zinc-500 group-focus-within:text-accent transition-colors" />
                    </div>
                    <input
                        className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl leading-5 bg-zinc-900/50 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:bg-zinc-900 focus:border-accent focus:ring-1 focus:ring-accent sm:text-sm h-12 transition-all duration-200"
                        id="email"
                        type="email"
                        name="email"
                        required
                        placeholder="janos@pelda.hu"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider" htmlFor="password">{t('password')}</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-accent transition-colors" />
                    </div>
                    <input
                        className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl leading-5 bg-zinc-900/50 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:bg-zinc-900 focus:border-accent focus:ring-1 focus:ring-accent sm:text-sm h-12 transition-all duration-200"
                        id="password"
                        type="password"
                        name="password"
                        required
                        placeholder="••••••••"
                        minLength={6}
                    />
                </div>
            </div>

            {/* Honeypot field - should be empty */}
            <div className="hidden" aria-hidden="true">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                    <input type="checkbox" id="terms" name="terms" required className="peer sr-only" />
                    <div className="w-5 h-5 border border-zinc-700 rounded bg-zinc-900 peer-checked:bg-accent peer-checked:border-accent peer-checked:text-black transition-all flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                </div>
                <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                    {t.rich('terms', {
                        link: (chunks) => <a href="/terms" className="text-accent hover:underline font-medium">{chunks}</a>
                    })}
                </span>
            </label>

            <div className="min-h-[20px]">
                {state?.error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        {state.error}
                    </div>
                )}
            </div>

            <Button
                type="submit"
                className="w-full h-12 text-base font-bold bg-accent text-black hover:bg-accent/90 transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(0,242,254,0.1)] hover:shadow-[0_0_30px_rgba(0,242,254,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={!isReady || isPending}
            >
                {isPending ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        {t('submit')}
                    </span>
                ) : t('submit')}
            </Button>
        </form>
    );
}
