'use client';

import { FileText, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DocumentCardProps {
    doc: {
        id: string;
        type: string;
        number: string | null;
        url: string;
        generatedAt: Date | string | null;
        eventTitle: string;
        color: string;
    };
    locale: string;
}

export default function DocumentCard({ doc, locale }: DocumentCardProps) {
    const t = useTranslations('Dashboard.Documents');

    return (
        <div
            className={`
                bg-gradient-to-br from-${doc.color}-500/10 to-${doc.color}-600/5
                border border-${doc.color}-500/20
                rounded-2xl p-6
                backdrop-blur-sm
                hover:scale-105 hover:shadow-2xl hover:shadow-${doc.color}-500/10
                transition-all duration-300
                cursor-pointer
                animate-in slide-in-from-bottom-4 fade-in
            `}
            onClick={() => window.open(doc.url, '_blank')}
        >
            {/* Document Icon */}
            <div className={`w-12 h-12 bg-gradient-to-br from-${doc.color}-500 to-${doc.color}-600 rounded-xl flex items-center justify-center mb-4`}>
                <FileText className="w-6 h-6 text-white" />
            </div>

            {/* Document Info */}
            <h3 className={`text-xl font-bold text-${doc.color}-400 mb-1`}>
                {/* We handle translation in parent or pass translated type, but here we can try dynamic key if passed */}
                {/* For simplicity, we assume doc.type is the key or value. The parent passed localized strings? No, the parent passed keys like 'Nyugta'. 
                   Wait, the parent passed 'Nyugta', 'Számla', 'Díjbekérő' string literals or keys? 
                   In previous code: t.has(`types.${doc.type}`) ? ... 
                   Let's replicate that logic here or pass the translated label.
                   Passing translated label is cleaner. */}
                {doc.type}
            </h3>
            <p className="text-sm text-zinc-500 font-mono mb-3">{doc.number || 'N/A'}</p>

            <div className="border-t border-white/10 pt-3 mb-3">
                <p className="text-xs text-zinc-500 mb-1">{t('eventLabel')}</p>
                <p className="text-sm text-white font-medium line-clamp-2">{doc.eventTitle}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>
                    {doc.generatedAt
                        ? new Date(doc.generatedAt).toLocaleDateString(locale)
                        : t('noDate')
                    }
                </span>
                <Download className="w-4 h-4" />
            </div>
        </div>
    );
}
