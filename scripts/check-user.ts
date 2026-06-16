import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function checkUser() {
    const email = 'szkami75@gmail.com';
    const password = 'Peremala01+';

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, role: true, deletedAt: true, passwordHash: true }
    });
    console.log('User check:', { ...user, passwordHash: 'REDACTED' });

    if (user && user.passwordHash) {
        const isValid = await bcrypt.compare(password, user.passwordHash);
        console.log('Password valid:', isValid);
    } else {
        console.log('User not found or no password hash');
    }
}

checkUser()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
