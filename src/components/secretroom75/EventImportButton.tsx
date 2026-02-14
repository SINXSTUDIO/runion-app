'use client';

import { Button } from '@/components/ui/Button';
import { Upload } from 'lucide-react';
import { importEvents } from '@/actions/events';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function EventImportButton() {
    const router = useRouter();

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target?.result as string;
            try {
                // Validate JSON first
                JSON.parse(content);
                const toastId = toast.loading('Importálás folyamatban...');

                const res = await importEvents(content);

                toast.dismiss(toastId);

                if (res.success) {
                    toast.success(res.message);
                    if (res.errors && res.errors.length > 0) {
                        res.errors.forEach(err => toast.warning(err));
                    }
                    router.refresh();
                } else {
                    toast.error(res.message);
                    if (res.errors) {
                        res.errors.forEach(err => toast.error(err));
                    }
                }
            } catch (err) {
                toast.error('Érvénytelen JSON fájl.');
                console.error(err);
            }
        };
        reader.readAsText(file);

        // Reset file input
        e.target.value = '';
    };

    return (
        <div className="relative">
            <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="JSON Import"
            />
            <Button
                variant="outline"
                className="gap-2 bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 h-10 px-4 rounded-xl"
            >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">JSON Import</span>
            </Button>
        </div>
    );
}
