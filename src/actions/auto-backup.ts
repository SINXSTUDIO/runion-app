
'use server';

import { createBackup } from './backup'; // Re-use the existing logic
import fs from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/auth-checks';

const BACKUP_DIR = path.join(process.cwd(), 'backups', 'daily');

export async function checkAndCreateAutoBackup() {
    // Only Admin triggers this
    try {
        await requireAdmin();
    } catch {
        return; // Silent fail if not admin
    }

    try {
        // Ensure dir exists
        await fs.mkdir(BACKUP_DIR, { recursive: true });

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const filename = `backup-${today}.json`;
        const filePath = path.join(BACKUP_DIR, filename);

        // Check if exists
        try {
            await fs.access(filePath);
            // Exists, do nothing
            return { status: 'exists', date: today };
        } catch {
            // Does not exist, create it
        }

        console.log(`[AutoBackup] Creating daily backup: ${filename}...`);
        const result = await createBackup();

        if (result.success && result.backup) {
            await fs.writeFile(filePath, result.backup, 'utf-8');
            console.log(`[AutoBackup] Success: ${filePath}`);

            // Clean up old backups (Keep last 3)
            await cleanupOldBackups();

            return { status: 'created', date: today };
        } else {
            console.error('[AutoBackup] Failed to create content.');
        }

    } catch (error) {
        console.error('[AutoBackup] Error:', error);
    }
}

async function cleanupOldBackups() {
    try {
        const files = await fs.readdir(BACKUP_DIR);
        const backupFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.json'));

        // Sort by name (which has date iso) -> Ascending
        backupFiles.sort();

        // Keep last 30 backups (increased from 3)
        if (backupFiles.length > 30) {
            const toDelete = backupFiles.slice(0, backupFiles.length - 30);
            for (const f of toDelete) {
                const p = path.join(BACKUP_DIR, f);
                console.log(`[AutoBackup] Deleting old backup: ${f}`);
                await fs.unlink(p);
            }
        }
    } catch (e) {
        console.error('[AutoBackup] Cleanup error:', e);
    }
}

export async function listAutoBackups() {
    await requireAdmin();
    try {
        await fs.mkdir(BACKUP_DIR, { recursive: true });
        const files = await fs.readdir(BACKUP_DIR);
        return files.filter(f => f.startsWith('backup-') && f.endsWith('.json')).sort().reverse();
    } catch {
        return [];
    }
}
