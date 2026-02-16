const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Deep Search in JSON fields ---');
    const events = await prisma.event.findMany({
        select: { title: true, extras: true, infopack: true, formConfig: true }
    });

    events.forEach(e => {
        const jsonStr = JSON.stringify([e.extras, e.infopack, e.formConfig]);
        if (jsonStr.match(/Bakony/i) || jsonStr.match(/számlaszám/i)) {
            console.log(`Match in Event: ${e.title}`);
            const match = jsonStr.match(/.{0,50}(Bakony|számlaszám).{0,100}/i);
            console.log(`Snippet: ${match ? match[0] : '...'}`);
        }
    });

    console.log('\n--- Checking Users ---');
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { firstName: { contains: 'Bakony', mode: 'insensitive' } },
                { lastName: { contains: 'Bakony', mode: 'insensitive' } },
                { billingName: { contains: 'Bakony', mode: 'insensitive' } },
                { clubName: { contains: 'Bakony', mode: 'insensitive' } }
            ]
        },
        select: { id: true, firstName: true, lastName: true, clubName: true, billingName: true }
    });
    users.forEach(u => console.log(u));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
