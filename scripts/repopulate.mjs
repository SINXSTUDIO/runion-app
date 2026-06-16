
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Restoring basic data...');

    // Features
    const featureCount = await prisma.homepageFeature.count();
    if (featureCount === 0) {
        console.log('Seeding features...');
        await prisma.homepageFeature.createMany({
            data: [
                {
                    iconName: 'Trophy',
                    title: 'Prémium Versenyek',
                    description: 'Hivatalos MKSZ versenyek, profi szervezés és felejthetetlen élmények várnak minden indulót.',
                    order: 1,
                    active: true
                },
                {
                    iconName: 'Timer',
                    title: 'Profi Időmérés',
                    description: 'A legmodernebb chip-es időmérés, azonnali eredmények és részletes statisztikák.',
                    order: 2,
                    active: true
                },
                {
                    iconName: 'Users',
                    title: 'Szuper Közösség',
                    description: 'Csatlakozz több ezer futóhoz az ország minden pontjáról. Közös edzések és programok.',
                    order: 3,
                    active: true
                },
            ]
        });
    }

    // Partners (Placeholders to fix UI)
    const partnerCount = await prisma.partner.count();
    if (partnerCount === 0) {
        await prisma.partner.createMany({
            data: [
                { name: 'Partner Helykitöltő 1', logoUrl: '/uploads/placeholder.png', order: 1, active: true },
                { name: 'Partner Helykitöltő 2', logoUrl: '/uploads/placeholder.png', order: 2, active: true },
            ]
        });
    }

    console.log('Restoration complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
