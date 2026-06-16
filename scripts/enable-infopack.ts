
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function enableInfopack() {
    const event = await prisma.event.findFirst({
        where: { slug: 'schiller-szerelmes-fured-2026' }
    });

    if (!event) return;

    await prisma.event.update({
        where: { id: event.id },
        data: { infopackActive: true }
    });
    console.log('Infopack enabled for', event.title);
}

enableInfopack()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
