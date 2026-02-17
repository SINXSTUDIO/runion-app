'use client';

import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { importMembershipPayments } from '@/actions/memberships';

export default function MembershipImportForm() {
    const [isUploading, setIsUploading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleAction = async (formData: FormData) => {
        setIsUploading(true);
        const toastId = toast.loading('Feldolgozás...');

        try {
            const result = await importMembershipPayments(formData);

            if (result.success) {
                toast.success(result.message, { id: toastId });
                formRef.current?.reset();
            } else {
                toast.error(result.message || 'Hiba történt az importálás során.', { id: toastId });
            }
        } catch (error) {
            console.error('Import error:', error);
            toast.error('Váratlan hiba történt.', { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form
            ref={formRef}
            action={handleAction}
            className="flex gap-2 items-center bg-zinc-900 p-2 rounded-xl border border-white/10 transition-colors hover:border-white/20"
        >
            <input
                type="file"
                name="file"
                accept=".csv"
                className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer transition-all"
                required
                disabled={isUploading}
            />
            <button
                type="submit"
                disabled={isUploading}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all"
                title="CSV Feltöltés (Rendelés ID, Státusz)"
            >
                {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Upload className="w-5 h-5" />
                )}
            </button>
        </form>
    );
}
