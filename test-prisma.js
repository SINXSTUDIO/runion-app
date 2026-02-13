
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting...');
        await prisma.$connect();
        console.log('Connected successfully!');
        const users = await prisma.user.findMany({ take: 1 });
        console.log('Users found:', users.length);
    } catch (e) {
        console.error('Error name:', e.name);
        console.error('Error message:', e.message);
        console.error('Full Error:', JSON.stringify(e, null, 2));
    } finally {
        await prisma.$disconnect();
    }
}

main();
