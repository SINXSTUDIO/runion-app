
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const tiers = [
        { name: 'Standard', discountPercentage: 0, price: 0, description: 'Alap tagság' },
        { name: 'Bronz', discountPercentage: 5, price: 5000, description: 'Bronz fokozatú tagság' },
        { name: 'Ezüst', discountPercentage: 10, price: 10000, description: 'Ezüst fokozatú tagság' },
        { name: 'Arany', discountPercentage: 15, price: 20000, description: 'Arany fokozatú tagság' },
        { name: 'VIP', discountPercentage: 20, price: 50000, description: 'Kiemelt VIP tagság' },
    ];

    console.log('Seeding membership tiers...');

    for (const tier of tiers) {
        const upsertedTier = await prisma.membershipTier.upsert({
            where: { name: tier.name },
            update: tier,
            create: tier,
        });
        console.log(`Upserted tier: ${upsertedTier.name}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
