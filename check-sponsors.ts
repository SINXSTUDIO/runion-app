
import { prisma } from './src/lib/prisma';

async function checkSponsors() {
    console.log('Listing all Sponsors (Támogatók):');

    const sponsors = await prisma.sponsor.findMany({
        orderBy: { order: 'asc' }
    });

    if (sponsors.length === 0) {
        console.log('No sponsors found in database.');
        return;
    }

    console.log(`Found ${sponsors.length} sponsors.`);
    console.log(JSON.stringify(sponsors, null, 2));
}

checkSponsors()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
