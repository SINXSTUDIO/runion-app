'use client';

import { useActionState } from 'react';
import { authenticate } from '@/actions/auth';
import { Button } from '@/components/ui/Button';
import { Mail, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function LoginForm() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);
    const t = useTranslations('Auth.Login');

    return (
        <form action={dispatch} className="space-y-6">
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
                        placeholder="hello@example.com"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider" htmlFor="password">{t('password')}</label>
                </div>
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

            <div className="min-h-[20px]">
                {errorMessage && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        {errorMessage}
                    </div>
                )}
            </div>

            <Button
                type="submit"
                className="w-full h-12 text-base font-bold bg-accent text-black hover:bg-accent/90 transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(0,242,254,0.1)] hover:shadow-[0_0_30px_rgba(0,242,254,0.3)]"
                disabled={isPending}
            >
                {isPending ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        {t('submit')}...
                    </span>
                ) : t('submit')}
            </Button>
        </form>
    );
}
