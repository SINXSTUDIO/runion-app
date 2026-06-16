import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function create() {
    const email = 'test@runion.eu';
    const password = 'Password123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        console.log('Test user already exists.');
        return;
    }

    const user = await prisma.user.create({
        data: {
            email,
            passwordHash: hashedPassword,
            firstName: 'Test',
            lastName: 'User',
            role: 'USER'
        }
    });

    console.log('Created Test User:');
    console.log('Email:', user.email);
    console.log('Password:', password);
}

create()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
