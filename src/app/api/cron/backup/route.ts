
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeData } from '@/lib/utils/serialization';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max duration

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    // Allow triggering via secret key for Cron jobs
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const validSecret = process.env.CRON_SECRET;

    if (!validSecret) {
        console.error('CRON_SECRET is not configured on the server');
        return new NextResponse('Internal Server Error', { status: 500 });
    }

    if (authHeader !== `Bearer ${validSecret}` && key !== validSecret) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        console.log('Starting Database Backup...');

        // Fetch all critical data
        // Using transaction to ensure consistency if possible, though findMany is separate
        const [
            users,
            events,
            registrations,
            sellers,
            globalSettings,
            distances,
            priceTiers,
            partners,
            products
        ] = await Promise.all([
            prisma.user.findMany(),
            prisma.event.findMany({ include: { distances: { include: { priceTiers: true } } } }),
            prisma.registration.findMany(),
            prisma.seller.findMany(),
            prisma.globalSettings.findFirst(),
            prisma.distance.findMany(), // Redundant if included in event, but good for safety
            prisma.priceTier.findMany(), // Redundant if included in distance
            prisma.partner.findMany(),
            prisma.product.findMany({ include: { orderItems: true } })
        ]);

        const backupData = {
            timestamp: new Date().toISOString(),
            users,
            events,
            registrations,
            sellers,
            globalSettings,
            distances,
            priceTiers,
            partners,
            products
        };

        // Save backup to disk (local daily folder with 5-file rotation)
        try {
            const { saveBackupDataToDisk } = await import('@/actions/auto-backup');
            await saveBackupDataToDisk(backupData);
        } catch (diskErr) {
            console.error('[Cron Backup] Failed to save backup to disk:', diskErr);
        }

        return NextResponse.json({
            success: true,
            message: 'Backup generated successfully',
            dataSummary: {
                users: users.length,
                events: events.length,
                registrations: registrations.length
            },
            // returning data in body for "pull" backups
            backup: backupData
        });

    } catch (error: any) {
        console.error('Backup failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
