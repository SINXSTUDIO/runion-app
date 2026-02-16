const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Searching for Bank Details in Event Descriptions ---');
    const events = await prisma.event.findMany({
        where: {
            OR: [
                { description: { contains: 'szám', mode: 'insensitive' } },
                { description: { contains: 'bank', mode: 'insensitive' } }
            ]
        }
    });

    if (events.length === 0) {
        console.log("No events found with 'szám' or 'bank' in description.");
    }

    events.forEach(e => {
        console.log(`Event: ${e.title}`);
        console.log(`Organizer: ${e.organizerName}`);
        console.log(`SellerID: ${e.sellerId}`);
        console.log(`Description Snippet:`);
        const desc = e.description || '';
        // Find matches specifically for patterns looking like bank accounts or names
        const matchKey = desc.match(/(számlaszám|kedvezményezett|bank)/i);
        if (matchKey) {
            const idx = matchKey.index;
            console.log(desc.substring(Math.max(0, idx - 50), Math.min(desc.length, idx + 150)));
        }
        console.log('---');
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
