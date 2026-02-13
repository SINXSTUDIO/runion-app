
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        // Fix Schiller
        await prisma.event.update({
            where: { id: '15ca7278-ce1a-4f24-a292-a2e2a12ff33b' },
            data: { coverImage: '/schiller-cover.jpg' }
        });
        console.log('Updated Schiller cover image to /schiller-cover.jpg');

        // Check Buff-Ceus events
        const buffEvents = await prisma.event.findMany({
            where: {
                id: { in: ['85c7c44e-a03f-4f83-800a-0a82ea59f197', '80e33fdd-3b62-4ae0-a493-e0b72cc4cac1'] }
            }
        });
        console.log('Buff-Ceus events:', buffEvents.map(e => e.coverImage));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
