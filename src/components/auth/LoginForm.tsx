'use client';

import { useActionState, useState } from 'react';
import { authenticate, sendVerificationCode } from '@/actions/auth';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, AlertTriangle, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export default function LoginForm() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);
    const t = useTranslations('Auth.Login');
    const [resending, setResending] = useState(false);

    // We need to keep track of the email entered to resend code
    const [email, setEmail] = useState('');

    const handleResendVerification = async () => {
        if (!email) return;
        setResending(true);
        try {
            const res = await sendVerificationCode(email);
            if (res.success) {
                toast.success('Új megerősítő link elküldve az email címedre!');
            } else {
                toast.error(res.error || 'Hiba történt a küldés során.');
            }
        } catch (e) {
            toast.error('Hiba történt a küldés során.');
        } finally {
            setResending(false);
        }
    };

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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                {errorMessage === 'UNVERIFIED_EMAIL' ? (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex flex-col gap-3 text-yellow-400 text-sm animate-in fade-in slide-in-from-top-1">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-yellow-500" />
                            <div>
                                <p className="font-bold mb-1">Erősítsd meg az email címed!</p>
                                <p className="text-yellow-500/80 leading-relaxed">
                                    A fiókod még nincs aktiválva. Kérlek kattints a regisztrációkor kapott emailben lévő linkre.
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleResendVerification}
                            disabled={resending || !email}
                            className="mt-2 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10 hover:text-yellow-400 self-start w-fit bg-transparent"
                        >
                            {resending ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-3 h-3 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
                                    Küldés...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 bg-transparent">
                                    <Send className="w-3 h-3" />
                                    Új megerősítő link küldése
                                </span>
                            )}
                        </Button>
                    </div>
                ) : errorMessage && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        {errorMessage}
                    </div>
                )}
            </div>

            <Button
                type="submit"
                className="w-full h-12 text-base font-bold bg-accent text-black hover:bg-accent/90 transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_20px_rgba(0,242,254,0.1)] hover:shadow-[0_0_30px_rgba(0,242,254,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
