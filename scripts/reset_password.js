const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createOrUpdateUser() {
    const email = 'klokkdeporofogbda@gmail.com';
    const password = 'Password123!';
    const hashedPassword = await bcrypt.hash(password, 10);
    const firstName = 'Miklós';
    const lastName = 'Szabó';

    // Upsert: Create if not exists, update if exists
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash: hashedPassword,
            deletedAt: null,
            emailVerified: new Date()
        },
        create: {
            email,
            passwordHash: hashedPassword,
            firstName,
            lastName,
            emailVerified: new Date(),
            role: 'USER'
        }
    });

    console.log('User upsert successful:', user.email);
    console.log('Password set to:', password);
}

createOrUpdateUser()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
