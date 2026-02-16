const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Global Settings ---');
    const settings = await prisma.globalSettings.findFirst();
    console.log(settings);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
