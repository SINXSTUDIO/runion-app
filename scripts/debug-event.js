
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEvent() {
    try {
        const events = await prisma.event.findMany({
            include: { seller: true }
        });

        console.log('--- EVENT DEBUG ---');
        console.log(`Found ${events.length} events matching "Schiller"`);

        for (const e of events) {
            console.log(`\nID: ${e.id}`);
            console.log(`Title: ${e.title}`);
            console.log(`SellerID: ${e.sellerId}`);
            console.log(`Seller Name: ${e.seller ? e.seller.name : 'NULL'}`);
            console.log('-------------------');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkEvent();
