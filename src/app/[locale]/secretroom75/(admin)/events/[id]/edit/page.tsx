import prisma from '@/lib/prisma';
import EventForm from '@/components/secretroom75/EventForm';
import DistanceManager from '@/components/secretroom75/DistanceManager';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { FileText, Users } from 'lucide-react';
import { serializeData } from '@/lib/utils/serialization';
import { Link } from '@/i18n/routing';

interface EditEventPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
    const { id } = await params;
    const event = await prisma.event.findUnique({
        where: { id },
        include: {
            seller: true, // Include seller for displaying in form
            distances: {
                orderBy: { price: 'asc' },
                include: {
                    priceTiers: true
                }
            }
        }
    });

    if (!event) {
        notFound();
    }

    const sellers = await prisma.seller.findMany({
        where: { active: true },
        orderBy: { order: 'asc' }
    });

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-black font-heading">Verseny Szerkesztése</h1>
                    <div className="flex gap-3">
                        <Link href={`/secretroom75/events/${id}/registrations`}>
                            <Button variant="outline" className="gap-2 bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20">
                                <Users className="w-4 h-4" />
                                Nevezések Megtekintése
                            </Button>
                        </Link>
                        <Link href={`/secretroom75/events/${id}/form`}>
                            <Button variant="outline" className="gap-2">
                                <FileText className="w-4 h-4" />
                                Űrlap Szerkesztő
                            </Button>
                        </Link>
                    </div>
                </div>
                <EventForm event={serializeData(event)} sellers={serializeData(sellers)} />

                <div className="mt-12 pt-12 border-t border-zinc-800">
                    <DistanceManager eventId={event.id} distances={serializeData(event.distances) as any[]} />
                </div>
            </div>
        </div>
    );
}
