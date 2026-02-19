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

        // Helper to remove accents and special characters from headers
        const normalizeHeader = (str: string) => {
            return str
                .normalize('NFD') // Decompose combined characters
                .replace(/[\u0300-\u036f]/g, '') // Remove dialectics
                .replace(/[^a-zA-Z0-9\s-_]/g, '') // Keep only safe chars
                .trim();
        };

        // Parse form configuration to get human-readable labels
        // SECURITY: Ensure formConfig is an array before iterating
        let formConfig = (event.formConfig as any[]) || [];
        if (!Array.isArray(formConfig)) {
            formConfig = [];
        }
        const fieldLabels: Record<string, string> = {};
        const fieldOrder: string[] = [];

        formConfig.forEach(field => {
            if (field.id && field.label) {
                fieldLabels[field.id] = normalizeHeader(field.label);
                fieldOrder.push(field.id);
            }
        });

        // Known keys to exclude/handle explicitly
        const ignoredKeys = new Set([
            'billingDetails',
            'termsAccepted',
            'privacyAccepted',
            'comment',
            // 'website', 'website_field', 'tshirtSize' // These might be in formConfig, so let's keep them if they are there, or ignore if hardcoded
        ]);

        // Extract all unique form field keys from registrations
        const allDynamicKeys = new Set<string>();
        allRegistrations.forEach(reg => {
            const formData = (reg.formData as Record<string, any>) || {};
            if (formData && typeof formData === 'object') {
                Object.keys(formData).forEach(key => {
                    if (!ignoredKeys.has(key)) {
                        allDynamicKeys.add(key);
                    }
                });
            }
        });

        // Sort dynamic keys: 
        // 1. Fields defined in formConfig (in order)
        // 2. Any other fields found in data (alphabetically)
        const sortedDynamicKeys = [
            ...fieldOrder.filter(key => allDynamicKeys.has(key)),
            ...Array.from(allDynamicKeys).filter(key => !fieldOrder.includes(key)).sort()
        ];

        // CSV Header
        const csvHeader = 'sep=;' + CRLF + [
            'ID',
            'Vezeteknev',
            'Keresztnev',
            'Email',
            'Iranyitoszam',
            'Varos',
            'Cim',
            'Nem',
            'Szul datum',
            'Polo meret',
            'Tav',
            'Ar (HUF)',
            'Ar (EUR)',
            'Vegosszeg',
            'Egyesulet',
            'Nevezes Statusz',
            'Fizetesi Statusz',
            'Veszhelyzeti Nev',
            'Veszhelyzeti Telefon',
            'Reg Datum',
            // Billing Data
            'Szamlazasi Nev',
            'Szamlazasi Iranyitoszam',
            'Szamlazasi Varos',
            'Szamlazasi Utca hsz',
            'Adoszam',
            // Lebonyolítási & Extra adatok (Form Config based headers)
            ...sortedDynamicKeys.map(key => fieldLabels[key] || normalizeHeader(key)),
            // Megjegyzés mindig a végére
            'Megjegyzes'
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

            // Safe helper: remove newlines, escape quotes
            const safe = (str: any) => {
                const s = String(str || '');
                // Replace line breaks with space to prevent CSV shifting
                const clean = s.replace(/[\r\n]+/g, ' ').replace(/"/g, '""');
                return `"${clean}"`;
            };

            const dateStr = (date: Date | null) => date ? date.toISOString().split('T')[0] : '';

            // Translate Gender
            const translateGender = (g: string | null) => {
                if (g === 'MALE') return 'Férfi';
                if (g === 'FEMALE') return 'Nő';
                return g || '';
            };

            const dynamicValues = sortedDynamicKeys.map(key => {
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
                // Dynamic Values (mapped to headers)
                ...dynamicValues,
                // Comment
                safe(formData.comment)
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
