'use client';

import { useState } from 'react';
import { Search, MapPin, Users, Calendar, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { useTranslations, useLocale } from 'next-intl';

interface EventGridProps {
    events: any[];
}

export default function EventGrid({ events }: EventGridProps) {
    const t = useTranslations('Admin.Registrations');
    const locale = useLocale();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEvents = events.filter(event => {
        const term = searchTerm?.toLowerCase() || '';
        return (
            (event.title?.toLowerCase() || '').includes(term) ||
            (event.location?.toLowerCase() || '').includes(term)
        );
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return 'emerald';
            case 'DRAFT': return 'amber';
            case 'ARCHIVED': return 'red';
            default: return 'zinc';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Search Bar */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 max-w-md">
                <Search className="w-5 h-5 text-zinc-500" />
                <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none outline-none text-white placeholder:text-zinc-500 flex-1"
                />
            </div>

            {/* List Layout (Horizontal Cards) */}
            <div className="space-y-4">
                {filteredEvents.map((event) => {
                    const totalRegistrations = (event.distances || []).reduce((sum: number, dist: any) => sum + (dist._count?.registrations || 0), 0);
                    const color = getStatusColor(event.status);

                    return (
                        <div
                            key={event.id}
                            className={`
                                relative overflow-hidden
                                bg-gradient-to-r from-${color}-500/10 to-${color}-600/5
                                border border-${color}-500/20
                                rounded-xl p-6
                                backdrop-blur-sm
                                hover:border-${color}-500/40
                                transition-all duration-300
                                group
                            `}
                        >
                            {/* Decorative Side Highlight */}
                            <div className={`absolute top-0 left-0 w-1 h-full bg-${color}-500/50 group-hover:bg-${color}-400 transition-colors`} />

                            <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`
                                            px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                            bg-${color}-500/20 text-${color}-300 border border-${color}-500/20
                                        `}>
                                            {event.status}
                                        </span>
                                        <span className="text-zinc-500 text-xs font-mono flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {event.eventDate && !isNaN(new Date(event.eventDate).getTime()) ? new Date(event.eventDate).toLocaleDateString(locale === 'hu' ? 'hu-HU' : locale === 'de' ? 'de-DE' : 'en-US') : '—'}
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                                        {event.title}
                                    </h2>

                                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                                        <MapPin className="w-4 h-4 text-zinc-600" />
                                        <span>{event.location}</span>
                                    </div>
    try {
        const getStatusColor = (status: string) => {
            switch (status) {
                case 'PUBLISHED': return 'emerald';
                case 'DRAFT': return 'amber';
                case 'ARCHIVED': return 'red';
                default: return 'zinc';
            }
        };

        const filteredEvents = events.filter(event => {
            const term = searchTerm?.toLowerCase() || '';
            return (
                (event.title?.toLowerCase() || '').includes(term) ||
                (event.location?.toLowerCase() || '').includes(term)
            );
        });

        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Search Bar */}
                <div className="relative mb-8 max-w-md group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-accent transition-colors">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
                    />
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredEvents.map((event) => {
                        const totalRegistrations = (event.distances || []).reduce((sum: number, dist: any) => sum + (dist._count?.registrations || 0), 0);
                        const color = getStatusColor(event.status);

                        return (
                            <div
                                key={event.id}
                                className={`
                                    relative bg-white/5 rounded-2xl overflow-hidden
                                    hover:bg-white/10 transition-all duration-300
                                    border border-white/5 hover:border-${color}-500/30
                                    group flex flex-col h-full
                                `}
                            >
                                <div className={`absolute top-0 left-0 w-full h-1 bg-${color}-500`} />
                                
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-bold text-lg text-white leading-tight group-hover:text-accent transition-colors">
                                            {event.title}
                                        </h3>
                                        <div className={`
                                            w-12 h-12 rounded-xl bg-${color}-500/10 border border-${color}-500/20
                                            flex items-center justify-center shrink-0 ml-4
                                        `}>
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold text-lg leading-none text-white">{totalRegistrations}</span>
                                                <span className="text-[10px] uppercase text-zinc-500 font-bold">{totalRegistrations === 1 ? t('runner') : t('runners')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-6 flex-1 text-sm text-zinc-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 shrink-0 text-zinc-500" />
                                            <span>
                                                {event.eventDate ? String(event.eventDate).substring(0, 10) : '—'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 shrink-0 text-zinc-500" />
                                            <span className="truncate" title={event.location}>{event.location}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 mt-auto">
                                        <Link href={`/secretroom75/events/${event.id}/registrations`}>
                                            <Button size="sm" className={`
                                                w-full bg-${color}-500/10 hover:bg-${color}-500/20 text-${color}-400
                                                border border-${color}-500/20 hover:border-${color}-500/40
                                                transition-all h-10 font-bold
                                            `}>
                                                {t('view')} <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredEvents.length === 0 && (
                    <div className="text-center py-12 text-zinc-500 bg-white/5 rounded-xl border border-white/5">
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>{t('noResults')}</p>
                    </div>
                )}
            </div>
        );
    } catch (e: any) {
        return (
            <div className="p-8 bg-red-900 text-white rounded-xl">
                <h2 className="text-2xl font-bold mb-4">CRASH TRACE (Client):</h2>
                <p className="font-mono text-sm">{e?.message}</p>
                <pre className="mt-4 p-4 bg-black/50 overflow-auto whitespace-pre-wrap text-xs">
                    {e?.stack}
                </pre>
            </div>
        );
    }
}
