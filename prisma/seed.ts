import { PrismaClient, Role, EventStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 0. Ensure Global Settings exist
    const settings = await prisma.globalSettings.findFirst();
    if (!settings) {
        await prisma.globalSettings.create({
            data: {
                shopEnabled: true,
                cancellationEnabled: false,
                // Removed fields that are not in schema: emailHost, emailPort, emailUser, emailSecure
            }
        });
        console.log('Global Settings created.');
    }
    const standardTier = await prisma.membershipTier.upsert({
        where: { name: 'Standard' },
        update: {},
        create: {
            name: 'Standard',
            price: 5000,
            discountPercentage: 0,
            discountAmount: 0,
            description: 'Alap tagság',
            durationMonths: 12,
            features: JSON.stringify(['Kedvezményes nevezés']),
        },
    });

    const vipTier = await prisma.membershipTier.upsert({
        where: { name: 'VIP' },
        update: {},
        create: {
            name: 'VIP',
            price: 15000,
            discountPercentage: 10,
            discountAmount: 0,
            description: 'VIP tagság extra kedvezményekkel',
            durationMonths: 12,
            features: JSON.stringify(['Kiemelt rajtzóna', 'Ingyenes póló']),
        },
    });

    // 2. Create Admin User (Using a known placeholder, user can change later)
    // The user mentioned the previous admin data was different.
    // We recreate a default admin and print credentials.
    const adminEmail = process.env.ADMIN_EMAIL || 'szkami75@gmail.com';
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Peremala01+', 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            role: Role.ADMIN,
            passwordHash: adminPassword, // Ensure password is updated even if user exists
            firstName: 'Admin', // Reset name if needed or keep existing? Let's reset to ensure access
            lastName: 'User'
        },
        create: {
            email: adminEmail,
            passwordHash: adminPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: Role.ADMIN,
            membershipTierId: vipTier.id,
            membershipEnd: new Date('2030-01-01'),
        },
    });

    console.log({ adminResult: admin });

    // 3. Create Partners
    // 'website' field does not exist on Partner model based on schema, removing it.
    const partners = [
        { name: 'Adidas', description: 'Hivatalos sportruházat partner' },
        { name: 'Garmin', description: 'Időmérés és navigáció' },
        { name: 'BioTechUSA', description: 'Táplálékkiegészítő partner' },
        // Add missing partners from user logs
        { name: 'KAHU', description: 'KAHU SE' },
        { name: 'Balatonfüredi AC', description: 'Balatonfüredi Atlétikai Club' },
        { name: 'BakonyOrszág', description: 'Bakony és Balaton Térségi TDM' },
    ];

    for (const p of partners) {
        // Use findFirst + update/create or just skip if exists?
        // Since schema doesn't have unique name, create will duplicate.
        // Let's try to find first by name.
        const existing = await prisma.partner.findFirst({ where: { name: p.name } });
        if (!existing) {
            await prisma.partner.create({
                data: {
                    name: p.name,
                    active: true,
                    logoUrl: '',
                },
            });
        }
    }

    // 4. Create Events
    const events = [
        {
            name: 'Budapest Maraton',
            slug: 'budapest-maraton-2026',
            date: new Date('2026-10-10'),
            location: 'Budapest, Hősök tere',
            description: 'A legnagyobb futóverseny Magyarországon.',
            distance: 42195,
            price: 15000,
            capacity: 5000,
            status: EventStatus.PUBLISHED,
        },
        {
            name: 'Balaton Szupermaraton',
            slug: 'balaton-szupermaraton-2026',
            date: new Date('2026-03-20'),
            location: 'Siófok',
            description: 'Kerüld meg a Balatont 4 nap alatt!',
            distance: 196000,
            price: 45000,
            capacity: 2000,
            status: EventStatus.PUBLISHED,
        },
        {
            name: 'Éjszakai Futás',
            slug: 'ejszakai-futas-2026',
            date: new Date('2026-06-15'),
            location: 'Budapest, Várkert Bazár',
            description: 'Hangulatos esti futás a Duna partján.',
            distance: 10000,
            price: 8000,
            capacity: 3000,
            status: EventStatus.PUBLISHED,
        },
    ];

    for (const e of events) {
        // Use upsert based on slug (which is unique)
        const eventInput = {
            title: e.name, // Schema uses title, not name
            eventDate: e.date,
            regDeadline: new Date(e.date.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week before
            location: e.location,
            description: e.description,
            status: 'PUBLISHED' as EventStatus,
            organizer: {
                connect: { id: admin.id }
            },
            // For simplified seeding, we create relations only on create.
            // Updating complex relations in upsert is tricky without deleting first.
        };

        const existingEvent = await prisma.event.findUnique({ where: { slug: e.slug } });

        if (!existingEvent) {
            await prisma.event.create({
                data: {
                    ...eventInput,
                    slug: e.slug,
                    distances: {
                        create: [
                            {
                                name: 'Egyéni',
                                price: e.price,
                                capacityLimit: e.capacity,
                                startTime: e.date
                            },
                        ]
                    },
                    seller: {
                        create: {
                            name: 'RUNION SE',
                            address: '1000 Budapest, Futó u. 1.',
                            bankName: 'OTP Bank',
                            bankAccountNumber: '11700000-00000000',
                            taxNumber: '12345678-1-42',
                        }
                    }
                },
            });
        } else {
            // Update basic fields
            await prisma.event.update({
                where: { slug: e.slug },
                data: {
                    title: e.name,
                    eventDate: e.date,
                    location: e.location,
                    description: e.description,
                }
            });
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
