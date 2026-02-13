const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const slug = 'buff-ceus-72h-world-cup';
    // console.log(`Inspecting encoded event: ${slug}`);

    const event = await prisma.event.findUnique({
        where: { slug }
    });

    if (!event) { return; }

    const config = event.formConfig;
    if (!config || !config.fields) { return; }

    config.fields.forEach((field, index) => {
        const label = field.label;
        const codes = [];
        for (let i = 0; i < label.length; i++) {
            codes.push(label.charCodeAt(i));
        }
        console.log(`IDX:${index} Codes:[${codes.join(',')}] Label:${label}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
