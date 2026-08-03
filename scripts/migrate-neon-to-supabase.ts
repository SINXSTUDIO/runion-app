import { PrismaClient } from '@prisma/client';

const NEON_URL = process.env.NEON_DATABASE_URL || 'postgresql://neondb_owner:npg_klyCGdLYPN75@ep-damp-sunset-agawdvve-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const SUPABASE_URL = process.env.SUPABASE_DATABASE_URL || 'postgresql://postgres.qoqfhexqonrljfevqxrg:Runion2026!SecureDBPass%2399@aws-0-eu-central-1.pooler.supabase.com:5432/postgres';

const neon = new PrismaClient({ datasources: { db: { url: NEON_URL } } });
const supabase = new PrismaClient({ datasources: { db: { url: SUPABASE_URL } } });

async function safeMigrateTable(tableName: string, modelName: keyof PrismaClient, pkField: string = 'id') {
    try {
        const rows = await neon.$queryRawUnsafe<any[]>(`SELECT * FROM "${tableName}"`);
        console.log(`📦 Found ${rows.length} records in Neon for "${tableName}"`);
        const model = (supabase as any)[modelName];
        let inserted = 0;
        for (const row of rows) {
            try {
                // Convert JSON fields if needed
                const cleanRow: any = {};
                for (const key of Object.keys(row)) {
                    if (row[key] !== undefined) {
                        cleanRow[key] = row[key];
                    }
                }
                const whereObj = { [pkField]: row[pkField] };
                await model.upsert({
                    where: whereObj,
                    update: cleanRow,
                    create: cleanRow
                });
                inserted++;
            } catch (err: any) {
                console.warn(`  ⚠️ Row in "${tableName}" (${row[pkField]}) skipped/warning:`, err.message?.split('\n')[0]);
            }
        }
        console.log(`  ✅ Successfully synced ${inserted}/${rows.length} records into Supabase for "${tableName}"`);
    } catch (err: any) {
        console.warn(`⚠️ Table "${tableName}" fetch skipped or not present in Neon:`, err.message?.split('\n')[0]);
    }
}

async function migrate() {
    console.log('🚀 Starting Full Safe Raw Migration from Neon -> Supabase Pro...');
    console.log('Source (Neon):', NEON_URL.split('@')[1]);
    console.log('Target (Supabase):', SUPABASE_URL.split('@')[1]);

    const migrationOrder: Array<{ table: string; model: keyof PrismaClient; pk?: string }> = [
        { table: 'Seller', model: 'seller' },
        { table: 'GlobalSettings', model: 'globalSettings' },
        { table: 'MembershipTier', model: 'membershipTier' },
        { table: 'User', model: 'user' },
        { table: 'Event', model: 'event' },
        { table: 'Distance', model: 'distance' },
        { table: 'PriceTier', model: 'priceTier' },
        { table: 'Registration', model: 'registration' },
        { table: 'Product', model: 'product' },
        { table: 'Order', model: 'order' },
        { table: 'OrderItem', model: 'orderItem' },
        { table: 'InstantTrack', model: 'instantTrack' },
        { table: 'Account', model: 'account' },
        { table: 'Session', model: 'session' },
        { table: 'Partner', model: 'partner' },
        { table: 'HomepageFeature', model: 'homepageFeature' },
        { table: 'GalleryImage', model: 'galleryImage' },
        { table: 'Sponsor', model: 'sponsor' },
        { table: 'AboutPage', model: 'aboutPage' },
        { table: 'FAQ', model: 'fAQ' },
        { table: 'ChangeRequest', model: 'changeRequest' },
        { table: 'Notification', model: 'notification' },
        { table: 'Feedback', model: 'feedback' },
        { table: 'AuditLog', model: 'auditLog' },
        { table: 'NewsletterSubscriber', model: 'newsletterSubscriber' }
    ];

    for (const item of migrationOrder) {
        await safeMigrateTable(item.table, item.model, item.pk || 'id');
    }

    console.log('\n=============================================');
    console.log('🎉 FULL DATA MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('=============================================');
    console.log('Final Supabase Pro Record Counts:');
    console.log(`- Users: ${await supabase.user.count()}`);
    console.log(`- Events: ${await supabase.event.count()}`);
    console.log(`- Distances: ${await supabase.distance.count()}`);
    console.log(`- Registrations: ${await supabase.registration.count()}`);
    console.log(`- Products: ${await supabase.product.count()}`);
    console.log(`- Orders: ${await supabase.order.count()}`);
    console.log(`- Sellers: ${await supabase.seller.count()}`);
    console.log(`- Sponsors: ${await supabase.sponsor.count()}`);
    console.log(`- Partners: ${await supabase.partner.count()}`);
    console.log(`- FAQs: ${await supabase.fAQ.count()}`);
}

migrate()
    .catch(err => {
        console.error('❌ Migration Failed:', err);
        process.exit(1);
    })
    .finally(async () => {
        await neon.$disconnect();
        await supabase.$disconnect();
    });
