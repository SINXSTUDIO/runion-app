'use server';

import { logAuditAction } from './audit-logger';
import prisma from './prisma';
import type { AuditAction } from '@prisma/client';

/**
 * Safe delete wrapper that logs the deletion before executing
 * This ensures we have a snapshot of deleted data for recovery
 */
export async function safeDelete<T extends keyof typeof prisma>(
    model: T,
    id: string,
    options?: {
        skipAuditLog?: boolean;
        skipSnapshot?: boolean;
        forceDelete?: boolean;
    }
): Promise<any> {
    try {
        // 1. Fetch the entity before deletion (snapshot)
        const entity = await (prisma[model] as any).findUnique({
            where: { id },
        });

        if (!entity) {
            throw new Error(`${String(model)} with id ${id} not found`);
        }

        // 2. Log the deletion in audit trail (unless explicitly skipped)
        if (!options?.skipAuditLog) {
            const action: AuditAction = options?.forceDelete ? 'FORCE_DELETE' : 'DELETE';
            await logAuditAction(
                action,
                String(model),
                id,
                options?.skipSnapshot ? { id } : entity
            );
        }

        // 3. Execute the deletion
        const result = await (prisma[model] as any).delete({
            where: { id },
        });

        console.log(`[SafeDelete] ✅ Deleted ${String(model)} ${id}`);
        return result;
    } catch (error) {
        console.error(`[SafeDelete] ❌ Failed to delete ${String(model)} ${id}:`, error);
        throw error;
    }
}

/**
 * Safe delete many wrapper with audit logging
 */
export async function safeDeleteMany<T extends keyof typeof prisma>(
    model: T,
    where: any,
    options?: {
        skipAuditLog?: boolean;
        logEachItem?: boolean;
    }
): Promise<{ count: number }> {
    try {
        // 1. If we need to log each item, fetch them first
        if (options?.logEachItem && !options?.skipAuditLog) {
            const entities = await (prisma[model] as any).findMany({ where });

            for (const entity of entities) {
                await logAuditAction('DELETE', String(model), (entity as any).id, entity);
            }

            console.log(`[SafeDeleteMany] Logged ${entities.length} ${String(model)} deletions`);
        } else if (!options?.skipAuditLog) {
            // Log a batch deletion
            await logAuditAction('DELETE', String(model), 'BATCH', { where });
        }

        // 2. Execute the batch deletion
        const result = await (prisma[model] as any).deleteMany({ where });

        console.log(`[SafeDeleteMany] ✅ Deleted ${result.count} ${String(model)} records`);
        return result;
    } catch (error) {
        console.error(`[SafeDeleteMany] ❌ Failed to delete ${String(model)}:`, error);
        throw error;
    }
}

/**
 * Soft delete wrapper (if deletedAt field exists)
 */
export async function softDelete<T extends keyof typeof prisma>(
    model: T,
    id: string
): Promise<any> {
    try {
        // Fetch entity first
        const entity = await (prisma[model] as any).findUnique({
            where: { id },
        });

        if (!entity) {
            throw new Error(`${String(model)} with id ${id} not found`);
        }

        // Log soft delete
        await logAuditAction('SOFT_DELETE', String(model), id, entity);

        // Update with deletedAt
        const result = await (prisma[model] as any).update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });

        console.log(`[SoftDelete] ✅ Soft deleted ${String(model)} ${id}`);
        return result;
    } catch (error) {
        console.error(`[SoftDelete] ❌ Failed to soft delete ${String(model)} ${id}:`, error);
        throw error;
    }
}

/**
 * Restore soft deleted entity
 */
export async function restoreSoftDelete<T extends keyof typeof prisma>(
    model: T,
    id: string
): Promise<any> {
    try {
        // Log restore action
        await logAuditAction('RESTORE', String(model), id);

        // Restore by setting deletedAt to null
        const result = await (prisma[model] as any).update({
            where: { id },
            data: {
                deletedAt: null,
            },
        });

        console.log(`[RestoreSoftDelete] ✅ Restored ${String(model)} ${id}`);
        return result;
    } catch (error) {
        console.error(`[RestoreSoftDelete] ❌ Failed to restore ${String(model)} ${id}:`, error);
        throw error;
    }
}
