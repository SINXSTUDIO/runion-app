
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
    const validSecret = process.env.CRON_SECRET || 'runion_restore_secret_2026'; // Reuse the secret for now or add CRON_SECRET

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

        // effectively "downloading" the JSON
        // In a real Vercel Cron setup, we might want to POST this to an external storage (S3/R2/Supabase Storage)
        // because Vercel functions are ephemeral.
        // For now, we just return it as JSON so the user can "curl" it or we can log it.
        // Or better: We log the success and maybe send it to an email if configured? 
        // Returning JSON is the simplest "pull" backup.

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
