'use client';

import { useState, useRef } from 'react';
import { createFullBackup, restoreFullBackup } from '@/actions/backup-actions';
import { Button } from '@/components/ui/Button';
import { Download, Loader2, Database, AlertCircle, Upload, RefreshCw, ArchiveRestore } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/Dialog";
import { Input } from '@/components/ui/Input';

export default function BackupManager() {
    const [isExporting, setIsExporting] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [restoreFile, setRestoreFile] = useState<File | null>(null);
    const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const result = await createFullBackup();

            if (result.success && result.data) {
                const blob = new Blob([result.data], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = result.filename || 'backup.json';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                toast.success('Biztonsági mentés sikeresen letöltve!');
            } else {
                toast.error('Hiba történt a mentés során.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Váratlan hiba történt.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setRestoreFile(e.target.files[0]);
            setIsRestoreDialogOpen(true);
        }
    };

    const handleRestore = async () => {
        if (!restoreFile) return;

        setIsRestoring(true);
        try {
            const formData = new FormData();
            formData.append('file', restoreFile);

            const result = await restoreFullBackup(formData);

            if (result.success) {
                toast.success('Adatbázis sikeresen visszaállítva!');
                setIsRestoreDialogOpen(false);
                setRestoreFile(null);
                // Optional: refresh page or redirect
                window.location.reload();
            } else {
                toast.error(result.error || 'Hiba történt a visszaállítás során.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Váratlan hiba történt.');
        } finally {
            setIsRestoring(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Export Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start border-b border-white/10 pb-8">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <Download className="w-5 h-5 text-emerald-500" />
                        Adatbázis Mentése
                    </h3>
                    <p className="text-zinc-400 mb-4 text-sm leading-relaxed">
                        Készíts egy teljes biztonsági másolatot az adatbázis jelenlegi állapotáról.
                        A letöltött JSON fájl tartalmaz minden adatot (felhasználók, versenyek, stb.).
                    </p>

                    <Button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                    >
                        {isExporting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Exportálás...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Biztonsági Mentés Letöltése
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Restore Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <ArchiveRestore className="w-5 h-5 text-amber-500" />
                        Adatbázis Visszaállítása
                    </h3>
                    <p className="text-zinc-400 mb-4 text-sm leading-relaxed">
                        Állítsd vissza az adatbázis tartalmát egy korábbi mentésből.
                        <br />
                        <span className="text-amber-500 font-bold">FIGYELEM: Ez a művelet felülírja a jelenlegi adatbázist!</span>
                    </p>

                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            className="hidden"
                        />
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isRestoring}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Mentés Feltöltése és Visszaállítás
                        </Button>
                    </div>

                    <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-red-500">
                                    <AlertCircle className="w-5 h-5" />
                                    Biztosan folytatod?
                                </DialogTitle>
                                <DialogDescription>
                                    A kiválasztott fájl: <span className="text-white font-mono">{restoreFile?.name}</span>
                                    <br /><br />
                                    <span className="font-bold text-red-400">
                                        FIGYELEM: A visszaállítás TÖRÖL minden jelenlegi adatot az adatbázisból és lecseréli a mentés tartalmára.
                                    </span>
                                    <br />
                                    Ez a folyamat nem visszavonható!
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsRestoreDialogOpen(false);
                                        setRestoreFile(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    disabled={isRestoring}
                                >
                                    Mégse
                                </Button>
                                <Button
                                    onClick={handleRestore}
                                    disabled={isRestoring}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    {isRestoring ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            Visszaállítás...
                                        </>
                                    ) : (
                                        'Igen, Visszaállítás Indítása'
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
