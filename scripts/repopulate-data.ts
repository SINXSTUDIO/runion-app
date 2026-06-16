
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking database content...');

    const partnerCount = await prisma.partner.count();
    console.log(`Partners: ${partnerCount}`);

    const sponsorCount = await prisma.sponsor.count();
    console.log(`Sponsors: ${sponsorCount}`);

    const featureCount = await prisma.homepageFeature.count();
    console.log(`Features: ${featureCount}`);

    if (partnerCount === 0) {
        console.log('Seeding partners...');
        await prisma.partner.createMany({
            data: [
                { name: 'Partner 1', logoUrl: '/placeholder-logo.png', order: 1, active: true },
                { name: 'Partner 2', logoUrl: '/placeholder-logo.png', order: 2, active: true },
            ]
        });
    }

    if (sponsorCount === 0) {
        console.log('Seeding sponsors...');
        await prisma.sponsor.createMany({
            data: [
                { name: 'Sponsor 1', logoUrl: '/placeholder-logo.png', order: 1, active: true },
                { name: 'Sponsor 2', logoUrl: '/placeholder-logo.png', order: 2, active: true },
            ]
        });
    }

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

    console.log('Done!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
