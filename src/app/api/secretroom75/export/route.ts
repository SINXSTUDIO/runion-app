import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
    // SECURITY: Admin authentication required for data export
    const session = await auth();
    if (!session?.user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
        return new NextResponse('Forbidden: Admin access required', { status: 403 });
    }

    const slug = request.nextUrl.searchParams.get('slug');

    if (!slug) {
        return new NextResponse('Missing event slug', { status: 400 });
    }

    const event = await (prisma.event as any).findUnique({
        where: { slug },
        include: {
            registrations: {
                include: {
                    user: true,
                    distance: true,
                }
            }
        }
    });

    if (!event) {
        return new NextResponse('Event not found', { status: 404 });
    }

    // Type assertion for registrations include
    const eventWithRegistrations = event as typeof event & {
        registrations: Array<{
            user: any;
            distance: any;
            id: string;
            userId: string;
            distanceId: string;
            eventId: string;
            status: string;
            registrationNumber: string;
            formData: any;
            createdAt: Date;
        }>;
    };

    // CSV Header
    const csvHeader = [
        'user-name',
        'user-email',
        'user-address',
        'city',
        'zip',
        'gender',
        'born',
        'tshirt',
        'distance',
        'price',
        'club',
        'status',
        'emergency-name',
        'emergency-phone'
    ].join(';') + '\n';

    // CSV Rows
    const csvRows = eventWithRegistrations.registrations.map((reg: any) => {
        const u = reg.user;
        const d = reg.distance;

        return [
            `"${u.firstName} ${u.lastName}"`,
            u.email,
            `"${u.address || ''}"`,
            u.city || '',
            u.zipCode || '',
            u.gender,
            u.birthDate ? u.birthDate.toISOString().split('T')[0] : '',
            u.tshirtSize || '',
            `"${d.name}"`,
            d.price,
            `"${u.club || ''}"`, // Added club if exists in User model (need to check schema if I added club context)
            reg.status,
            `"${u.emergencyContactName || ''}"`,
            `"${u.emergencyContactPhone || ''}"`
        ].join(';');
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Return as download
    return new NextResponse(csvContent, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="registrations-${slug}-${new Date().toISOString().split('T')[0]}.csv"`,
        },
    });
}
