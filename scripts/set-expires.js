
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2] || 'gate75@freemail.hu';
    const years = parseInt(process.argv[3] || '1');

    console.log(`Setting expiration for user ${email} to ${years} year(s) from now...`);

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + years);

    const user = await prisma.user.update({
        where: { email },
        data: { membershipExpiresAt: expiresAt },
    });

    console.log(`User ${user.email} membership expires at: ${user.membershipExpiresAt}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
