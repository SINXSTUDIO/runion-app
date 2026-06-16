
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUser() {
    const email = 'szkami75@gmail.com';
    const passwordInput = 'Peremala01+';

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log(`User not found: ${email}`);
            return;
        }

        console.log('User found:');
        console.log(`ID: ${user.id}`);
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`DeletedAt: ${user.deletedAt}`);
        console.log(`Has Password Hash: ${!!user.passwordHash}`);

        if (user.passwordHash) {
            const isMatch = await bcrypt.compare(passwordInput, user.passwordHash);
            console.log(`Password match for '${passwordInput}': ${isMatch}`);
        } else {
            console.log('User has no password hash set.');
        }

    } catch (error) {
        console.error('Error checking user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
