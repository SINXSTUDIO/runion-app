"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const handleSwitch = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale });
    };

    return (
        <div className="flex gap-2">
            {['hu', 'en', 'de'].map((l) => (
                <button
                    key={l}
                    onClick={() => handleSwitch(l)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all border ${locale === l
                        ? 'bg-accent text-black border-accent'
                        : 'bg-zinc-900 text-zinc-400 border-accent/30 hover:border-accent/70 hover:text-white'
                        }`}
                >
                    {l.toUpperCase()}
                </button>
            ))}
        </div>
    );
}
