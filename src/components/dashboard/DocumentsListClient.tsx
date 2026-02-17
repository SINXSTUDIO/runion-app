'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Filter, Calendar } from 'lucide-react';
import DocumentCard from './DocumentCard';

interface Document {
    id: string;
    type: string;
    number: string | null;
    url: string;
    generatedAt: Date | string | null;
    eventTitle: string;
    color: string;
}

interface DocumentsListClientProps {
    initialDocuments: Document[];
    locale: string;
}

export default function DocumentsListClient({ initialDocuments, locale }: DocumentsListClientProps) {
    const t = useTranslations('Dashboard.Documents');

    // Convert string dates to Date objects for easier handling if needed, 
    // but we can trust the passing if consistent.
    // However, server passes serialized data (likely strings for dates).

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [selectedMonth, setSelectedMonth] = useState<string>('all');
    const [filteredDocs, setFilteredDocs] = useState(initialDocuments);

    // Extract available years from documents
    const availableYears = Array.from(new Set(initialDocuments.map(doc => {
        if (!doc.generatedAt) return new Date().getFullYear().toString();
        return new Date(doc.generatedAt).getFullYear().toString();
    }))).sort((a, b) => b.localeCompare(a));

    useEffect(() => {
        let result = initialDocuments;

        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(doc =>
                doc.number?.toLowerCase().includes(query) ||
                doc.eventTitle.toLowerCase().includes(query) ||
                doc.type.toLowerCase().includes(query)
            );
        }

        // Year Filter
        if (selectedYear !== 'all') {
            result = result.filter(doc => {
                const date = doc.generatedAt ? new Date(doc.generatedAt) : new Date();
                return date.getFullYear().toString() === selectedYear;
            });
        }

        // Month Filter
        if (selectedMonth !== 'all') {
            result = result.filter(doc => {
                const date = doc.generatedAt ? new Date(doc.generatedAt) : new Date();
                // selectedMonth is 0-indexed string '0', '1', etc? Or '1', '2'?
                // Let's use 1-based index '1'-'12'
                return (date.getMonth() + 1).toString() === selectedMonth;
            });
        }

        setFilteredDocs(result);
    }, [searchQuery, selectedYear, selectedMonth, initialDocuments]);

    const months = [
        { value: '1', label: t('months.january') },
        { value: '2', label: t('months.february') },
        { value: '3', label: t('months.march') },
        { value: '4', label: t('months.april') },
        { value: '5', label: t('months.may') },
        { value: '6', label: t('months.june') },
        { value: '7', label: t('months.july') },
        { value: '8', label: t('months.august') },
        { value: '9', label: t('months.september') },
        { value: '10', label: t('months.october') },
        { value: '11', label: t('months.november') },
        { value: '12', label: t('months.december') },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div>
                {/* Title is handled in parent or here? The parent had it. We can keep it or move it.
                    Parent had title. Let's assume parent renders title, this component renders content.
                    BUT parent had search bar too. We moved search bar logic here.
                    So this component should render the controls.
                 */}
                <p className="text-zinc-400">
                    {t('total')} <span className="text-white font-bold">{filteredDocs.length}</span>
                    {filteredDocs.length !== initialDocuments.length && (
                        <span className="text-zinc-500 text-sm ml-2">({t('filteredFrom')} {initialDocuments.length})</span>
                    )}
                </p>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col gap-4">
                {/* Search */}
                <div className="w-full flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <Search className="w-5 h-5 text-zinc-500" />
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-white placeholder:text-zinc-500 flex-1 w-full"
                    />
                </div>

                {/* Filters */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative w-full">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full appearance-none bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white outline-none focus:border-cyan-500 cursor-pointer"
                        >
                            <option value="all">{t('allYears')}</option>
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <Calendar className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="relative w-full">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            disabled={selectedYear === 'all'}
                            className="w-full appearance-none bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white outline-none focus:border-cyan-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="all">{t('allMonths')}</option>
                            {months.map(m => (
                                <option key={m.value} value={m.value}>{t.has(`months.${m.label}`) ? t(`months.${m.label}`) : m.label}</option>
                            ))}
                        </select>
                        <Filter className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Documents Grid */}
            {filteredDocs.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocs.map((doc, index) => (
                        <div key={doc.id} style={{ animationDelay: `${index * 50}ms` }}>
                            <DocumentCard
                                doc={{
                                    ...doc,
                                    type: t.has(`types.${doc.type}`) ? t(`types.${doc.type}`) : doc.type
                                }}
                                locale={locale}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
                    <FileText className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">{t('emptyTitle')}</h3>
                    <p className="text-zinc-400">{t('emptyDesc')}</p>
                </div>
            )}
        </div>
    );
}

// Helper icons just in case they aren't imported (they are at top)
function FileText(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M10 9H8" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
        </svg>
    )
}
