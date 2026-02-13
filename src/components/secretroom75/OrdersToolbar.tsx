'use client';

import { useState, useRef, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Download, Upload, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { exportOrdersCSV, importOrdersCSV } from '@/actions/admin-orders';

export default function OrdersToolbar() {
    const [isExporting, startExport] = useTransition();
    const [isImporting, startImport] = useTransition();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        startExport(async () => {
            const result = await exportOrdersCSV();
            if (result.success && result.csv) {
                // Trigger download
                const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                toast.success('CSV export sikeres!');
            } else {
                toast.error(result.message || 'Hiba az exportálás során.');
            }
        });
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input value to allow selecting same file again
        e.target.value = '';

        if (!file.name.endsWith('.csv')) {
            toast.error('Csak .csv fájl tölthető fel!');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        startImport(async () => {
            const result = await importOrdersCSV(formData);
            if (result.success) {
                toast.success(result.message);
                // Refresh is handled by action revalidatePath
            } else {
                toast.error(result.message || 'Hiba az importálás során.');
            }
        });
    };

    return (
        <div className="flex gap-2 mb-4">
            <Button
                onClick={handleExport}
                disabled={isExporting || isImporting}
                className="bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 gap-2"
            >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                CSV Export
            </Button>

            <Button
                onClick={handleImportClick}
                disabled={isExporting || isImporting}
                className="bg-accent hover:bg-accent/90 text-black border-none gap-2"
            >
                {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                CSV Import
            </Button>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
            />

            <div className="text-xs text-zinc-500 flex items-center gap-1 ml-auto">
                <FileText className="w-3 h-3" />
                <span>Formátum: Rendelésszám; Dátum; Név; ...</span>
            </div>
        </div>
    );
}
