
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const events = await prisma.event.findMany({
            select: {
                id: true,
                title: true,
                coverImage: true,
                slug: true,
                status: true
            }
        });
        console.log(JSON.stringify(events, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
