
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkEvents() {
    const events = await prisma.event.findMany({
        include: {
            distances: true,
            organizer: true,
            seller: true,
            sellerEuro: true
        }
    });

    console.log(`Found ${events.length} events.`);

    for (const event of events) {
        console.log(`Event: ${event.title} (${event.slug})`);
        console.log(`- Distances: ${event.distances?.length ?? 'UNDEFINED'}`);
        console.log(`- Organizer: ${event.organizer?.email ?? 'MISSING'}`);
        console.log(`- Seller: ${event.seller?.name ?? 'MISSING'}`);
        console.log(`- SellerEuro: ${event.sellerEuro?.name ?? 'MISSING/NULL'}`);
        console.log(`- Infopack:`, event.infopack ? 'PRESENT' : 'NULL');
        console.log(`- InfopackActive:`, event.infopackActive);

        if (!event.distances) console.error('CRITICAL: Distances missing!');
        if (!event.organizer) console.error('CRITICAL: Organizer missing!');

        // Check for nulls in required fields if any (schema enforces mostly)
    }
}

checkEvents()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
