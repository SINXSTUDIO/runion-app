
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
    const email = 'szkami75@gmail.com';
    const password = 'Peremala01+';
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
        where: { email },
        data: {
            passwordHash,
            role: 'ADMIN',
            deletedAt: null,
            tokenVersion: { increment: 1 } // Invalidate old sessions
        }
    });

    console.log(`Password reset for ${email}. New hash set. Token version incremented.`);
}

resetPassword()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
