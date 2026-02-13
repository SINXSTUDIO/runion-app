'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function createFullBackup() {
    const session = await auth();

    // @ts-ignore
    if (!session?.user || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    try {
        const timestamp = new Date().toISOString();

        // Fetch all data concurrently
        const [
            users,
            events,
            registrations,
            products,
            orders,
            partners,
            homepageFeatures,
            galleryImages,
            sponsors,
            aboutPage,
            faqs,
            globalSettings,
            membershipTiers,
            sellers,
            distances,
            priceTiers
        ] = await Promise.all([
            prisma.user.findMany(),
            prisma.event.findMany({ include: { distances: { include: { priceTiers: true } } } }),
            prisma.registration.findMany(),
            prisma.product.findMany(),
            prisma.order.findMany({ include: { items: true } }),
            prisma.partner.findMany(),
            prisma.homepageFeature.findMany(),
            prisma.galleryImage.findMany(),
            prisma.sponsor.findMany(),
            prisma.aboutPage.findMany(),
            // @ts-ignore
            prisma.fAQ.findMany(),
            prisma.globalSettings.findMany(),
            prisma.membershipTier.findMany(),
            prisma.seller.findMany(),
            prisma.distance.findMany(),
            prisma.priceTier.findMany()
        ]);

        const backupData = {
            metadata: {
                timestamp,
                version: '1.0',
                generator: 'Runion Backup System'
            },
            data: {
                users,
                events,
                registrations,
                products,
                orders,
                partners,
                homepageFeatures,
                galleryImages,
                sponsors,
                aboutPage,
                faqs,
                globalSettings,
                membershipTiers,
                sellers,
                distances,
                priceTiers
            }
        };

        return {
            success: true,
            data: JSON.stringify(backupData, null, 2),
            filename: `runion_backup_${timestamp.replace(/[:.]/g, '-')}.json`
        };

    } catch (error) {
        console.error('Backup creation failed:', error);
        return { success: false, error: 'Backup failed' };
    }
}

export async function restoreFullBackup(formData: FormData) {
    const session = await auth();

    // @ts-ignore
    if (!session?.user || session.user.role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized' };
    }

    const file = formData.get('file') as File;
    if (!file) {
        return { success: false, error: 'No file provided' };
    }

    try {
        const text = await file.text();
        const json = JSON.parse(text);

        if (!json.data || !json.metadata) {
            return { success: false, error: 'Invalid backup format' };
        }

        const { data } = json;

        // Execute restore in a transaction
        // @ts-ignore
        await prisma.$transaction(async (tx) => {
            // 1. DELETE EVERYTHING (Reverse dependency order)
            // Child tables first
            await tx.orderItem.deleteMany();
            await tx.order.deleteMany();
            await tx.registration.deleteMany();
            // @ts-ignore
            await tx.notification.deleteMany();
            // @ts-ignore
            await tx.feedback.deleteMany();
            // @ts-ignore
            await tx.changeRequest.deleteMany();
            await tx.session.deleteMany();
            await tx.account.deleteMany();

            // Middle tables
            await tx.priceTier.deleteMany();
            await tx.distance.deleteMany();
            await tx.event.deleteMany();

            // Parent tables
            await tx.user.deleteMany();
            await tx.globalSettings.deleteMany();
            // @ts-ignore
            await tx.fAQ.deleteMany();
            // @ts-ignore
            await tx.aboutPage.deleteMany();
            // @ts-ignore
            await tx.sponsor.deleteMany();
            // @ts-ignore
            await tx.galleryImage.deleteMany();
            // @ts-ignore
            await tx.homepageFeature.deleteMany();
            await tx.partner.deleteMany();
            await tx.product.deleteMany();
            await tx.membershipTier.deleteMany();
            await tx.seller.deleteMany();

            // 2. INSERT EVERYTHING (Dependency order)

            // Helper to strip relations (arrays or objects) from data before createMany
            const clean = (arr: any[], relations: string[]) => {
                if (!arr || !Array.isArray(arr)) return [];
                return arr.map(item => {
                    const copy = { ...item };
                    relations.forEach(rel => delete copy[rel]);
                    return copy;
                });
            };

            // Independent tables
            if (data.sellers?.length) await tx.seller.createMany({ data: clean(data.sellers, []) });
            if (data.membershipTiers?.length) await tx.membershipTier.createMany({ data: clean(data.membershipTiers, []) });
            if (data.products?.length) await tx.product.createMany({ data: clean(data.products, []) });
            if (data.partners?.length) await tx.partner.createMany({ data: clean(data.partners, []) });
            // @ts-ignore
            if (data.homepageFeatures?.length) await tx.homepageFeature.createMany({ data: clean(data.homepageFeatures, []) });
            // @ts-ignore
            if (data.galleryImages?.length) await tx.galleryImage.createMany({ data: clean(data.galleryImages, []) });
            // @ts-ignore
            if (data.sponsors?.length) await tx.sponsor.createMany({ data: clean(data.sponsors, []) });
            // @ts-ignore
            if (data.aboutPage?.length) await tx.aboutPage.createMany({ data: clean(data.aboutPage, []) });
            // @ts-ignore
            if (data.faqs?.length) await tx.fAQ.createMany({ data: clean(data.faqs, []) });
            if (data.globalSettings?.length) await tx.globalSettings.createMany({ data: clean(data.globalSettings, []) });

            // Dependent tables
            if (data.users?.length) await tx.user.createMany({ data: clean(data.users, []) });

            // Events need Organizers (Users) and Sellers
            // Events in backup might have 'distances' relation included
            if (data.events?.length) {
                await tx.event.createMany({
                    data: clean(data.events, ['distances'])
                });
            }

            // Distances need Events
            // Distances in backup might have 'priceTiers' relation
            // Note: createFullBackup fetches distances via prisma.distance.findMany() separately which has NO includes, 
            // BUT if we used the one from event.distances it would have. 
            // We use standard data.distances. Just in case, clean it.
            if (data.distances?.length) {
                await tx.distance.createMany({
                    data: clean(data.distances, ['priceTiers', 'event', 'registrations'])
                });
            }

            // PriceTiers need Distances
            if (data.priceTiers?.length) {
                await tx.priceTier.createMany({
                    data: clean(data.priceTiers, ['distance'])
                });
            }

            // Registrations need Users and Distances
            if (data.registrations?.length) {
                await tx.registration.createMany({
                    data: clean(data.registrations, ['user', 'distance', 'event'])
                });
            }

            // Extract OrderItems from Orders if they are nested
            let allOrderItems: any[] = [];
            if (data.orders?.length) {
                // If items are nested in orders
                data.orders.forEach((o: any) => {
                    if (o.items && Array.isArray(o.items)) {
                        allOrderItems.push(...o.items);
                    }
                });

                // Create Orders (strip items)
                await tx.order.createMany({
                    data: clean(data.orders, ['items', 'user'])
                });
            }

            // Create OrderItems
            // If we extracted them from orders, use that. If backup format has top-level orderItems (future proof), use that.
            const itemsToCreate = allOrderItems.length > 0 ? allOrderItems : (data.orderItems || []);

            if (itemsToCreate.length > 0) {
                await tx.orderItem.createMany({
                    data: clean(itemsToCreate, ['order', 'product'])
                });
            }

        }, {
            maxWait: 5000,
            timeout: 60000
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Restore failed:', error);
        return { success: false, error: 'Restore failed' };
    }
}
