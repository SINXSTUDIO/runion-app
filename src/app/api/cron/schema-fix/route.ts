
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const validSecret = process.env.CRON_SECRET || 'runion_restore_secret_2026';

    if (key !== validSecret) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        console.log('Starting Schema Repair...');

        // Event Table Fixes
        await prisma.$executeRawUnsafe(`ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "infopack" JSONB;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "infopackActive" BOOLEAN NOT NULL DEFAULT false;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "sellerEuroId" TEXT;`);

        // GlobalSettings Table Fixes
        await prisma.$executeRawUnsafe(`ALTER TABLE "GlobalSettings" ADD COLUMN IF NOT EXISTS "featuredEventActive" BOOLEAN NOT NULL DEFAULT false;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "GlobalSettings" ADD COLUMN IF NOT EXISTS "transferEmail" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "GlobalSettings" ADD COLUMN IF NOT EXISTS "transferSellerId" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "GlobalSettings" ADD COLUMN IF NOT EXISTS "featuredEventId" TEXT;`);

        // Seller Table Fixes
        await prisma.$executeRawUnsafe(`ALTER TABLE "Seller" ADD COLUMN IF NOT EXISTS "nameEuro" TEXT;`);

        return NextResponse.json({ success: true, message: 'Schema repair executed successfully' });
    } catch (error: any) {
        console.error('Schema repair failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
