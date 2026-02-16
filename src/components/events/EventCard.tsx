'use client';

import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { MapPin, Calendar, ArrowRight, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CountdownTimer } from '@/components/ui/CountdownTimer';

interface EventCardProps {
    event: {
        id: string;
        slug: string;
        title: string;
        location: string;
        eventDate: Date;
        regDeadline: Date;
        coverImage?: string | null;
        distances: { name: string; price: any }[];
        seller?: {
            id: string;
            name: string;
        } | null;
    };
    locale: string;
}

import { useTranslations } from 'next-intl';

export default function EventCard({ event, locale }: EventCardProps) {
    const t = useTranslations('Event');

    // Determine organizer name from seller
    const organizerName = event.seller?.name || 'Ismeretlen szervező';

    const dateStr = new Date(event.eventDate).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-accent/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,242,254,0.1)] flex flex-row md:flex-col h-36 md:h-full">
            {/* Image Container */}
            <div className="relative w-36 md:w-full h-full md:h-64 shrink-0 overflow-hidden">
                <Image
                    src={event.coverImage || '/images/maintenance-bg-cheer.png'}
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 100px, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-all duration-500 grayscale-[20%] group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-black/50 group-hover:bg-transparent transition-colors duration-500 pointer-events-none hidden md:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80 hidden md:block" />

                {/* Date Badge on Image (Desktop Only) */}
                <div className="absolute top-4 left-4 hidden md:flex gap-2">
                    <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                        <Calendar className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium text-white">{dateStr}</span>
                    </div>
                </div>

                {/* Countdown (Visible on Mobile and Desktop) */}
                <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20">
                    <CountdownTimer targetDate={event.regDeadline} />
                </div>
            </div>

            {/* Content */}
            <div className="p-3 md:p-6 flex flex-col flex-grow md:-mt-12 relative z-10 w-full justify-center md:justify-start">
                <h3 className="text-base md:text-2xl font-bold text-white mb-1 md:mb-4 leading-tight group-hover:text-accent transition-colors drop-shadow-md truncate md:whitespace-normal line-clamp-2 md:line-clamp-none">
                    {event.title}
                </h3>

                {/* Mobile Date (Visible only on mobile) */}
                <div className="flex md:hidden items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs">
                        <Calendar className="w-3 h-3 text-accent" />
                        <span>{dateStr}</span>
                    </div>
                </div>

                <div className="hidden md:flex flex-col gap-3 mb-6 bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4 border border-zinc-800/50">
                    <div className="flex items-center gap-3 text-zinc-300">
                        <MapPin className="w-4 h-4 text-accent shrink-0" />
                        <span className="text-sm font-medium">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-400">
                        <UserIcon className="w-4 h-4 text-zinc-500 shrink-0" />
                        <span className="text-sm">{t('organizer')}: <span className="text-zinc-300">{organizerName}</span></span>
                    </div>
                </div>

                {/* Mobile Location/Organizer (Compact) */}
                <div className="flex md:hidden items-center gap-2 text-zinc-500 text-[10px] mb-2">
                    <MapPin className="w-3 h-3 text-zinc-600" />
                    <span className="truncate">{event.location}</span>
                </div>

                <div className="mt-auto hidden md:flex items-center justify-between">
                    <Link href={`/races/${event.slug}`} className="w-full">
                        <Button className="w-full rounded-xl bg-zinc-800 text-white border border-zinc-700 hover:bg-accent hover:text-black hover:border-accent transition-all duration-300 font-bold group/btn h-12 text-lg shadow-lg">
                            {t('details')}
                            <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                {/* Mobile Link Overlay */}
                <Link href={`/races/${event.slug}`} className="absolute inset-0 md:hidden" aria-label={t('details')} />
            </div>
        </div>

    );
}
