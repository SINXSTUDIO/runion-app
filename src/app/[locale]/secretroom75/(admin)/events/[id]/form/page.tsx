import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { FormConfig } from '@/lib/types/form';
import FormBuilder from '@/components/admin/FormBuilder';

export default async function AdminEventFormPage({ params }: { params: Promise<{ id: string, locale: string }> }) {
    const { id, locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Admin.EventForm' });
    console.log('Fetching event for form:', id);

    try {
        const event = await prisma.event.findUnique({
            where: { id }
        });

        if (!event) {
            notFound();
        }

        const initialConfig = (event.formConfig as unknown as FormConfig)?.fields || [];

        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
                    <p className="text-zinc-500">{t('subtitle')}</p>
                </div>
                <FormBuilder eventId={event.id} initialConfig={initialConfig} />
            </div>
        );
    } catch (error) {
        console.error('Error in Form Page:', error);
        throw error;
    }
}

