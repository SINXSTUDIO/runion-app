'use server';

import { createBackup } from './backup';
import fs from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/auth-checks';

const BACKUP_DIR = process.env.VERCEL ? path.join('/tmp', 'backups', 'daily') : path.join(process.cwd(), 'backups', 'daily');

export async function checkAndCreateAutoBackup() {
    try {
        await requireAdmin();
    } catch {
        return; // Silent fail if not admin
    }

    try {
        await fs.mkdir(BACKUP_DIR, { recursive: true });

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const filename = `backup-${today}.json`;
        const filePath = path.join(BACKUP_DIR, filename);

        try {
            await fs.access(filePath);
            return { status: 'exists', date: today };
        } catch {
            // Does not exist, proceed to create
        }

        console.log(`[AutoBackup] Creating daily backup: ${filename}...`);
        const result = await createBackup();

        if (result.success && result.backup) {
            await fs.writeFile(filePath, result.backup, 'utf-8');
            console.log(`[AutoBackup] Success: ${filePath}`);
            await cleanupOldBackups();
            return { status: 'created', date: today };
        }
    } catch (error) {
        console.warn('[AutoBackup] Backup skipped (read-only file system or environment limitation):', error);
    }
}

export async function listAutoBackups(): Promise<string[]> {
    try {
        await requireAdmin();
        const files = await fs.readdir(BACKUP_DIR);
        return files.filter(f => f.startsWith('backup-') && f.endsWith('.json'));
    } catch (error) {
        return [];
    }
}

export async function getAutoBackupContent(filename: string): Promise<string> {
    try {
        await requireAdmin();
        const filePath = path.join(BACKUP_DIR, filename);
        return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
        return '';
    }
}

export async function saveBackupDataToDisk(backupData: any) {
    try {
        await fs.mkdir(BACKUP_DIR, { recursive: true });
        const today = new Date().toISOString().split('T')[0];
        const filename = `backup-${today}.json`;
        const filePath = path.join(BACKUP_DIR, filename);

        await fs.writeFile(filePath, JSON.stringify(backupData, null, 2), 'utf-8');
        return { success: true, filePath };
    } catch (error) {
        console.error('[AutoBackup] Error saving backup:', error);
        return { success: false, error: String(error) };
    }
}

async function cleanupOldBackups() {
    try {
        const files = await fs.readdir(BACKUP_DIR);
        const backupFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.json'));

        if (backupFiles.length > 5) {
            backupFiles.sort(); // Sorting by YYYY-MM-DD string
            const filesToDelete = backupFiles.slice(0, backupFiles.length - 5);

            for (const file of filesToDelete) {
                await fs.unlink(path.join(BACKUP_DIR, file));
                console.log(`[AutoBackup] Cleaned up old backup: ${file}`);
            }
        }
    } catch (error) {
        console.error('[AutoBackup] Cleanup error:', error);
    }
}
