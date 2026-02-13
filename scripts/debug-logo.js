
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function check() {
    try {
        const settings = await prisma.globalSettings.findFirst();
        console.log('Settings found:', settings ? 'YES' : 'NO');
        if (settings) {
            console.log('shopLogoUrl:', settings.shopLogoUrl);

            if (settings.shopLogoUrl) {
                const publicDir = path.join(process.cwd(), 'public');
                const fullPath = path.join(publicDir, settings.shopLogoUrl);
                console.log('Expected Full Path:', fullPath);

                if (fs.existsSync(fullPath)) {
                    console.log('File EXISTS ✅');
                    const stats = fs.statSync(fullPath);
                    console.log('Size:', stats.size);
                } else {
                    console.log('File DOES NOT EXIST ❌');
                    // Check if removing leading slash helps
                    if (settings.shopLogoUrl.startsWith('/')) {
                        const altPath = path.join(publicDir, settings.shopLogoUrl.substring(1));
                        console.log('Checking alt path:', altPath);
                        if (fs.existsSync(altPath)) {
                            console.log('Alt path EXISTS ✅ (Leading slash issue?)');
                        } else {
                            console.log('Alt path DOES NOT EXIST ❌');
                        }
                    }
                }
            } else {
                console.log('shopLogoUrl is NULL or EMPTY');
            }
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
