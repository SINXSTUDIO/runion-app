
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    console.log('--- SIMULATING IMPORT LOCALLY ---');

    // 1. Read JSON
    console.log('Reading faq_data.json...');
    if (!fs.existsSync('faq_data.json')) {
        console.error('File found not found!');
        return;
    }
    const jsonContent = fs.readFileSync('faq_data.json', 'utf-8');
    const faqs = JSON.parse(jsonContent);

    console.log(`JSON contains ${faqs.length} items.`);

    // 2. Insert into DB (Local env)
    let count = 0;
    for (const item of faqs) {
        // Simulate the exact logic from src/actions/content.ts
        const created = await prisma.fAQ.create({
            data: {
                question: item.question,
                questionEn: item.questionEn,
                questionDe: item.questionDe,
                answer: item.answer,
                answerEn: item.answerEn,
                answerDe: item.answerDe,
                active: true,
                order: 1000 + count // Use high order to avoid collision if any
            }
        });
        console.log(`Imported Item ${count + 1}:`);
        console.log(`  HU: ${created.question}`);
        console.log(`  EN: ${created.questionEn}`); // Should print the text
        console.log(`  DE: ${created.questionDe}`); // Should print the text
        if (!created.questionEn || !created.questionDe) {
            console.error('  ERROR: MISSING TRANSLATION FIELDS!');
        }
        count++;
    }

    console.log('--- SIMULATION COMPLETE ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
