'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { Calendar, MapPin, ArrowRight, Timer, Cloud, Sun, CloudRain, CloudLightning, Wind } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { hu, enUS, de } from 'date-fns/locale';

interface FeaturedEventProps {
    event: any;
    locale: string;
    customSettings?: {
        titleHU?: string | null;
        titleEN?: string | null;
        titleDE?: string | null;
        descriptionHU?: string | null;
        descriptionEN?: string | null;
        descriptionDE?: string | null;
        buttonHU?: string | null;
        buttonEN?: string | null;
        buttonDE?: string | null;
    };
}

export default function FeaturedEvent({ event, locale, customSettings }: FeaturedEventProps) {
    const t = useTranslations('HomePage.featured');
    const [isEventStarted, setIsEventStarted] = useState(false);
    const [weather, setWeather] = useState<any>(null);

    // Check if event started
    useEffect(() => {
        const checkEventStarted = () => {
            const now = new Date();
            const eventDate = new Date(event.eventDate);
            if (+eventDate <= +now) {
                setIsEventStarted(true);
            }
        };
        checkEventStarted();
    }, [event.eventDate]);

    // Prioritize custom texts from settings over event data
    const getDisplayTitle = () => {
        if (customSettings) {
            if (locale === 'en' && customSettings.titleEN) return customSettings.titleEN;
            if (locale === 'de' && customSettings.titleDE) return customSettings.titleDE;
            if (locale === 'hu' && customSettings.titleHU) return customSettings.titleHU;
            if (customSettings.titleHU) return customSettings.titleHU;
        }
        if (locale === 'en') return event.titleEn || event.title;
        if (locale === 'de') return event.titleDe || event.title;
        return event.title;
    };

    const getDisplayDescription = () => {
        if (customSettings) {
            if (locale === 'en' && customSettings.descriptionEN) return customSettings.descriptionEN;
            if (locale === 'de' && customSettings.descriptionDE) return customSettings.descriptionDE;
            if (locale === 'hu' && customSettings.descriptionHU) return customSettings.descriptionHU;
            if (customSettings.descriptionHU) return customSettings.descriptionHU;
        }
        if (locale === 'en') return event.descriptionEn || event.description;
        if (locale === 'de') return event.descriptionDe || event.description;
        return event.description;
    };

    const getDisplayButton = () => {
        if (customSettings) {
            if (locale === 'en' && customSettings.buttonEN) return customSettings.buttonEN;
            if (locale === 'de' && customSettings.buttonDE) return customSettings.buttonDE;
            if (locale === 'hu' && customSettings.buttonHU) return customSettings.buttonHU;
            if (customSettings.buttonHU) return customSettings.buttonHU;
        }
        return t('details');
    };

    // Weather fetching logic
    useEffect(() => {
        async function fetchWeather() {
            try {
                const city = event.location.split(',')[0].trim();
                const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
                const geoData = await geoRes.json();

                if (geoData.results && geoData.results[0]) {
                    const { latitude, longitude, name } = geoData.results[0];

                    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=weathercode,temperature_2m_max&timezone=auto`);
                    const weatherData = await weatherRes.json();

                    if (weatherData.current_weather && weatherData.daily) {
                        const forecast = weatherData.daily.time.slice(0, 5).map((time: string, index: number) => ({
                            date: time,
                            tempMax: Math.round(weatherData.daily.temperature_2m_max[index]),
                            code: weatherData.daily.weathercode[index]
                        }));

                        setWeather({
                            temp: Math.round(weatherData.current_weather.temperature),
                            code: weatherData.current_weather.weathercode,
                            city: name,
                            forecast
                        });
                    }
                }
            } catch (error) {
                console.error('Weather fetch error:', error);
            }
        }

        if (event.location) {
            fetchWeather();
        }
    }, [event.location]);

    const getWeatherIcon = (code: number, size = "w-5 h-5") => {
        if (code === 0) return <Sun className={`${size} text-yellow-400`} />;
        if (code <= 3) return <Cloud className={`${size} text-zinc-400`} />;
        if (code <= 67) return <CloudRain className={`${size} text-blue-400`} />;
        if (code <= 99) return <CloudLightning className={`${size} text-purple-400`} />;
        return <Wind className={`${size} text-zinc-300`} />;
    };

    const getWeatherText = (code: number) => {
        if (code === 0) return 'Tiszta égbolt';
        if (code <= 3) return 'Részben felhős';
        if (code <= 48) return 'Ködös idő';
        if (code <= 67) return 'Eső várható';
        if (code <= 77) return 'Havazás várható';
        if (code <= 82) return 'Záporok';
        if (code <= 86) return 'Hózápor';
        if (code <= 99) return 'Vihar várható';
        return 'Változékony idő';
    };

    const dateLocale = locale === 'hu' ? hu : locale === 'de' ? de : enUS;
    const formattedDate = format(new Date(event.eventDate), 'PPP', { locale: dateLocale });

    return (
        <section className="relative min-h-[600px] flex items-center justify-center py-20 overflow-hidden">
            {event.coverImage && (
                <div className="absolute inset-0 z-0">
                    <Image
                        src={event.coverImage}
                        alt={event.title}
                        fill
                        className="object-cover scale-105 blur-[2px] opacity-40"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black"></div>
                </div>
            )}

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
                            <div>
                                <span className="inline-block px-4 py-1.5 bg-accent/20 border border-accent/30 text-accent text-sm font-bold uppercase tracking-widest rounded-full mb-6">
                                    {isEventStarted ? t('eventLive') : t('nextEvent')}
                                </span>
                                <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white leading-none mb-6">
                                    {getDisplayTitle()}
                                </h2>
                            </div>

                            <div className="flex flex-wrap gap-6 text-zinc-300">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-accent" />
                                    <span className="font-bold">{formattedDate}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-accent" />
                                    <span className="font-bold">{event.location}</span>
                                </div>
                            </div>

                            <div className="relative">
                                <p className="text-base text-zinc-400 leading-relaxed max-w-xl line-clamp-3 whitespace-pre-line">
                                    {getDisplayDescription()}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {weather && (
                                <div className="animate-in fade-in slide-in-from-bottom duration-1000 delay-500 space-y-4">
                                    <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-3xl flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-accent/10 rounded-2xl">
                                                {getWeatherIcon(weather.code, "w-6 h-6")}
                                            </div>
                                            <div>
                                                <h4 className="text-zinc-200 font-bold">{weather.city}</h4>
                                                <p className="text-zinc-500 text-sm italic">{getWeatherText(weather.code)}</p>
                                            </div>
                                        </div>
                                        <div className="text-3xl font-black text-white italic">
                                            {weather.temp}°C
                                        </div>
                                    </div>

                                    {weather.forecast && (
                                        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-4 rounded-3xl">
                                            <div className="grid grid-cols-5 gap-2">
                                                {weather.forecast.map((day: any, idx: number) => (
                                                    <div key={idx} className="flex flex-col items-center gap-1">
                                                        <span className="text-[10px] text-zinc-500 font-bold uppercase">
                                                            {idx === 0 ? 'Ma' : format(new Date(day.date), 'eee', { locale: dateLocale }).replace('.', '')}
                                                        </span>
                                                        <div className="p-1.5 bg-white/5 rounded-lg">
                                                            {getWeatherIcon(day.code, "w-4 h-4")}
                                                        </div>
                                                        <span className="text-xs font-black text-white">{day.tempMax}°</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <Link href={`/infopack/${event.slug}`}>
                                            <Button size="lg" variant="primary" className="w-full rounded-2xl px-10 py-7 text-lg shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_30px_rgba(0,242,254,0.5)] transform hover:scale-[1.02] transition-all">
                                                {getDisplayButton()}
                                                <ArrowRight className="ml-2 w-5 h-5" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function FeaturedTimeBox({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="text-4xl md:text-6xl font-black text-white tracking-tighter tabular-nums mb-1">
                {value.toString().padStart(2, '0')}
            </div>
            <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-500">
                {label}
            </div>
        </div>
    );
}
