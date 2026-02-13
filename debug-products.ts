
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany();
    console.log('Products in DB:');
    products.forEach(p => {
        console.log(`ID: ${p.id}, Slug: ${p.slug}, Active: ${p.active}, Name: ${p.name}`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
