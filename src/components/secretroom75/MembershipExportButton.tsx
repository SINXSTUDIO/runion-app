'use client';

import { Download } from 'lucide-react';
import { exportMemberships } from '@/actions/memberships';
import { toast } from 'sonner';

export default function MembershipExportButton() {
    const handleExport = async () => {
        const toastId = toast.loading('Exportálás folyamatban...');
        try {
            const csv = await exportMemberships();
            if (!csv) {
                toast.error('Nincs exportálható adat.', { id: toastId });
                return;
            }

            // Add BOM for Excel UTF-8
            const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
            const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8;' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `tagsag_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Sikeres exportálás!', { id: toastId });
        } catch (e) {
            console.error(e);
            toast.error('Hiba történt az exportáláskor.', { id: toastId });
        }
    };

    return (
        <button
            type="button"
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors"
            title="Tagság Lista Export (CSV)"
        >
            <Download className="w-5 h-5" />
        </button>
    );
}
