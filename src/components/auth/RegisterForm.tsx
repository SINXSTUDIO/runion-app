'use client';

import { useActionState } from 'react';
import { register } from '@/actions/auth';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { User, Mail, Lock, Check, Send } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function RegisterForm() {
    const [state, dispatch, isPending] = useActionState(register, { success: false });
    const t = useTranslations('Auth.Register');
    const [isReady, setIsReady] = useState(false);

    const params = useParams();
    const locale = params.locale as string || 'hu';

    useEffect(() => {
        // Simple time-trap: enable submit after 1.5 seconds
        const timer = setTimeout(() => setIsReady(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    if (state?.requiresVerification && state.email) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-2">
                        <Send className="w-8 h-8 text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Sikeres Regisztráció!</h2>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Elküldtünk egy megerősítő linket a(z) <span className="text-accent font-medium">{state.email}</span> címre.
                    </p>
                    <p className="text-zinc-400 text-sm">
                        Kérlek, nyisd meg az levélt és kattints a <strong>"Fiók aktiválása"</strong> gombra a regisztráció befejezéséhez.
                    </p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center mt-8">
                    <p className="text-xs text-zinc-500">
                        Nem találod az emailt? Ellenőrizd a Spam vagy Promóciók mappát is!
                    </p>
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
