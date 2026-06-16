
const { PrismaClient } = require('@prisma/client');

async function test() {
    const url = process.env.DATABASE_URL;
    console.log('Testing connection to:', url.substring(0, 20) + '...');
    const prisma = new PrismaClient({
        datasources: {
            db: { url }
        }
    });

    try {
        await prisma.$connect();
        console.log('SUCCESS: Connected to database');
        const userCount = await prisma.user.count();
        console.log('User count:', userCount);
    } catch (err) {
        console.error('FAILURE: Could not connect to database');
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

test();
