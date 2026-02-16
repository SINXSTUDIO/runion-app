const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- EVENTS by Organizer ---');
    const events = await prisma.event.findMany({
        where: {
            organizerName: { contains: 'Bakony', mode: 'insensitive' }
        },
        include: {
            seller: true
        }
    });

    events.forEach(e => {
        console.log(`Event: ${e.title}`);
        console.log(`OrganizerName: ${e.organizerName}`);
        console.log(`SellerID: ${e.sellerId}`);
        console.log(`Seller: ${e.seller?.name}`);
        console.log(`Seller Bank: ${e.seller?.bankName}`);
        console.log('---');
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
