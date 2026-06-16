
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Restoring Event Skeleton...');

    // Get Admin User for organizer
    const organizer = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!organizer) {
        console.error('No Admin user found! Cannot assign organizer.');
        return;
    }

    const slug = 'buff-ceus-72h-world-cup';
    const existing = await prisma.event.findUnique({ where: { slug } });

    if (!existing) {
        console.log(`Creating ${slug}...`);
        await prisma.event.create({
            data: {
                slug: slug,
                title: 'BUFF-CEUS 72H World Cup',
                description: 'A 72 órás világbajnokság. (Helyreállított váz - Kérlek töltsd ki a részleteket!)',
                location: 'Balatonfüred',
                eventDate: new Date('2026-09-01T12:00:00Z'), // Placeholder date
                regDeadline: new Date('2026-08-30T23:59:00Z'),
                organizerId: organizer.id,
                status: 'DRAFT', // Safe default
                coverImage: '/uploads/buff2026.jpg', // From upload logs
                ogImage: '/uploads/buff2026facebook.jpg', // From upload logs
            }
        });
        console.log('Event skeleton created.');
    } else {
        console.log('Event already exists.');
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
