import prisma from '@/lib/prisma';
import { ClipboardList } from 'lucide-react';
import SecretHeader from '@/components/secretroom75/SecretHeader';
import EventGrid from './EventGrid';
import { getTranslations } from 'next-intl/server';

export default async function AdminRegistrationsIndexPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    try {
        const { locale } = await params;
        const t = await getTranslations({ locale, namespace: 'Admin.Registrations' });
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
                        {t('title')}
                    </h1>
                    <p className="text-zinc-400">
                        {t('subtitle')}
                    </p>
                </div>

                <EventGrid events={serializedEvents} />
            </div>
        );
    } catch (error: any) {
        return (
            <div className="p-8 bg-red-900 text-white rounded-xl">
                <h2 className="text-2xl font-bold mb-4">CRASH TRACE:</h2>
                <p className="font-mono text-sm">{error?.message}</p>
                <pre className="mt-4 p-4 bg-black/50 overflow-auto whitespace-pre-wrap text-xs">
                    {error?.stack}
                </pre>
            </div>
        );
    }
}
