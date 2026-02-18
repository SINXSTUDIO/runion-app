import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
    try {
        // SECURITY: Admin authentication required for data export
        const session = await auth();
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
            return new NextResponse('Forbidden: Admin access required', { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return new NextResponse('Missing event slug', { status: 400 });
        }

        const event = await prisma.event.findUnique({
            where: { slug },
            include: {
                distances: {
                    include: {
                        registrations: {
                            include: {
                                user: true,
                                distance: true,
                            },
                        },
                    },
                },
            },
        });

        if (!event) {
            return new NextResponse('Event not found', { status: 404 });
        }

        // Flatten registrations from all distances
        const allRegistrations = event.distances.flatMap(distance => distance.registrations)
            // Optional: Sort by creation date if needed, or rely on database default order
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const CRLF = '\r\n';

        // Known keys to exclude from dynamic fields (because they are handled explicitly)
        const ignoredKeys = new Set(['billingDetails', 'termsAccepted', 'privacyAccepted', 'comment', 'website', 'website_field', 'tshirtSize']);

        // Extract all unique form field keys from registrations
        const dynamicFieldKeys = new Set<string>();
        allRegistrations.forEach(reg => {
            const formData = (reg.formData as Record<string, any>) || {};
            if (formData && typeof formData === 'object') {
                Object.keys(formData).forEach(key => {
                    if (!ignoredKeys.has(key)) {
                        dynamicFieldKeys.add(key);
                    }
                });
            }
        });

        const dynamicHeaders = Array.from(dynamicFieldKeys);

        // CSV Header
        // Note: sep=; is for Excel to automatically detect the delimiter
        const csvHeader = 'sep=;' + CRLF + [
            'ID',
            'Vezetéknév',
            'Keresztnév',
            'Email',
            'Irányítószám',
            'Város',
            'Cím',
            'Nem',
            'Szül. dátum',
            'Póló méret',
            'Táv',
            'Ár (HUF)',
            'Ár (EUR)',
            'Végösszeg',
            'Egyesület',
            'Nevezés Státusz',
            'Fizetési Státusz',
            'Vészhelyzeti Név',
            'Vészhelyzeti Telefon',
            'Reg. Dátum',
            // Billing Data
            'Számlázási Név',
            'Számlázási Irányítószám',
            'Számlázási Város',
            'Számlázási Utca, hsz.',
            'Adószám',
            // Legal & Extra
            'Megjegyzés',
            // Dynamic
            ...dynamicHeaders
        ].join(';') + CRLF;

        // CSV Rows
        const csvRows = allRegistrations.map((reg) => {
            const u = reg.user;
            const d = reg.distance;
            const formData = (reg.formData as Record<string, any>) || {};
            const billing = formData.billingDetails || {};

            if (!u || !d) {
                return null;
            }

            // Safe helper for strings
            const safe = (str: any) => `"${String(str || '').replace(/"/g, '""')}"`;
            const dateStr = (date: Date | null) => date ? date.toISOString().split('T')[0] : '';

            // Translate Gender
            const translateGender = (g: string | null) => {
                if (g === 'MALE') return 'Férfi';
                if (g === 'FEMALE') return 'Nő';
                return g || '';
            };

            const dynamicValues = dynamicHeaders.map(key => {
                const value = formData[key];
                if (value === null || value === undefined) return '';
                if (typeof value === 'object') return safe(JSON.stringify(value));
                return safe(value);
            });

            return [
                reg.id,
                safe(u.lastName),
                safe(u.firstName),
                u.email,
                safe(u.zipCode),
                safe(u.city),
                safe(u.address),
                translateGender(u.gender),
                dateStr(u.birthDate),
                safe(u.tshirtSize),
                safe(d.name),
                d.price.toString(),
                (d.priceEur || '').toString(),
                (reg.finalPrice || '').toString(),
                safe(u.clubName),
                reg.registrationStatus,
                reg.paymentStatus,
                safe(u.emergencyContactName),
                safe(u.emergencyContactPhone),
                dateStr(reg.createdAt),
                // Billing
                safe(billing.name),
                safe(billing.zip),
                safe(billing.city),
                safe(billing.address),
                safe(billing.taxNumber),
                // Extra
                safe(formData.comment),
                // Dynamic
                ...dynamicValues
            ].join(';');
        })
            .filter(row => row !== null)
            .join(CRLF);

        const csvContent = "\uFEFF" + csvHeader + csvRows; // Add BOM for Excel support

        // Return as download
        const filename = `registrations-${slug}-${new Date().toISOString().split('T')[0]}.csv`;

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });

    } catch (error) {
        console.error('[CSV EXPORT ERROR]', error);
        return new NextResponse('Internal Server Error during CSV export', { status: 500 });
    }
}
