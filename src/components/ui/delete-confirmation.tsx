"use client";

import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    description?: string;
    itemName?: string;
    warningMessage?: string;
    isDangerous?: boolean;
}

export function DeleteConfirmation({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    itemName,
    warningMessage,
    isDangerous = false,
}: DeleteConfirmationProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await onConfirm();
        } finally {
            setIsDeleting(false);
            onClose();
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="bg-zinc-900 border-white/10">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className={`w-6 h-6 ${isDangerous ? 'text-red-500' : 'text-yellow-500'}`} />
                        <AlertDialogTitle className="text-white text-xl">
                            {title}
                        </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-zinc-400 space-y-3">
                        {description && <p>{description}</p>}

                        {itemName && (
                            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                <p className="text-sm font-mono text-white">{itemName}</p>
                            </div>
                        )}

                        {warningMessage && (
                            <div className={`${isDangerous ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'} border rounded-lg p-3`}>
                                <p className="text-sm font-semibold">{warningMessage}</p>
                            </div>
                        )}

                        <p className="text-xs text-zinc-500">
                            ℹ️ Ez a művelet rögzítésre kerül az audit naplóban.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        disabled={isDeleting}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                        Mégse
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isDeleting}
                        className={`${isDangerous
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-accent hover:bg-accent/90'
                            } text-white font-bold`}
                    >
                        {isDeleting ? 'Törlés...' : 'Törlés megerősítése'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
