const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const slug = 'buff-ceus-72h-world-cup';
    // console.log(`Inspecting event: ${slug}`);

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

    const seenInfo = new Set();

    config.fields.forEach((field, index) => {
        const key = field.label.trim().toLowerCase();
        console.log(`IDX: ${index} | ID: ${field.id} | LABEL: ${JSON.stringify(field.label)} | KEY: ${JSON.stringify(key)} | DUP: ${seenInfo.has(key)}`);
        if (seenInfo.has(key)) {
            // console.log(`   -> DUPLICATE FOUND`);
        } else {
            seenInfo.add(key);
        }
    });

    // Uncomment to actually remove:
    /*
    const uniqueFields = [];
    const seen = new Set();
    config.fields.forEach(f => {
         const k = f.label.trim().toLowerCase();
         if (!seen.has(k)) {
             seen.add(k);
             uniqueFields.push(f);
         }
    });
    if (uniqueFields.length < config.fields.length) {
         console.log(`Writing ${uniqueFields.length} unique fields (removed ${config.fields.length - uniqueFields.length})`);
         await prisma.event.update({
             where: { id: event.id },
             data: { formConfig: { ...config, fields: uniqueFields } }
         });
    }
    */
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
