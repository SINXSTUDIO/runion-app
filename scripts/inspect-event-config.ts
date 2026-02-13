
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const reg = await prisma.registration.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { distance: { include: { event: true } } }
    });

    if (!reg) {
        console.error('Registration not found');
        return;
    }

    console.log('Event Title:', reg.distance.event.title);
    console.log('Form Config:', JSON.stringify(reg.distance.event.formConfig, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
