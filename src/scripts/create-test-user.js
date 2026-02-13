
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'test@runion.eu';
    const password = 'password123';
    // Hash password with salt rounds = 10
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: { passwordHash }, // Reset password if exists
        create: {
            email,
            passwordHash,
            firstName: 'Test',
            lastName: 'User',
            role: 'USER'
        }
    });

    console.log(`User upserted: ${user.email}`);
    console.log(`Password: ${password}`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
