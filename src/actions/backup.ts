
'use server';

import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-checks';
import { revalidatePath } from 'next/cache';

export async function createBackup() {
    await requireAdmin();

    try {
        // Fetch all data in parallel
        const [
            users,
            events,
            distances,
            products,
            partners,
            sponsors,
            features,
            registrations,
            orders,
            faqs,
            galleryImages,
            globalSettings,
            sellers
        ] = await Promise.all([
            prisma.user.findMany(),
            prisma.event.findMany(),
            prisma.distance.findMany(),
            prisma.product.findMany(),
            prisma.partner.findMany(),
            prisma.sponsor.findMany(),
            prisma.homepageFeature.findMany(),
            prisma.registration.findMany(),
            prisma.order.findMany(),
            prisma.fAQ.findMany(),
            prisma.galleryImage.findMany(),
            prisma.globalSettings.findMany(),
            prisma.seller.findMany()
        ]);

        const backupData = {
            metadata: {
                version: '1.0',
                timestamp: new Date().toISOString(),
                source: 'runion-system'
            },
            data: {
                users,
                events,
                distances,
                products,
                partners,
                sponsors,
                features,
                registrations,
                orders,
                faqs,
                galleryImages,
                globalSettings,
                sellers
            }
        };

        return { success: true, backup: JSON.stringify(backupData, null, 2) };
    } catch (error) {
        console.error('Backup creation failed:', error);
        return { success: false, error: 'Failed to create backup' };
    }
}

export async function restoreBackup(jsonString: string) {
    await requireAdmin();

    try {
        const parsed = JSON.parse(jsonString);
        const data = parsed.data;

        if (!data) {
            return { success: false, error: 'Invalid backup format' };
        }

        // Restore Order matters! (Refs: User -> Event -> Distance -> Registration)
        // We use transaction to ensure consistency

        // This is a complex operation. Upserting thousands of records might timeout in one transaction if huge.
        // But for this scale it's likely fine.
        // Warning: We are NOT deleting data, only Upserting (Restoring missing/updating existing).

        await prisma.$transaction(async (tx) => {
            // 1. Users (Base)
            if (data.users?.length) {
                for (const item of data.users) {
                    await tx.user.upsert({
                        where: { id: item.id },
                        create: { ...item },
                        update: { ...item }
                    });
                }
            }

            // 2. Events (Depends on User/Organizer)
            if (data.events?.length) {
                for (const item of data.events) {
                    await tx.event.upsert({
                        where: { id: item.id },
                        create: { ...item },
                        update: { ...item }
                    });
                }
            }

            // 3. Distances (Depends on Event)
            if (data.distances?.length) {
                for (const item of data.distances) {
                    // Check if event exists (it should due to step 2)
                    await tx.distance.upsert({
                        where: { id: item.id },
                        create: { ...item },
                        update: { ...item }
                    });
                }
            }

            // 4. Products
            if (data.products?.length) {
                for (const item of data.products) {
                    await tx.product.upsert({
                        where: { id: item.id },
                        create: { ...item },
                        update: { ...item }
                    });
                }
            }

            // 5. Partners
            if (data.partners?.length) {
                for (const item of data.partners) {
                    await tx.partner.upsert({
                        where: { id: item.id },
                        create: { ...item },
                        update: { ...item }
                    });
                }
            }

            // 6. Sponsors
            if (data.sponsors?.length) {
                for (const item of data.sponsors) {
                    await tx.sponsor.upsert({
                        where: { id: item.id },
                        create: { ...item },
                        update: { ...item }
                    });
                }
            }

            // 7. Features
            if (data.features?.length) {
                for (const item of data.features) {
                    await tx.homepageFeature.upsert({
                        where: { id: item.id },
                        create: { ...item },
                        update: { ...item }
                    });
                }
            }

            // 8. Registrations (Depends on User, Distance)
            if (data.registrations?.length) {
                for (const item of data.registrations) {
                    await tx.registration.upsert({
                        where: { id: item.id },
                        create: { ...item },
                        update: { ...item }
                    });
                }
            }

            // 9. Orders (Depends on User)
            if (data.orders?.length) {
                for (const item of data.orders) {
                    await tx.order.upsert({
                        where: { id: item.id },
                        create: { ...item },
                        update: { ...item }
                    });
                }
            }

            // 10. Settings & Others
            if (data.globalSettings?.length) {
                for (const item of data.globalSettings) {
                    await tx.globalSettings.upsert({
                        where: { id: item.id },
                        create: { ...item },
                        update: { ...item }
                    });
                }
            }

            // 11. Sellers (Important for event bank details)
            if (data.sellers?.length) {
                for (const item of data.sellers) {
                    await tx.seller.upsert({
                        where: { id: item.id },
                        create: { ...item },
                        update: { ...item }
                    });
                }
            }
        }, {
            maxWait: 5000,
            timeout: 20000 // 20s timeout for restore
        });

        revalidatePath('/');
        return { success: true };

    } catch (error) {
        console.error('Restore failed:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown restore error' };
    }
}
