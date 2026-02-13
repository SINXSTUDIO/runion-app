import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setAdmin() {
    const email = process.argv[2];

    if (!email) {
        console.error('Usage: npx tsx src/scripts/set-admin.ts <email>');
        process.exit(1);
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.error(`User not found with email: ${email}`);
            process.exit(1);
        }

        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' }
        });

        console.log(`Success! User ${updatedUser.email} is now an ${updatedUser.role}.`);

    } catch (error) {
        console.error('Error updating user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setAdmin();
