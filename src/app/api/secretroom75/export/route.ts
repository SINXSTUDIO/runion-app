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

        // CSV Header
        const csvHeader = [
            'name',
            'email',
            'address',
            'city',
            'zip',
            'gender',
            'birth_date',
            'tshirt_size',
            'distance',
            'price',
            'club',
            'reg_status',
            'pay_status',
            'emergency_name',
            'emergency_phone',
            'reg_date'
        ].join(';') + '\n';

        // CSV Rows
        const csvRows = allRegistrations.map((reg) => {
            const u = reg.user;
            const d = reg.distance;

            if (!u || !d) {
                // Skip or handle malformed registrations
                return null;
            }

            // Safe helper for strings to avoid CSV injection or breaking
            const safe = (str: string | null | undefined) => `"${(str || '').replace(/"/g, '""')}"`;
            const dateStr = (date: Date | null) => date ? date.toISOString().split('T')[0] : '';

            return [
                safe(`${u.firstName} ${u.lastName}`),
                u.email, // emails usually don't need quotes but safe to have
                safe(u.address),
                safe(u.city),
                safe(u.zipCode),
                u.gender || '',
                dateStr(u.birthDate),
                safe(u.tshirtSize),
                safe(d.name),
                d.price.toString(), // Decimal to string
                safe(u.clubName),
                reg.registrationStatus,
                reg.paymentStatus,
                safe(u.emergencyContactName),
                safe(u.emergencyContactPhone),
                dateStr(reg.createdAt)
            ].join(';');
        })
            .filter(row => row !== null) // Filter out malformed rows
            .join('\n');

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
