const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- ALL EVENTS ---');
    const events = await prisma.event.findMany({
        select: { id: true, title: true, organizerName: true, sellerId: true }
    });
    events.forEach(e => {
        console.log(`ID: ${e.id}`);
        console.log(`Title: ${e.title}`);
        console.log(`Organizer: ${e.organizerName}`);
        console.log(`SellerID: ${e.sellerId}`);
        console.log('---');
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
