import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanSellers() {
    console.log('🧹 Cleaning old sellers...\n');

    // Delete all sellers
    const deleted = await prisma.seller.deleteMany({});
    console.log(`✅ Deleted ${deleted.count} sellers\n`);

    await prisma.$disconnect();
}

cleanSellers();
