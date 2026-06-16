
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
    const email = 'agent@runion.eu';
    const password = 'Password123!';
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            role: Role.ADMIN,
            passwordHash,
            deletedAt: null // Restore if soft-deleted
        },
        create: {
            email,
            passwordHash,
            firstName: 'Agent',
            lastName: 'User',
            role: Role.ADMIN,
        }
    });

    console.log(`User ${email} created/updated with password: ${password}`);
}

createAdmin()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
