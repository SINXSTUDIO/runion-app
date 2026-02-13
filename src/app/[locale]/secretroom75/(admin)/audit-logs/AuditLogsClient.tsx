'use client';

import { useEffect, useState } from 'react';
import { getAdminAuditLogs } from '@/actions/audit-actions';
import { Loader2, Trash2, Edit, Plus, RotateCcw, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { hu } from 'date-fns/locale';

interface AuditLog {
    id: string;
    userId: string;
    userName: string;
    action: string;
    entityType: string;
    entityId: string;
    entityData?: any;
    createdAt: string;
}

const ACTION_ICONS = {
    DELETE: Trash2,
    UPDATE: Edit,
    CREATE: Plus,
    RESTORE: RotateCcw,
    SOFT_DELETE: AlertTriangle,
    FORCE_DELETE: Trash2,
};

const ACTION_COLORS = {
    DELETE: 'text-red-500',
    UPDATE: 'text-blue-500',
    CREATE: 'text-green-500',
    RESTORE: 'text-purple-500',
    SOFT_DELETE: 'text-orange-500',
    FORCE_DELETE: 'text-red-700',
};

const ACTION_LABELS = {
    DELETE: 'Törlés',
    UPDATE: 'Módosítás',
    CREATE: 'Létrehozás',
    RESTORE: 'Visszaállítás',
    SOFT_DELETE: 'Soft Törlés',
    FORCE_DELETE: 'Végleges Törlés',
};

export function AuditLogsClient() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    useEffect(() => {
        loadLogs();
    }, []);

    async function loadLogs() {
        setLoading(true);
        const result = await getAdminAuditLogs(200);
        if (result.success && result.data) {
            setLogs(result.data);
        }
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Audit Napló</h1>
                <p className="text-white/60">
                    Az adatbázis műveletek teljes nyomon követése az adatvesztés megelőzésére
                </p>
                <div className="mt-4 flex gap-4 text-sm">
                    <div className="px-3 py-1 bg-white/5 rounded">
                        <span className="text-white/60">Összes művelet:</span>{' '}
                        <span className="font-bold text-accent">{logs.length}</span>
                    </div>
                    <div className="px-3 py-1 bg-white/5 rounded">
                        <span className="text-white/60">Törlések:</span>{' '}
                        <span className="font-bold text-red-500">
                            {logs.filter(l => l.action === 'DELETE' || l.action === 'FORCE_DELETE').length}
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Művelet</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Entitás</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Felhasználó</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Időpont</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Adatok</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {logs.map((log) => {
                                const Icon = ACTION_ICONS[log.action as keyof typeof ACTION_ICONS] || Trash2;
                                const color = ACTION_COLORS[log.action as keyof typeof ACTION_COLORS] || 'text-white';
                                const label = ACTION_LABELS[log.action as keyof typeof ACTION_LABELS] || log.action;

                                return (
                                    <tr
                                        key={log.id}
                                        className="hover:bg-white/5 transition-colors cursor-pointer"
                                        onClick={() => setSelectedLog(log)}
                                    >
                                        <td className="px-4 py-3">
                                            <div className={`flex items-center gap-2 ${color}`}>
                                                <Icon className="w-4 h-4" />
                                                <span className="font-semibold">{label}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="font-medium">{log.entityType}</div>
                                                <div className="text-xs text-white/40 font-mono">{log.entityId.slice(0, 8)}...</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm">{log.userName}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-white/70">
                                                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: hu })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {log.entityData ? (
                                                <button
                                                    className="text-xs px-2 py-1 bg-accent/20 text-accent rounded hover:bg-accent/30 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedLog(log);
                                                    }}
                                                >
                                                    Megtekintés
                                                </button>
                                            ) : (
                                                <span className="text-xs text-white/40">-</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for viewing snapshot */}
            {selectedLog && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedLog(null)}
                >
                    <div
                        className="bg-[#1a1a1a] border border-white/20 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-2xl font-bold mb-2">Audit Log Részletek</h2>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-white/60">Művelet:</span>{' '}
                                    <span className="font-semibold">
                                        {ACTION_LABELS[selectedLog.action as keyof typeof ACTION_LABELS]}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-white/60">Entitás:</span>{' '}
                                    <span className="font-semibold">{selectedLog.entityType}</span>
                                </div>
                                <div>
                                    <span className="text-white/60">Felhasználó:</span>{' '}
                                    <span className="font-semibold">{selectedLog.userName}</span>
                                </div>
                                <div>
                                    <span className="text-white/60">Időpont:</span>{' '}
                                    <span className="font-semibold">
                                        {new Date(selectedLog.createdAt).toLocaleString('hu-HU')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 overflow-auto max-h-[60vh]">
                            <h3 className="text-lg font-semibold mb-3">Snapshot Adatok:</h3>
                            <pre className="bg-black/40 p-4 rounded border border-white/10 text-sm overflow-x-auto">
                                {JSON.stringify(selectedLog.entityData, null, 2)}
                            </pre>
                        </div>
                        <div className="p-4 border-t border-white/10 flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
                            >
                                Bezárás
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {logs.length === 0 && (
                <div className="text-center py-12 text-white/40">
                    <p>Még nincs audit log bejegyzés.</p>
                </div>
            )}
        </div>
    );
}
