
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

            // Clean up old backups (Keep last 5)
            await cleanupOldBackups();

            return { status: 'created', date: today };
        } else {
            console.error('[AutoBackup] Failed to create content.');
        }

    } catch (error) {
        console.error('[AutoBackup] Error:', error);
    }
}

export async function saveBackupDataToDisk(backupData: any) {
    try {
        await fs.mkdir(BACKUP_DIR, { recursive: true });
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const filename = `backup-${today}.json`;
        const filePath = path.join(BACKUP_DIR, filename);

        await fs.writeFile(filePath, JSON.stringify(backupData, null, 2), 'utf-8');
        console.log(`[AutoBackup] Cron daily backup saved to disk: ${filePath}`);
        await cleanupOldBackups();
    } catch (error) {
        console.error('[AutoBackup] Failed to save backup data to disk:', error);
    }
}

async function cleanupOldBackups() {
    try {
        const files = await fs.readdir(BACKUP_DIR);
        const backupFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.json'));

        // Sort by name (which has date iso) -> Ascending
        backupFiles.sort();

        // Keep last 5 backups
        if (backupFiles.length > 5) {
            const toDelete = backupFiles.slice(0, backupFiles.length - 5);
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

export async function getAutoBackupContent(filename: string) {
    await requireAdmin();
    // Validate filename to prevent directory traversal
    if (!filename.startsWith('backup-') || !filename.endsWith('.json') || filename.includes('/') || filename.includes('\\')) {
        throw new Error('Invalid filename');
    }
    const filePath = path.join(BACKUP_DIR, filename);
    return await fs.readFile(filePath, 'utf-8');
}
