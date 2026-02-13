'use server';

import { requireAdmin } from '@/lib/auth-checks';
import { getRecentAuditLogs } from '@/lib/audit-logger';
import { serializeData } from '@/lib/utils/serialization';

/**
 * Get audit logs for admin view
 */
export async function getAdminAuditLogs(limit?: number) {
    try {
        await requireAdmin();
        const logs = await getRecentAuditLogs(limit || 100);
        return { success: true, data: serializeData(logs) };
    } catch (error) {
        console.error('[getAdminAuditLogs] Error:', error);
        return { success: false, error: String(error) };
    }
}
