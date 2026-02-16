import { getPublishedEvents } from '@/actions/events';
import EventCard from '@/components/events/EventCard';
import EventsHero from '@/components/events/EventsHero';

import { Inter, Montserrat } from "next/font/google";
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { generateMetadata as genMeta } from '@/lib/seo/metadata';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;

    const titles = {
        hu: 'Futóversenyek',
        en: 'Running Events',
        de: 'Lauf Veranstaltungen'
    };

    const descriptions = {
        hu: 'Böngéssz a RUNION aktuális futóversenyei között és nevezz online egyszerűen. Maratonok, félmaratonok, trail futások.',
        en: 'Browse current RUNION running events and register online easily. Marathons, half marathons, trail runs.',
        de: 'Durchsuchen Sie die aktuellen RUNION-Laufveranstaltungen und melden Sie sich einfach online an. Marathons, Halbmarathons, Trail-Läufe.',
    };

    return genMeta({
        title: titles[locale as keyof typeof titles] || titles.hu,
        description: descriptions[locale as keyof typeof descriptions] || descriptions.hu,
        keywords: ['futóversenyek', 'maraton', 'félmaraton', 'trail running', 'nevezés', 'online regisztráció'],
        locale,
        canonical: `https://runion.hu/${locale}/races`,
    });
}

export default async function RacesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    // Fetch events
    const { data: events, success } = await getPublishedEvents() as any;
    const hasEvents = success && events && events.length > 0;

    return (
        <div className="min-h-screen bg-black text-white">

            {/* Hero Section */}
            <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden mb-16">
                <EventsHero />

                <div className="relative z-20 container mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-8xl font-black font-heading tracking-tighter uppercase mb-6 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-4 duration-1000 leading-none">
                        <span className="text-white block md:inline mr-4">Következő</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-hover block md:inline">
                            Versenyeink
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-zinc-200 font-medium max-w-2xl mx-auto mb-8 drop-shadow-md leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        Találd meg a következő kihívásodat. Legyen szó aszfaltról vagy terepről, nálunk megtalálod a számításod.
                    </p>

                    <div className="flex justify-center gap-2 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        <div className="w-16 h-1 bg-accent rounded-full shadow-[0_0_10px_rgba(0,242,254,0.5)]"></div>
                        <div className="w-4 h-1 bg-white rounded-full opacity-50"></div>
                        <div className="w-4 h-1 bg-white rounded-full opacity-30"></div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-zinc-900/80 to-transparent pointer-events-none z-10"></div>
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-10"></div>
            </section>


            {/* Event Grid */}
            <div className="container mx-auto px-4">
                {!hasEvents ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-zinc-900/30 rounded-[3rem] border border-zinc-800/50 backdrop-blur-sm">
                        <div className="bg-zinc-800 p-6 rounded-full mb-6 animate-pulse">
                            <Search className="w-12 h-12 text-zinc-500" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold font-heading mb-3 text-white">
                            Jelenleg nincsenek aktív versenyek
                        </h3>
                        <p className="text-zinc-500 text-lg max-w-md text-center px-4">
                            Nézz vissza később, vagy iratkozz fel hírlevelünkre az értesítésért!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
                        {events.map((event: any) => (
                            <EventCard key={event.id} event={event} locale={locale} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
