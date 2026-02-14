'use client';

import { motion } from 'framer-motion';
import { Users, Clock, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Link } from '@/i18n/routing';
import { useFormatter, useTranslations } from 'next-intl';

interface DistanceCardProps {
    distance: {
        id: string;
        name: string;
        nameEn?: string;
        nameDe?: string;
        description?: string;
        price: number;
        priceEur?: number;
        capacityLimit: number;
        startTime: Date;
        _count?: {
            registrations: number;
        };
        priceTiers?: Array<{
            id: string;
            name: string;
            price: number;
            priceEur?: number;
            validFrom: Date;
            validTo: Date;
        }>;
    };
    eventSlug: string;
    locale: string;
    index: number;
}

export default function DistanceCard({ distance, eventSlug, locale, index }: DistanceCardProps) {
    const t = useTranslations('EventDetails');
    const format = useFormatter();

    // Calculate capacity stats - ZERO HARDCODING
    const registered = distance._count?.registrations || 0;
    const available = distance.capacityLimit - registered;
    const percentageFull = distance.capacityLimit > 0 ? (registered / distance.capacityLimit) * 100 : 0;

    // Determine status dynamically
    const getStatus = () => {
        if (available === 0) return 'SOLD_OUT';
        if (percentageFull >= 90) return 'ALMOST_FULL';
        if (percentageFull >= 50) return 'FILLING_FAST';
        return 'AVAILABLE';
    };
    const status = getStatus();

    // Get active price tier (early bird) from DB
    const now = new Date();
    const activeTier = distance.priceTiers?.find(
        tier => new Date(tier.validFrom) <= now && new Date(tier.validTo) >= now
    );

    const displayPrice = activeTier?.price || distance.price;
    const displayPriceEur = activeTier?.priceEur || distance.priceEur;

    // Format price - multi-currency from DB
    const formatPrice = (priceHuf: number, priceEur?: number) => {
        const huf = Number(priceHuf);
        const eur = priceEur ? Number(priceEur) : 0;

        if (huf > 0 && eur > 0) {
            return `${huf.toLocaleString()} Ft / ${eur} €`;
        }
        if (huf === 0 && eur > 0) {
            return `${eur} €`;
        }
        return `${huf.toLocaleString()} Ft`;
    };

    // Status configuration
    const statusConfig = {
        SOLD_OUT: { label: t('status.soldOut'), color: 'bg-red-500', icon: '🔴' },
        ALMOST_FULL: { label: t('status.almostFull'), color: 'bg-orange-500', icon: '⚠️' },
        FILLING_FAST: { label: t('status.fillingFast'), color: 'bg-yellow-500', icon: '🔥' },
        AVAILABLE: { label: t('status.available'), color: 'bg-green-500', icon: '✅' }
    };

    const currentStatus = statusConfig[status];

    // Localized name from DB
    const distanceName =
        locale === 'en' && distance.nameEn ? distance.nameEn :
            locale === 'de' && distance.nameDe ? distance.nameDe :
                distance.name;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group relative"
        >
            <div className="relative bg-zinc-900/50 border border-zinc-800 rounded-2xl md:rounded-3xl p-3 md:p-6 backdrop-blur-sm hover:border-accent/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,242,254,0.15)] h-full flex flex-col">

                {/* Status Badge */}
                {status !== 'AVAILABLE' && (
                    <div className="absolute top-4 right-4 z-10">
                        <Badge variant="outline" className={`${currentStatus.color} border-none text-white px-3 py-1 text-xs font-bold uppercase tracking-wide`}>
                            {currentStatus.icon} {currentStatus.label}
                        </Badge>
                    </div>
                )}

                {/* Early Bird Badge - IF ACTIVE FROM DB */}
                {activeTier && (
                    <div className="absolute top-4 left-4 z-10">
                        <Badge variant="outline" className="bg-accent text-black border-none px-3 py-1 text-xs font-black uppercase tracking-wide animate-pulse">
                            <Zap className="w-3 h-3 mr-1 inline" />
                            {activeTier.name}
                        </Badge>
                    </div>
                )}

                {/* Distance Name */}
                <h3 className="text-lg md:text-2xl font-black font-heading uppercase mb-1 md:mb-3 text-white mt-6 md:mt-8 group-hover:text-accent transition-colors leading-tight">
                    {distanceName}
                </h3>

                {/* Description (if from DB) */}
                {distance.description && (
                    <p className="text-zinc-400 text-xs md:text-sm mb-2 md:mb-4 line-clamp-2 md:block hidden">
                        {distance.description}
                    </p>
                )}

                {/* Start Time */}
                <div className="flex items-center gap-2 mb-2 md:mb-4 text-zinc-400">
                    <Clock className="w-3 h-3 md:w-4 md:h-4 text-accent" />
                    <span className="text-xs md:text-sm">
                        {format.dateTime(new Date(distance.startTime), {
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'Europe/Budapest'
                        })}
                    </span>
                </div>

                {/* Capacity Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {t('capacity.registered', { count: registered })}
                        </span>
                        <span className="text-xs text-zinc-500">
                            {t('capacity.available', { count: available })}
                        </span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentageFull}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                            className={`h-full rounded-full ${status === 'SOLD_OUT' ? 'bg-red-500' :
                                status === 'ALMOST_FULL' ? 'bg-orange-500' :
                                    status === 'FILLING_FAST' ? 'bg-yellow-500' :
                                        'bg-accent'
                                }`}
                        />
                    </div>
                </div>

                {/* Price Section */}
                <div className="mt-auto pt-4 border-t border-zinc-800">
                    <div className="flex items-end justify-between mb-4">
                        <div>
                            {activeTier && (
                                <p className="text-xs text-zinc-500 line-through mb-1">
                                    {formatPrice(Number(distance.price), distance.priceEur ? Number(distance.priceEur) : undefined)}
                                </p>
                            )}
                            <p className="text-xl md:text-2xl font-black text-white font-mono">
                                {formatPrice(Number(displayPrice), displayPriceEur ? Number(displayPriceEur) : undefined)}
                            </p>
                            {activeTier && (
                                <p className="text-xs text-accent mt-1">
                                    {t('pricing.validUntil')} {format.dateTime(new Date(activeTier.validTo), {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            )}
                        </div>

                        {/* Filling Fast Indicator */}
                        {status === 'FILLING_FAST' && (
                            <div className="flex items-center gap-1 text-yellow-500 text-xs">
                                <TrendingUp className="w-4 h-4" />
                                <span className="font-bold">{Math.round(percentageFull)}%</span>
                            </div>
                        )}
                    </div>

                    {/* CTA Button */}
                    <Link href={`/races/${eventSlug}/register?distanceId=${distance.id}`}>
                        <Button
                            disabled={status === 'SOLD_OUT'}
                            className={`w-full font-bold h-9 md:h-12 text-sm rounded-xl transition-all ${status === 'SOLD_OUT'
                                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                : 'bg-accent text-black hover:bg-accent/80 hover:scale-[1.02] shadow-[0_4px_20px_rgba(0,242,254,0.3)]'
                                }`}
                        >
                            {status === 'SOLD_OUT' ? t('cta.soldOut') : t('cta.register')}
                        </Button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
