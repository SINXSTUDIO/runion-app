'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { deleteMyAccount } from '@/actions/user-actions';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function DeleteAccountButton() {
    const t = useTranslations('Profile'); // Ensure 'Profile' namespace has these keys
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteMyAccount();
            if (result.success) {
                router.refresh(); // Should redirect to /
            } else {
                alert('Hiba történt a törlés során. Kérjük próbáld újra.');
            }
        });
    };

    if (!isOpen) {
        return (
            <div className="mt-8 pt-8 border-t border-red-500/20">
                <h3 className="text-xl font-bold text-red-500 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {t('dangerZone.title') || 'Veszélyzóna'}
                </h3>
                <p className="text-zinc-400 mb-4 text-sm">
                    {t('dangerZone.description') || 'A fiók törlése végleges és nem visszavonható művelet.'}
                </p>
                <Button
                    onClick={() => setIsOpen(true)}
                    // variant="danger" -> not standard in some UI libs, using className for styling
                    className="font-bold gap-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/50"
                >
                    <Trash2 className="w-4 h-4" />
                    {t('dangerZone.button') || 'Fiók Törlése'}
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-zinc-900 border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-black italic text-red-500 flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6" />
                            {t('dangerZone.confirmTitle') || 'Biztosan törlöd?'}
                        </h2>
                        <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <p className="text-zinc-300 mb-6 leading-relaxed">
                        {t('dangerZone.confirmMessage') || 'A fiókod és minden személyes adatod inaktiválásra kerül. A rendszerből kiléptetünk.'}
                    </p>

                    <div className="flex gap-3 justify-end">
                        <Button
                            onClick={() => setIsOpen(false)}
                            variant="ghost"
                            disabled={isPending}
                        >
                            {t('edit.cancel') || 'Mégse'}
                        </Button>
                        <Button
                            onClick={handleDelete}
                            // variant="danger"
                            disabled={isPending}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isPending ? 'Törlés...' : (t('dangerZone.confirmButton') || 'Igen, Törlöm')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
