const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const sellers = await prisma.seller.findMany();
    console.log('--- SELLERS ---');
    sellers.forEach(s => {
        console.log(`ID: ${s.id}`);
        console.log(`Name: ${s.name}`);
        console.log(`Active: ${s.active}`);
        console.log('---');
    });

    const events = await prisma.event.findMany({
        where: {
            OR: [
                { title: { contains: 'Bakony', mode: 'insensitive' } },
                { description: { contains: 'Bakony', mode: 'insensitive' } }
            ]
        },
        select: { id: true, title: true, sellerId: true }
    });
    console.log('\n--- EVENTS (Bakony) ---');
    console.log(events);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
