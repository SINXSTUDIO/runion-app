import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tables = [
        'User', 'MembershipTier', 'Event', 'Seller', 'Distance',
        'PriceTier', 'Registration', 'Product', 'Order', 'OrderItem',
        'InstantTrack', 'Account', 'Session', 'VerificationToken', 'Partner',
        'HomepageFeature', 'GalleryImage', 'Sponsor', 'AboutPage', 'FAQ',
        'GlobalSettings', 'ChangeRequest', 'Notification', 'Feedback',
        'AuditLog', 'NewsletterSubscriber'
    ];

    console.log('Enabling RLS on Supabase tables...');
    for (const table of tables) {
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
            console.log(`✅ RLS enabled for ${table}`);
        } catch (e: any) {
            console.warn(`⚠️ Could not enable RLS for ${table}:`, e.message);
        }
    }
    console.log('RLS setup completed.');
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
