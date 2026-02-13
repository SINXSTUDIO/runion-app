'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import type { AuditAction } from '@prisma/client';

/**
 * Log an audit action to track database operations
 * This is critical for data loss prevention and accountability
 */
export async function logAuditAction(
    action: AuditAction,
    entityType: string,
    entityId: string,
    entityData?: any
): Promise<void> {
    try {
        const session = await auth();

        // If no session, log as SYSTEM
        const userId = session?.user?.id || 'SYSTEM';
        const userName = session?.user
            ? `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim() || session.user.email || 'Unknown User'
            : 'SYSTEM';

        await prisma.auditLog.create({
            data: {
                userId,
                userName,
                action,
                entityType,
                entityId,
                entityData: entityData ? JSON.parse(JSON.stringify(entityData)) : null,
                ipAddress: null, // Can be extended with request headers
                userAgent: null, // Can be extended with request headers
            },
        });

        console.log(`[AuditLog] ${action} ${entityType} ${entityId} by ${userName}`);
    } catch (error) {
        // CRITICAL: Audit logging should NEVER break the application
        console.error('[AuditLog] Failed to log action:', error);
        // Don't throw - we don't want audit failures to break operations
    }
}

/**
 * Get audit logs for a specific entity
 */
export async function getAuditLogsForEntity(
    entityType: string,
    entityId: string
): Promise<any[]> {
    try {
        const logs = await prisma.auditLog.findMany({
            where: {
                entityType,
                entityId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 50, // Limit to last 50 actions
        });

        return logs;
    } catch (error) {
        console.error('[AuditLog] Failed to fetch logs:', error);
        return [];
    }
}

/**
 * Get recent audit logs (admin view)
 */
export async function getRecentAuditLogs(limit: number = 100): Promise<any[]> {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });

        return logs;
    } catch (error) {
        console.error('[AuditLog] Failed to fetch recent logs:', error);
        return [];
    }
}

/**
 * Get audit logs by user
 */
export async function getAuditLogsByUser(userId: string): Promise<any[]> {
    try {
        const logs = await prisma.auditLog.findMany({
            where: { userId },
            orderBy: {
                createdAt: 'desc',
            },
            take: 100,
        });

        return logs;
    } catch (error) {
        console.error('[AuditLog] Failed to fetch user logs:', error);
        return [];
    }
}
