'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function MembershipSuccessPage() {
    const t = useTranslations('Dashboard.Membership.Success');

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in zoom-in duration-500 pt-12 text-center">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/5 border border-green-500/20 rounded-3xl p-12 backdrop-blur-xl">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                </div>

                <h1 className="text-3xl md:text-4xl font-black italic uppercase mb-4 text-white">
                    {t('title')}
                </h1>

                <p className="text-zinc-300 text-lg mb-8 max-w-lg mx-auto">
                    {t('message')}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/dashboard/documents"
                        className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors flex items-center gap-2"
                    >
                        {t('documents')} <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/dashboard"
                        className="px-8 py-3 bg-white/5 text-zinc-400 font-bold rounded-xl hover:bg-white/10 hover:text-white transition-colors"
                    >
                        {t('dashboard')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
