import prisma from '@/lib/prisma';
import { ClipboardList } from 'lucide-react';
import SecretHeader from '@/components/secretroom75/SecretHeader';
import EventGrid from './EventGrid';

export default async function AdminRegistrationsIndexPage() {
    const events = await prisma.event.findMany({
        orderBy: { eventDate: 'desc' },
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

    const serializedEvents = JSON.parse(JSON.stringify(events));

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500 container mx-auto px-4 max-w-7xl">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-black italic uppercase mb-2 flex items-center gap-3 text-white">
                    <ClipboardList className="w-8 h-8 text-accent" />
                    Nevezések Kezelése
                </h1>
                <p className="text-zinc-400">
                    Válassz eseményt a nevezések megtekintéséhez
                </p>
            </div>

            <EventGrid events={serializedEvents} />
        </div>
    );
}
