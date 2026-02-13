
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching latest registration...');
    const reg = await prisma.registration.findFirst({
        orderBy: { createdAt: 'desc' },
    });

    if (!reg) {
        console.log('No registrations found.');
        return;
    }

    console.log('Registration ID:', reg.id);
    console.log('FormData Type:', typeof reg.formData);
    console.log('FormData Content:', JSON.stringify(reg.formData, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
