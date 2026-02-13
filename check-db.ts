import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Connecting to database...');
    try {
        const events = await prisma.event.findMany();
        console.log(`Total events in DB: ${events.length}`);

        // Sort by date desc
        events.sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime());

        let found = false;
        events.forEach(e => {
            const isMatch = e.title.toLowerCase().includes('buf') || e.title.includes('72');
            if (isMatch) {
                console.log('\n!!! FOUND MATCH !!!');
                console.log(`ID: ${e.id}`);
                console.log(`Title: ${e.title}`);
                console.log(`Slug: ${e.slug}`);
                console.log(`Status: ${e.status}`);
                console.log(`OrganizerId: ${e.organizerId}`);
                console.log(`Date: ${e.eventDate.toISOString()}`);
                found = true;
            } else {
                // console.log(`- ${e.title} (${e.status})`);
            }
        });

        if (!found) {
            console.log('\nNO EVENT MATCHING "Buf" OR "72" FOUND.');
            console.log('Listing all events for reference:');
            events.forEach(e => console.log(`- ${e.title} [${e.status}]`));
        }

    } catch (e) {
        console.error('Error querying DB:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
