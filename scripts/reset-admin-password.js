
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
    const email = 'szkami75@gmail.com';
    const newPassword = 'Peremala01+';

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await prisma.user.update({
            where: { email },
            data: {
                passwordHash: hashedPassword,
                role: 'ADMIN' // Ensure role is ADMIN just in case
            },
        });

        console.log(`Password reset successfully for user: ${user.email}`);
        console.log(`New hash set: ${hashedPassword.substring(0, 10)}...`);

    } catch (error) {
        console.error('Error resetting password:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetPassword();
