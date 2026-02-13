const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const slug = 'buff-ceus-72h-world-cup';
    // const slug = 'schiller-szerelmes-fured-2026'; // Uncomment if needed to check the other one

    console.log(`Checking event: ${slug}`);

    const event = await prisma.event.findUnique({
        where: { slug }
    });

    if (!event) {
        console.log('Event not found');
        return;
    }

    const config = event.formConfig;
    if (!config || !config.fields) {
        console.log('No form config or fields');
        return;
    }

    for (let i = 0; i < config.fields.length; i++) {
        const field = config.fields[i];
        console.log(`FIELD_${i}: ${field.label}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
