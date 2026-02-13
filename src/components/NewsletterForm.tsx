"use client";

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useActionState, useEffect, useState } from 'react';
import { subscribeNewsletter } from '@/actions/newsletter';

export default function NewsletterForm() {
    const t = useTranslations('HomePage');
    const [state, action, isPending] = useActionState(subscribeNewsletter, null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (state?.success) {
            setShowSuccess(true);
            const timer = setTimeout(() => {
                setShowSuccess(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [state?.success]);

    return (
        <div className="relative bg-gradient-to-br from-zinc-900 to-black p-12 md:p-20 rounded-[3rem] border border-zinc-800 overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/10 rounded-full blur-[100px] group-hover:bg-accent/20 transition-colors duration-700" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] group-hover:bg-blue-500/20 transition-colors duration-700" />

            <div className="relative z-10 max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl mb-8 border border-accent/20">
                    <Mail className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-6 font-heading text-white">{t('newsletterTitle')}</h2>
                <p className="text-xl text-zinc-400 mb-10">{t('newsletterSubtitle')}</p>

                {showSuccess ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-8 animate-in zoom-in duration-300">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">{t('newsletterSuccessTitle')}</h3>
                        <p className="text-zinc-400">{t('newsletterSuccessDesc')}</p>
                    </div>
                ) : (
                    <form action={action} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="last-name"
                                required
                                placeholder={t('newsletterLastName')}
                                className="bg-black/50 border border-zinc-700 rounded-full px-8 py-4 text-white focus:outline-none focus:border-accent transition-colors"
                            />
                            <input
                                type="text"
                                name="first-name"
                                required
                                placeholder={t('newsletterFirstName')}
                                className="bg-black/50 border border-zinc-700 rounded-full px-8 py-4 text-white focus:outline-none focus:border-accent transition-colors"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder={t('newsletterPlaceholder')}
                                className="flex-grow bg-black/50 border border-zinc-700 rounded-full px-8 py-4 text-white focus:outline-none focus:border-accent transition-colors"
                            />
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="rounded-full px-10 py-4 font-bold text-lg bg-accent hover:bg-accent-hover text-black transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)] disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
                            >
                                {isPending ? (
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                ) : (
                                    t('newsletterCTA')
                                )}
                            </Button>
                        </div>
                        {state?.success === false && (
                            <div className="flex items-center justify-center gap-2 text-red-500 text-sm animate-in fade-in duration-300">
                                <AlertCircle className="w-4 h-4" />
                                <span>{state.message === "Provider error" ? t('newsletterErrorProvider') : state.message}</span>
                            </div>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
}
