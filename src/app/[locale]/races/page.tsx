import { getPublishedEvents } from '@/actions/events';
import EventCard from '@/components/events/EventCard';
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
        <div className="min-h-screen bg-black text-white pt-28 pb-20">
            {/* Header Section */}
            <div className="container mx-auto px-4 mb-16">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black font-heading tracking-tighter uppercase mb-4 leading-none">
                            <span className="text-white block">Következő</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-hover">
                                Versenyeink
                            </span>
                        </h1>
                        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl font-light">
                            Találd meg a következő kihívásodat. Legyen szó aszfaltról vagy terepről, nálunk megtalálod a számításod.
                        </p>
                    </div>
                </div>

                {/* Filters (Visual Placeholder for Phase 2b) */}
                <div className="w-full h-px bg-zinc-800 mb-8" />

                {/* 
                <div className="flex flex-wrap gap-4 mb-12">
                     <Button variant="outline" className="rounded-full border-zinc-700 text-zinc-300 hover:text-white hover:border-white">
                        <Filter className="w-4 h-4 mr-2" />
                        Szűrők
                     </Button>
                     ... categories ...
                </div> 
                */}
            </div>

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
