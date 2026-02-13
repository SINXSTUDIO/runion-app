
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2] || 'gate75@freemail.hu'; // Default to user's email if not provided
    const tierName = process.argv[3] || 'VIP';

    console.log(`Assigning ${tierName} tier to user ${email}...`);

    const tier = await prisma.membershipTier.findUnique({
        where: { name: tierName },
    });

    if (!tier) {
        console.error(`Tier '${tierName}' not found. Available tiers:`);
        const tiers = await prisma.membershipTier.findMany();
        console.log(tiers.map(t => t.name).join(', '));
        return;
    }

    const user = await prisma.user.update({
        where: { email },
        data: { membershipTierId: tier.id },
    });

    console.log(`User ${user.email} updated to tier ${tierName}.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
