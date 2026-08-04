import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireAdmin } from '@/lib/auth-checks';

export async function GET() {
    try {
        await requireAdmin();

        const filePath = path.join(process.cwd(), 'scripts', 'runion-sync-plugin.php');
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'Plugin file not found' }, { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filePath);

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/x-php',
                'Content-Disposition': 'attachment; filename="runion-sync-plugin.php"',
            },
        });
    } catch (error) {
        console.error('Failed to export WP plugin:', error);
        return NextResponse.json({ error: 'Unauthorized or server error' }, { status: 401 });
    }
}
