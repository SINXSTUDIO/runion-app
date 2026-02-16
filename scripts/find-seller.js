const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const name = "Balatonfüredi Atlétikai Club";
    console.log(`Searching for: ${name}`);
    const seller = await prisma.seller.findFirst({
        where: {
            name: { contains: 'Balatonfüredi', mode: 'insensitive' }
        }
    });
    console.log(seller);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
