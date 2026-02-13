
import { prisma } from './src/lib/prisma';

async function checkGallery() {
    console.log('Listing Gallery Images (Pillanatképek):');

    const images = await prisma.galleryImage.findMany({
        orderBy: { order: 'asc' }
    });

    if (images.length === 0) {
        console.log('No gallery images found in database. Using placeholders.');
    } else {
        console.log(`Found ${images.length} gallery images.`);
        console.log(JSON.stringify(images, null, 2));
    }
}

checkGallery()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
