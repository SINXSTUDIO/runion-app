import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { Link } from '@/i18n/routing';
import EventsTable from '@/components/secretroom75/EventsTable';

export default async function AdminEventsPage() {
    const eventsData = await prisma.event.findMany({
        orderBy: { sortOrder: 'asc' },
        include: {
            distances: {
                include: {
                    _count: {
                        select: { registrations: true }
                    }
                }
            }
        }
    });

    const events = eventsData.map(event => ({
        id: event.id,
        slug: event.slug,
        title: event.title,
        eventDate: event.eventDate,
        location: event.location,
        status: event.status,
        sortOrder: event.sortOrder,
        registrationsCount: event.distances.reduce((acc, dist) => acc + dist._count.registrations, 0)
    }));

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500 container mx-auto px-4 max-w-7xl py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black italic uppercase mb-2 flex items-center gap-3 text-white">
                        <Plus className="w-8 h-8 text-accent" />
                        Események Kezelése
                    </h1>
                    <p className="text-zinc-400">
                        Versenyek létrehozása, szerkesztése és kezelése
                    </p>
                </div>
                <Link href="/secretroom75/events/new">
                    <Button className="gap-2 bg-accent hover:bg-accent/90 text-black font-bold h-12 px-6 rounded-xl">
                        <Plus className="w-5 h-5" />
                        Új Verseny
                    </Button>
                </Link>
            </div>

            <EventsTable initialEvents={events} />
            {/* <div className="p-4 bg-red-900/50 text-white">EventsTable TEMPORARILY DISABLED FOR DEBUGGING</div> */}
        </div>
    );
}
