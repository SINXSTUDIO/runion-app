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
                rounded-xl p-4
                backdrop-blur-sm
                hover:scale-105 hover:shadow-xl hover:shadow-${doc.color}-500/10
                transition-all duration-300
                cursor-pointer
                animate-in slide-in-from-bottom-4 fade-in
                flex items-center gap-4
            `}
            onClick={() => window.open(doc.url, '_blank')}
        >
            {/* Document Icon - Compact */}
            <div className={`w-10 h-10 bg-gradient-to-br from-${doc.color}-500 to-${doc.color}-600 rounded-lg flex items-center justify-center shrink-0`}>
                <FileText className="w-5 h-5 text-white" />
            </div>

            {/* Document Info - Compact */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                    <h3 className={`text-base font-bold text-${doc.color}-400 truncate pr-2`}>
                        {doc.type}
                    </h3>
                    <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                        {doc.generatedAt
                            ? new Date(doc.generatedAt).toLocaleDateString(locale)
                            : t('noDate')
                        }
                    </span>
                </div>

                <p className="text-xs text-white font-medium truncate mb-0.5">{doc.eventTitle}</p>
                <p className="text-[10px] text-zinc-500 font-mono truncate">{doc.number || 'N/A'}</p>
            </div>

            <div className="shrink-0">
                <Download className="w-4 h-4 text-zinc-600" />
            </div>
        </div>
    );
}
