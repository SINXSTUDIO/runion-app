const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const slug = 'buff-ceus-72h-world-cup';
    // const removeId = 'field_1769683252758'; // The one identified as duplicate at Index 12
    const removeIds = [
        'field_1769683252758' // Duplicate "Versenyző neve"
    ];

    console.log(`Cleaning event: ${slug}`);

    const event = await prisma.event.findUnique({
        where: { slug }
    });

    if (!event) {
        console.log('Event not found');
        return;
    }

    const config = event.formConfig;
    if (!config || !config.fields) {
        console.log('No form config');
        return;
    }

    const newFields = config.fields.filter(f => !removeIds.includes(f.id));
    const removedCount = config.fields.length - newFields.length;

    if (removedCount > 0) {
        console.log(`Removing ${removedCount} fields.`);
        const newConfig = { ...config, fields: newFields };

        await prisma.event.update({
            where: { id: event.id },
            data: { formConfig: newConfig }
        });
        console.log('DB Updated.');
    } else {
        console.log('No fields matched for removal.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
