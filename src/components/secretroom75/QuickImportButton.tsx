'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { importRegistrationPayments } from '@/actions/registrations';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function QuickImportButton() {
    const router = useRouter();
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent Link navigation if inside a Link (though it shouldn't be)
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const toastId = toast.loading('Feldolgozás alatt...');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await importRegistrationPayments(formData);

            if (result.success) {
                toast.success(result.message, { id: toastId });
                router.refresh();
            } else {
                toast.error(result.message, { id: toastId });
            }
        } catch (error) {
            toast.error('Hiba történt a fájl feldolgozása közben.', { id: toastId });
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <>
            <input
                type="file"
                accept=".csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                onClick={(e) => e.stopPropagation()}
            />
            <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 rounded-full hover:bg-zinc-800 relative"
                onClick={handleImportClick}
                disabled={isImporting}
                title="CSV Visszatöltés (Fizetések)"
            >
                {isImporting ? (
                    <Loader2 className="w-5 h-5 animate-spin text-accent" />
                ) : (
                    <Upload className="w-5 h-5 text-accent" />
                )}
            </Button>
        </>
    );
}
