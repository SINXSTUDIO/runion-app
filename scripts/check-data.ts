
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkData() {
    const userCount = await prisma.user.count();
    const eventCount = await prisma.event.count();
    const registrationCount = await prisma.registration.count();

    console.log('Database Status:', {
        users: userCount,
        events: eventCount,
        registrations: registrationCount
    });
}

checkData()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
