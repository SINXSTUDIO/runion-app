const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const sellers = await prisma.seller.findMany();
    console.log('--- SELLERS ---');
    sellers.forEach(s => {
        console.log(`ID: ${s.id}`);
        console.log(`Name: ${s.name}`);
        console.log(`Bank: ${s.bankName}`);
        console.log(`Account: ${s.bankAccountNumber}`);
        console.log(`Active: ${s.active}`);
        console.log('---');
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
