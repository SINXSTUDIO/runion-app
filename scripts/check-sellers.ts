import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSellers() {
    console.log('🔍 Checking Sellers in Database...\n');

    const sellers = await prisma.seller.findMany({
        where: { active: true },
        orderBy: { order: 'asc' }
    });

    if (sellers.length === 0) {
        console.log('❌ No sellers found in database!');
        console.log('Run: npx tsx prisma/seeds/sellers.ts');
    } else {
        console.log(`✅ Found ${sellers.length} sellers:\n`);
        sellers.forEach((s, index) => {
            console.log(`${index + 1}. ${s.name}`);
            console.log(`   Key: ${s.key}`);
            console.log(`   Bank: ${s.bankName}`);
            console.log(`   Account (HUF): ${s.bankAccountNumber}`);
            console.log(`   IBAN (HUF): ${s.iban}`);
            if (s.ibanEuro) {
                console.log(`   ✨ IBAN (EUR): ${s.ibanEuro}`);
            }
            console.log();
        });
    }

    await prisma.$disconnect();
}

checkSellers();
