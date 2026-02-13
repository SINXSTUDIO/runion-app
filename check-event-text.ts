
import { prisma } from './src/lib/prisma';

async function checkEventText() {
    console.log('Listing all events and their confirmation email text:');

    const events = await prisma.event.findMany({
        select: {
            id: true,
            title: true,
            slug: true,
            confirmationEmailText: true
        }
    });

    if (events.length === 0) {
        console.log('No events found.');
        return;
    }

    events.forEach(e => {
        console.log('------------------------------------------------');
        console.log(`ID: ${e.id}`);
        console.log(`Title: ${e.title}`);
        console.log(`Slug: ${e.slug}`);
        console.log(`Confirmation Text Length: ${e.confirmationEmailText?.length || 0}`);
        if (e.confirmationEmailText) {
            console.log(`Preview: "${e.confirmationEmailText.substring(0, 50).replace(/\n/g, ' ')}..."`);
        } else {
            console.log(`Status: NULL/EMPTY`);
        }
    });
}

checkEventText()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
