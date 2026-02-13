
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixEvent() {
    try {
        const schillerId = '15ca7278-ce1a-4f24-a292-a2e2a12ff33b';
        const sellerId = '2291a15b-5de5-4a7f-a5ef-dbb458bf5469'; // Balatonfüred AC

        console.log(`Fixing event ${schillerId} with seller ${sellerId}...`);

        const updated = await prisma.event.update({
            where: { id: schillerId },
            data: { sellerId: sellerId }
        });

        console.log('Update successful!');
        console.log(`New SellerId: ${updated.sellerId}`);
    } catch (e) {
        console.error('Fix failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

fixEvent();
