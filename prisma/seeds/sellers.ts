import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sellers = [
    {
        key: 'kahu',
        name: 'KAHU Természet- és Állatvédő, Ifjúsági-, és Sportegyesület',
        address: '',
        bankName: 'OTP Bank',
        bankAccountNumber: '11748038-24826190',
        iban: 'HU19117480382482619000000000',
        bankAccountNumberEuro: null,
        ibanEuro: 'HU33117634885870488200000000', // KAHU Euro account
        order: 1,
        active: true,
    },
    {
        key: 'bac',
        name: 'Balatonfüredi Atlétikai Club',
        address: '',
        bankName: 'OTP Bank',
        bankAccountNumber: '11748069-25512412',
        iban: 'HU16117480692551241200000000',
        bankAccountNumberEuro: null,
        ibanEuro: null,
        order: 2,
        active: true,
    },
    {
        key: 'bbe',
        name: 'BakonyOrszág Balcsipart Kulturális és Sportegyesület',
        address: '',
        bankName: 'OTP Bank',
        bankAccountNumber: '11748007-24830210-00000000', // Full HUF account with dashes
        iban: 'HU67117480072483021000000000',
        bankAccountNumberEuro: null,
        ibanEuro: null,
        order: 3,
        active: true,
    },
];

async function seedSellers() {
    console.log('🌱 Seeding Sellers...');

    for (const sellerData of sellers) {
        const existing = await prisma.seller.findUnique({
            where: { key: sellerData.key },
        });

        if (existing) {
            console.log(`✅ Seller "${sellerData.name}" already exists, updating...`);
            await prisma.seller.update({
                where: { key: sellerData.key },
                data: sellerData,
            });
        } else {
            console.log(`➕ Creating Seller "${sellerData.name}"...`);
            await prisma.seller.create({
                data: sellerData,
            });
        }
    }

    console.log('✅ Sellers seeded successfully!');
}

seedSellers()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
