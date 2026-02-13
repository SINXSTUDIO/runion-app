
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        where: { active: true },
        select: { name: true, description: true, descriptionEn: true, descriptionDe: true }
    });

    console.log('--- PRODUCTS ---');
    for (const p of products) {
        console.log(`Name: ${p.name}`);
        console.log(`Description (JSON): ${JSON.stringify(p.description)}`);
        // console.log(`DescriptionEn: ${p.descriptionEn}`);
        // console.log(`DescriptionDe: ${p.descriptionDe}`);
        console.log('----------------');
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
