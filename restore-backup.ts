
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function restoreBackup() {
    const args = process.argv.slice(2);
    if (!args.includes('--force')) {
        console.error('❌ SAFETY ERROR: You must use the --force flag to run this destructive operation.');
        console.error('Usage: npx tsx restore-backup.ts --force');
        process.exit(1);
    }

    const backupPath = path.join(__dirname, 'backups', 'daily', 'backup-2026-02-13.json');
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    const data = backupData.data;

    console.log('Restoring from backup:', backupData.metadata.timestamp);

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
    console.log('Restoring Global Settings...');
    for (const setting of data.globalSettings) {
        // Remove ID from data to let DB handle it or upsert if ID is fixed
        // GlobalSetting usually singleton or limited rows.
        await prisma.globalSettings.upsert({
            where: { id: setting.id },
            update: setting,
            create: setting
        });
    }

    // 3. Restore Users
    console.log('Restoring Users...');
    for (const user of data.users) {
        // Handle potential missing relations like membershipTierId
        if (user.membershipTierId) {
            // Verify tier exists or set to null? 
            // Ideally we should restore tiers too if they were in backup. 
            // Backup doesn't seem to have membershipTiers key in the JSON I saw earlier
            // but user has null tier in the example.
            // If a user has a tier ID that doesn't exist, this will fail.
            // Let's assume standard tiers exist from seed or we set to null if fail.
            const tier = await prisma.membershipTier.findUnique({ where: { id: user.membershipTierId } });
            if (!tier) {
                console.warn(`MembershipTier ${user.membershipTierId} not found for user ${user.email}, setting to null`);
                user.membershipTierId = null;
            }
        }
        await prisma.user.upsert({
            where: { id: user.id },
            update: user,
            create: user
        });
    }

    // 4. Restore Events
    console.log('Restoring Events...');
    for (const event of data.events) {
        // const { distances, ...eventData } = event; // Removed this line to avoid conflict
        // Distances are in separate key in backup root, but also potentially in event object?
        // The backup shows 'distances' as reference arrays or similar?
        // No, in the JSON, 'events' object has 'infopack' but 'distances' is a separate root key in 'data.distances'.
        // Wait, the event object in backup has "distances": undefined/null in the example I saw?
        // Let's check the view_file output again.
        // Line 142 shows "distances": [ ... ] array at root level.
        // Line 47 starts "events" array. Inside event (line 48), there is no "distances" array,
        // just normal fields.

        const eventData = event;
        const organizer = await prisma.user.findUnique({ where: { id: event.organizerId } });
        if (!organizer) {
            console.warn(`Organizer ${event.organizerId} not found for event ${event.title}, skipping...`);
            continue;
        }

        // Handle JSON fields
        if (event.infopack && typeof event.infopack === 'object') {
            // Prisma expects JSON
        }

        // Explicitly remove potential conflicts and ensure defaults
        // distances was already destructured above, but let's just use eventData which has everything
        // Wait, I need to clean it.
        const { distances: _d, ...cleanEventData } = event;
        // If infopackActive is missing in backup but present in schema, default handles it.
        // But if we want to be safe, we can add it.
        // Also remove any other relation arrays if they exist in JSON
        delete (cleanEventData as any).organizer;
        delete (cleanEventData as any).seller;
        delete (cleanEventData as any).sellerEuro;

        await prisma.event.upsert({
            where: { id: event.id },
            update: cleanEventData,
            create: {
                ...cleanEventData,
                infopackActive: false // Explicitly set default since backup doesn't have it
            }
        });
    }

    // 5. Restore Distances
    console.log('Restoring Distances...');
    for (const distance of data.distances) {
        await prisma.distance.upsert({
            where: { id: distance.id },
            update: distance,
            create: distance
        });
    }

    // 6. Restore Partners
    console.log('Restoring Partners...');
    for (const partner of data.partners) {
        await prisma.partner.upsert({
            where: { id: partner.id },
            update: partner,
            create: partner
        });
    }

    // 7. Restore Sponsors
    console.log('Restoring Sponsors...');
    for (const sponsor of data.sponsors) {
        await prisma.sponsor.upsert({
            where: { id: sponsor.id },
            update: sponsor,
            create: sponsor
        });
    }

    // 8. Restore Products
    console.log('Restoring Products...');
    if (data.products) {
        for (const product of data.products) {
            await prisma.product.upsert({
                where: { id: product.id },
                update: product,
                create: product
            });
        }
    }

    // 9. Restore Gallery
    console.log('Restoring Gallery...');
    if (data.galleryImages) {
        for (const img of data.galleryImages) {
            await prisma.galleryImage.upsert({
                where: { id: img.id },
                update: img,
                create: img
            });
        }
    }

    console.log('Restore completed successfully.');
}

restore()
    .catch(e => {
        console.error('Restore failed:', e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
