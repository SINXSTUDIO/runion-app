import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getUserRegistrations } from '@/actions/user-dashboard';
import { FileText, Download, Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import prisma from '@/lib/prisma';
import DocumentsListClient from '@/components/dashboard/DocumentsListClient';
import { serializeData } from '@/lib/utils/serialization';

export default async function DocumentsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await auth();
    const t = await getTranslations('Dashboard.Documents');

    if (!session?.user) {
        redirect(`/${locale}/login`);
    }

    const registrations = await getUserRegistrations(session.user.id);
    const orders = await prisma.order.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    });

    // Collect all documents
    const documents: any[] = [];

    // Add Shop Orders
    orders.forEach((order: any) => {
        documents.push({
            id: `order-${order.id}`,
            type: 'Díjbekérő',
            number: order.orderNumber,
            url: `/invoices/${order.id}`, // We now support Order ID in this route
            generatedAt: order.createdAt,
            eventTitle: 'Webshop Rendelés',
            color: 'cyan', // Different color for shop docs
        });
    });

    registrations.forEach((reg: any) => {
        if (reg.receiptUrl) {
            documents.push({
                id: `receipt-${reg.id}`,
                type: 'Nyugta',
                number: reg.receiptNumber,
                url: reg.receiptUrl,
                generatedAt: reg.receiptGeneratedAt,
                eventTitle: reg.distance.event.title,
                color: 'emerald',
            });
        }
        if (reg.invoiceUrl) {
            documents.push({
                id: `invoice-${reg.id}`,
                type: 'Számla',
                number: reg.invoiceNumber,
                url: reg.invoiceUrl,
                generatedAt: reg.invoiceGeneratedAt,
                eventTitle: reg.distance.event.title,
                color: 'blue',
            });
        }
        if (reg.proformaUrl) {
            documents.push({
                id: `proforma-${reg.id}`,
                type: 'Díjbekérő',
                number: reg.proformaNumber,
                url: reg.proformaUrl,
                generatedAt: reg.proformaGeneratedAt,
                eventTitle: reg.distance.event.title,
                color: 'amber',
            });
        }
    });

    // Sort by date (newest first)
    documents.sort((a, b) =>
        new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-black italic text-white mb-2 flex items-center gap-3">
                    <FileText className="w-8 h-8 text-accent" />
                    {t('title')}
                </h1>
                {/* Count moved to client component or kept here? Client component updates filtered count. */}
            </div>

            <DocumentsListClient initialDocuments={serializeData(documents)} locale={locale} />
        </div>
    );
}
