import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
            email: true,
            passwordHash: true,
            createdAt: true,
            role: true
        }
    });

    console.log('Last 5 users:');
    users.forEach(u => {
        console.log(`Email: ${u.email}, HashLen: ${u.passwordHash?.length}, Role: ${u.role}, Created: ${u.createdAt}`);
    });
}

check()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
