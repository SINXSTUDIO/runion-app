import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';
import { Link } from '@/i18n/routing';
import RegistrationsTable from '@/components/secretroom75/RegistrationsTable';
import { serializeData } from '@/lib/utils/serialization';

export default async function EventRegistrationsPage({ params }: { params: Promise<{ id: string, locale: string }> }) {
    const { id, locale } = await params;

    const event = await prisma.event.findUnique({
        where: { id },
        select: {
            title: true,
            formConfig: true
        }
    });

    if (!event) notFound();

    const formConfig = (event.formConfig as any)?.fields || [];

    const rawRegistrations = await prisma.registration.findMany({
        where: {
            distance: {
                eventId: id
            }
        },
        include: {
            user: true,
            distance: true
        },
        orderBy: { createdAt: 'desc' }
    });

    const registrations = serializeData(rawRegistrations);

    return (
        <div className="container mx-auto px-4 py-8 text-white">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Link href={`/secretroom75/events/${id}/edit`} className="inline-flex items-center text-zinc-400 hover:text-white mb-2 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Vissza a szerkesztéshez
                    </Link>
                    <h1 className="text-3xl font-black italic uppercase flex items-center gap-3">
                        <Users className="w-8 h-8 text-accent" />
                        {event.title} - Nevezések
                    </h1>
                </div>
            </div>

            <RegistrationsTable
                registrations={registrations as any}
                eventTitle={event.title}
                formConfig={formConfig}
            />
        </div>
    );
}
