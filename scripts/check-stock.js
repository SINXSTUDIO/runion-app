const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    try {
        const products = await prisma.product.findMany({
            select: { id: true, name: true, stock: true }
        });
        console.log('--- PRODUCTS ---');
        console.table(products);

        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            take: 2,
            include: { items: true }
        });
        console.log('--- RECENT ORDERS ---');
        console.debug(JSON.stringify(orders, null, 2));
    } catch (e) { console.error(e); } finally { await prisma.$disconnect(); }
}
main();
