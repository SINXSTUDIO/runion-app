
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Hardcoded backup data from Feb 13 to be embedded here
// Since I cannot read files easily in Vercel edge/serverless without bundling, 
// I will embed the JSON data directly.
// WARNING: This file will be large.

// Shortened version for brevity in this step, I will need to read the backup file and inject it.
// Actually, I can use `import` to load the JSON if I put it in `src`.

import backupData from '@/../backups/daily/backup-2026-02-13.json';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'runion_restore_secret_2026'}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        console.log('Starting Emergency Restore...');
        const data = backupData as any;

        // 1. Restore Sellers
        console.log('Restoring Sellers...');
        for (const seller of data.sellers) {
            await prisma.seller.upsert({
                where: { id: seller.id },
                update: seller,
                create: seller
            });
        }

        // 2. Restore Global Settings
        if (data.globalSettings) {
            console.log('Restoring Global Settings...');
            const settings = data.globalSettings;
            // Clean relations
            delete (settings as any).membershipSeller;
            delete (settings as any).transferSeller;
            delete (settings as any).featuredEvent;

            await prisma.globalSettings.upsert({
                where: { id: settings.id },
                update: settings,
                create: settings
            });
        }

        // 3. Restore Users
        console.log('Restoring Users...');
        for (const user of data.users) {
            const { accounts, sessions, ...userData } = user;
            await prisma.user.upsert({
                where: { email: user.email },
                update: userData,
                create: userData
            });
        }

        // 4. Restore Events
        console.log('Restoring Events...');
        for (const event of data.events) {
            const { distances: _d, ...cleanEventData } = event;
            delete (cleanEventData as any).organizer;
            delete (cleanEventData as any).seller;
            delete (cleanEventData as any).sellerEuro;

            await prisma.event.upsert({
                where: { id: event.id },
                update: cleanEventData,
                create: {
                    ...cleanEventData,
                    infopackActive: false
                }
            });
        }

        // 5. Restore Distances
        console.log('Restoring Distances...');
        for (const distance of data.distances) {
            const { priceTiers, ...distanceData } = distance;
            delete (distanceData as any).event;

            await prisma.distance.upsert({
                where: { id: distance.id },
                update: distanceData,
                create: distanceData
            });

            // Restore PriceTiers
            if (priceTiers && priceTiers.length > 0) {
                for (const tier of priceTiers) {
                    delete (tier as any).distance;
                    await prisma.priceTier.upsert({
                        where: { id: tier.id },
                        update: tier,
                        create: tier
                    });
                }
            }
        }

        // 6. Restore Partners
        if (data.partners) {
            for (const partner of data.partners) {
                await prisma.partner.upsert({
                    where: { id: partner.id },
                    update: partner,
                    create: partner
                });
            }
        }

        // 7. Restore Products
        if (data.products) {
            for (const product of data.products) {
                const { orderItems, ...productData } = product;
                await prisma.product.upsert({
                    where: { id: product.id },
                    update: productData,
                    create: productData
                });
            }
        }


        // Force reset admin password
        const email = 'szkami75@gmail.com';
        const passwordHash = await bcrypt.hash('Peremala01+', 10);
        await prisma.user.update({
            where: { email },
            data: {
                passwordHash,
                deletedAt: null,
                role: 'ADMIN',
                tokenVersion: { increment: 1 }
            }
        });

        return NextResponse.json({ success: true, message: 'Restore completed successfully' });
    } catch (error: any) {
        console.error('Restore failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
