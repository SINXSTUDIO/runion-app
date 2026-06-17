
'use client';

import { useState } from 'react';
import { updateRequestStatus } from '@/actions/requests';
import { Button } from '@/components/ui/Button';
import { Check, X, Clock, Mail, Phone } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

interface ChangeRequest {
    id: string;
    type: string;
    status: string;
    name: string;
    email: string;
    phone: string;
    birthDate: Date | null;
    address: string | null;
    city: string | null;
    zipCode: string | null;
    fromEvent: string;
    toEvent: string | null;
    comment: string | null;
    createdAt: Date;
}

export default function RequestListClient({ initialRequests }: { initialRequests: any[] }) {
    const t = useTranslations('Admin.Requests');
    const locale = useLocale();
    const [requests, setRequests] = useState<ChangeRequest[]>(initialRequests);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleStatusUpdate = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
        setLoadingId(id);
        const result = await updateRequestStatus(id, newStatus);
        setLoadingId(null);
        if (result.success) {
            setRequests(prev => prev.map(req =>
                req.id === id ? { ...req, status: newStatus } : req
            ));
        } else {
            alert(t('actions.error') + ': ' + result.message);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Check className="w-3 h-3" /> {t('status.approved')}</span>;
            case 'REJECTED': return <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><X className="w-3 h-3" /> {t('status.rejected')}</span>;
            default: return <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> {t('status.pending')}</span>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'CANCELLATION': return <span className="text-red-400 font-bold uppercase tracking-wider text-xs border border-red-500/30 px-2 py-1 rounded">{t('types.cancellation')}</span>;
            case 'TRANSFER': return <span className="text-accent font-bold uppercase tracking-wider text-xs border border-accent/30 px-2 py-1 rounded">{t('types.transfer')}</span>;
            default: return <span className="text-blue-400 font-bold uppercase tracking-wider text-xs border border-blue-500/30 px-2 py-1 rounded">{t('types.modification')}</span>;
        }
    };

    const downloadCSV = () => {
        const headers = [
            t('table.date'),
            t('table.type'),
            t('table.status'),
            t('table.name'),
            'Email',
            t('table.phone'),
            t('table.birthDate'),
            t('table.zipCode'),
            t('table.city'),
            t('table.address'),
            t('actions.from'),
            t('actions.to'),
            t('table.comment')
        ];
        const rows = requests.map(req => [
            new Date(req.createdAt).toLocaleString(locale === 'hu' ? 'hu-HU' : locale === 'de' ? 'de-DE' : 'en-US'),
            req.type,
            req.status,
            req.name,
            req.email,
            req.phone,
            req.birthDate ? new Date(req.birthDate).toLocaleDateString(locale === 'hu' ? 'hu-HU' : locale === 'de' ? 'de-DE' : 'en-US') : '',
            req.zipCode || '',
            req.city || '',
            req.address || '',
            req.fromEvent,
            req.toEvent || '',
            req.comment || ''
        ]);

        const csvContent = [headers, ...rows]
            .map(e => e.map(i => `"${String(i).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `requests_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={downloadCSV} variant="outline" className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                    {t('downloadCsv')}
                </Button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="bg-zinc-950/50 [&_tr]:border-b [&_tr]:border-zinc-800">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-zinc-400">{t('table.date')}</th>
                                <th className="h-12 px-4 align-middle font-medium text-zinc-400">{t('table.type')}</th>
                                <th className="h-12 px-4 align-middle font-medium text-zinc-400">{t('table.requester')}</th>
                                <th className="h-12 px-4 align-middle font-medium text-zinc-400">{t('table.details')}</th>
                                <th className="h-12 px-4 align-middle font-medium text-zinc-400">{t('table.comment')}</th>
                                <th className="h-12 px-4 align-middle font-medium text-zinc-400 text-right">{t('table.status')}</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-zinc-500">
                                        {t('noRequests')}
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.id} className="border-b border-zinc-800 transition-colors hover:bg-zinc-800/20 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle whitespace-nowrap font-mono text-zinc-500">
                                            {new Date(req.createdAt).toLocaleDateString(locale === 'hu' ? 'hu-HU' : locale === 'de' ? 'de-DE' : 'en-US')}
                                            <br />
                                            {new Date(req.createdAt).toLocaleTimeString(locale === 'hu' ? 'hu-HU' : locale === 'de' ? 'de-DE' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="p-4 align-middle">{getTypeBadge(req.type)}</td>
                                        <td className="p-4 align-middle">
                                            <div className="font-bold text-white mb-1">{req.name}</div>
                                            <div className="text-xs text-zinc-400 flex items-center gap-2"><Mail className="w-3 h-3" /> {req.email}</div>
                                            <div className="text-xs text-zinc-400 flex items-center gap-2"><Phone className="w-3 h-3" /> {req.phone}</div>
                                            {req.city && <div className="text-xs text-zinc-500 mt-1">{req.zipCode} {req.city}, {req.address}</div>}
                                        </td>
                                        <td className="p-4 align-middle max-w-xs">
                                            <div className="text-sm bg-zinc-950 p-2 rounded border border-zinc-800">
                                                <div className="text-zinc-500 text-xs uppercase">{t('actions.from')}</div>
                                                <div className="text-white font-medium mb-2">{req.fromEvent}</div>
                                                {req.toEvent && (
                                                    <>
                                                        <div className="text-accent text-xs uppercase">{t('actions.to')}</div>
                                                        <div className="text-white font-medium">{req.toEvent}</div>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle max-w-[200px]">
                                            {req.comment ? <span className="text-sm text-zinc-300 italic">"{req.comment}"</span> : <span className="text-zinc-600">-</span>}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <div className="flex flex-col items-end gap-2">
                                                {getStatusBadge(req.status)}

                                                {req.status === 'PENDING' && (
                                                    <div className="flex gap-2 mt-2">
                                                        <Button
                                                            size="sm"
                                                            className="bg-emerald-600 hover:bg-emerald-500 h-7 text-xs"
                                                            disabled={loadingId === req.id}
                                                            onClick={() => handleStatusUpdate(req.id, 'APPROVED')}
                                                        >
                                                            {t('actions.approve')}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-red-400 hover:bg-red-500/10 hover:text-red-300 h-7 text-xs"
                                                            disabled={loadingId === req.id}
                                                            onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                                                        >
                                                            {t('actions.reject')}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
