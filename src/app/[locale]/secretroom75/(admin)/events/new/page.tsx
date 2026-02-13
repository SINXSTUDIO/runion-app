import EventForm from '@/components/secretroom75/EventForm';
import { prisma } from '@/lib/prisma';
import { serializeData } from '@/lib/utils/serialization';

export default async function NewEventPage() {
    const sellers = await prisma.seller.findMany({
        where: { active: true },
        orderBy: { order: 'asc' }
    });

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-black font-heading mb-8">Új Verseny Létrehozása</h1>
                <EventForm sellers={serializeData(sellers)} />
            </div>
        </div>
    );
}
