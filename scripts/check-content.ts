
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkContent() {
    try {
        const partnerCount = await prisma.partner.count();
        const sponsorCount = await prisma.sponsor.count();
        const partners = await prisma.partner.findMany();
        const sponsors = await prisma.sponsor.findMany();

        console.log(`--- ANALYSIS START ---`);
        console.log(`Partner Count: ${partnerCount}`);
        console.log(`Sponsor Count: ${sponsorCount}`);

        if (partnerCount > 0) {
            console.log('First Partner:', JSON.stringify(partners[0], null, 2));
        }
        if (sponsorCount > 0) {
            console.log('First Sponsor:', JSON.stringify(sponsors[0], null, 2));
        }
        console.log(`--- ANALYSIS END ---`);
    } catch (e) {
        console.error('Error querying DB:', e);
    } finally {
        await prisma.$disconnect();
    }
}

checkContent();
