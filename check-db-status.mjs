
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- DB CHECK START ---');

        // Count records
        const partnerCount = await prisma.partner.count();
        const sponsorCount = await prisma.sponsor.count();
        const eventCount = await prisma.event.count();

        console.log(`Partners: ${partnerCount}`);
        console.log(`Sponsors: ${sponsorCount}`);
        console.log(`Events: ${eventCount}`);

        // List events to find Bufceus
        const events = await prisma.event.findMany({ select: { title: true, slug: true, status: true } });
        console.log('Events List:', JSON.stringify(events, null, 2));

        // List partners
        if (partnerCount > 0) {
            const partners = await prisma.partner.findMany({ take: 3 });
            console.log('Sample Partners:', JSON.stringify(partners, null, 2));
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
