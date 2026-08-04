import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireAdmin } from '@/lib/auth-checks';

export async function GET() {
    try {
        await requireAdmin();

        const zipPath = path.join(process.cwd(), 'scripts', 'runion-sync-plugin.zip');
        const phpPath = path.join(process.cwd(), 'scripts', 'runion-sync-plugin.php');

        let fileBuffer: Buffer;
        let filename = 'runion-sync-plugin.zip';
        let contentType = 'application/zip';

        if (fs.existsSync(zipPath)) {
            fileBuffer = fs.readFileSync(zipPath);
        } else if (fs.existsSync(phpPath)) {
            fileBuffer = fs.readFileSync(phpPath);
            filename = 'runion-sync-plugin.php';
            contentType = 'application/x-php';
        } else {
            return NextResponse.json({ error: 'Plugin file not found' }, { status: 404 });
        }

        return new NextResponse(new Uint8Array(fileBuffer), {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Failed to export WP plugin:', error);
        return NextResponse.json({ error: 'Unauthorized or server error' }, { status: 401 });
    }
}
