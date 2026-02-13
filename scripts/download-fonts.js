const fs = require('fs');
const https = require('https');
const path = require('path');

const fontsDir = path.join(__dirname, '../public/fonts');

if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                downloadFile(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => {
                    console.log(`Downloaded: ${dest}`);
                    resolve();
                });
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function main() {
    try {
        await downloadFile(
            'https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Regular.ttf',
            path.join(fontsDir, 'Roboto-Regular.ttf')
        );
        await downloadFile(
            'https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Bold.ttf',
            path.join(fontsDir, 'Roboto-Bold.ttf')
        );
        // Italic if needed (mapped to normal currently so skippable but good to have)
        // await downloadFile(
        //     'https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Italic.ttf', 
        //     path.join(fontsDir, 'Roboto-Italic.ttf')
        // );
        console.log('All fonts downloaded successfully!');
    } catch (error) {
        console.error('Error downloading fonts:', error);
        process.exit(1);
    }
}

main();
