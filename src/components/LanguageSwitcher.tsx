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
                    className={`px-2 py-1 text-sm font-medium rounded transition-colors ${locale === l
                            ? 'bg-white/20 text-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    {l.toUpperCase()}
                </button>
            ))}
        </div>
    );
}
