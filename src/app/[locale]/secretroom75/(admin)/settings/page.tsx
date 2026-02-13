
'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { getSettings, toggleShop, toggleCancellation } from '@/actions/settings';
import { getAllEventsAdmin } from '@/actions/events';
import { Switch } from '@/components/ui/Switch';
import { toast } from 'sonner';
import { createBackup, restoreBackup } from '@/actions/backup';
import { listAutoBackups } from '@/actions/auto-backup';
import { Button } from '@/components/ui/Button';
import { Download, Upload, AlertTriangle, Clock, FileJson } from 'lucide-react';
import TransferSettingsForm from '@/components/admin/TransferSettingsForm';
import HomepageSettingsForm from '@/components/admin/HomepageSettingsForm';

export default function SettingsPage() {
    const t = useTranslations('Admin.Settings');

    // Shop State
    const [shopEnabled, setShopEnabled] = useState(true);
    const [cancellationEnabled, setCancellationEnabled] = useState(false);
    const [initialData, setInitialData] = useState<any>(null); // Store full settings object
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Backup State
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [backupLoading, setBackupLoading] = useState(false);
    const [restoreLoading, setRestoreLoading] = useState(false);

    // Auto Backups State
    const [autoBackups, setAutoBackups] = useState<string[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                // 1. Settings
                const settings = await getSettings();
                if (settings) {
                    setShopEnabled(settings.shopEnabled);
                    setCancellationEnabled(settings.cancellationEnabled ?? false);
                    setInitialData(settings);
                }

                // 2. Events for selection
                const eventsList = await getAllEventsAdmin();
                setEvents(eventsList);

                // 3. Auto Backups
                const files = await listAutoBackups();
                setAutoBackups(files);

            } catch (error) {
                console.error('Failed to load data', error);
                toast.error(t('loadError'));
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [t]);

    const handleShopToggle = async (checked: boolean) => {
        setShopEnabled(checked); // Optimistic update
        try {
            const result = await toggleShop(checked);
            if (result.success) {
                toast.success(t('updateSuccess'));
            } else {
                setShopEnabled(!checked); // Revert
                toast.error(t('updateError'));
            }
        } catch (error) {
            setShopEnabled(!checked); // Revert
            toast.error(t('updateError'));
        }
    };

    const handleCancellationToggle = async (checked: boolean) => {
        setCancellationEnabled(checked); // Optimistic update
        try {
            const result = await toggleCancellation(checked);
            if (result.success) {
                toast.success(t('updateSuccess'));
            } else {
                setCancellationEnabled(!checked); // Revert
                toast.error(t('updateError'));
            }
        } catch (error) {
            setCancellationEnabled(!checked); // Revert
            toast.error(t('updateError'));
        }
    };

    const handleDownloadBackup = async () => {
        setBackupLoading(true);
        try {
            const result = await createBackup();
            if (result.success && result.backup) {
                downloadStringAsFile(result.backup, `runion-manual-backup-${new Date().toISOString().split('T')[0]}.json`);
                toast.success('Biztonsági mentés sikeresen letöltve!');
            } else {
                toast.error('Hiba a mentés készítésekor: ' + result.error);
            }
        } catch (e) {
            toast.error('Hiba történt a mentés során.');
        } finally {
            setBackupLoading(false);
        }
    };

    // Helper for manual download
    const downloadStringAsFile = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleRestoreClick = () => {
        if (confirm('FIGYELEM: A visszaállítás felülírhatja a jelenlegi adatokat. Biztosan folytatod?')) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setRestoreLoading(true);
        try {
            const text = await file.text();
            const result = await restoreBackup(text);
            if (result.success) {
                toast.success('Adatbázis sikeresen visszaállítva!');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast.error('Hiba a visszaállításkor: ' + result.error);
            }
        } catch (err) {
            toast.error('Hiba a fájl olvasásakor.');
        } finally {
            setRestoreLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (loading) {
        return <div className="p-8 text-white">Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 max-w-5xl py-8 space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl md:text-4xl font-bold text-white uppercase italic tracking-wider">
                    {t('title')}
                </h1>
            </div>

            <div className="grid gap-6">
                {/* Shop Settings */}
                <Card className="p-6 bg-zinc-900 border-zinc-800">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium text-white">{t('shopStatus')}</h3>
                            <p className="text-sm text-zinc-400">
                                {shopEnabled ? t('shopEnabledDesc') : t('shopDisabledDesc')}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch checked={shopEnabled} onCheckedChange={handleShopToggle} />
                        </div>
                    </div>
                </Card>

                {/* Cancellation Settings */}
                <Card className="p-6 bg-zinc-900 border-zinc-800">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium text-white">Lemondás Kérelem (Űrlap)</h3>
                            <p className="text-sm text-zinc-400">
                                {cancellationEnabled ? 'A felhasználók kérhetik a nevezésük törlését az űrlapon.' : 'A felhasználók NEM kérhetik a törlést (csak átnevezés/módosítás).'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch checked={cancellationEnabled} onCheckedChange={handleCancellationToggle} />
                        </div>
                    </div>
                </Card>

                {/* Homepage Featured Event Settings */}
                <HomepageSettingsForm
                    initialSettings={initialData || {}}
                    events={events}
                />

                {/* Transfer Info Settings */}
                <TransferSettingsForm initialSettings={initialData || {}} />

                {/* Backup Zone */}
                <Card className="p-6 bg-zinc-900 border-zinc-800 border-l-4 border-l-accent">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-accent">
                            <AlertTriangle className="w-6 h-6" />
                            <h3 className="text-xl font-bold uppercase italic">Biztonsági Zóna</h3>
                        </div>

                        <p className="text-zinc-400 text-sm">
                            Itt tudsz teljes biztonsági mentést készíteni. A rendszer emellett <b>automatikusan is készít napi mentést</b> (utolsó 3 nap), amit alább megtalálsz.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                onClick={handleDownloadBackup}
                                disabled={backupLoading || restoreLoading}
                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white font-medium shadow-sm transition-all active:scale-95"
                            >
                                <Download className="w-5 h-5 mr-2" />
                                {backupLoading ? 'Mentés...' : 'Aktuális Állapot Letöltése (.json)'}
                            </Button>

                            <Button
                                onClick={handleRestoreClick}
                                disabled={backupLoading || restoreLoading}
                                className="flex-1 bg-red-900/50 hover:bg-red-900/80 border-red-800 text-white font-medium shadow-sm transition-all active:scale-95"
                            >
                                <Upload className="w-5 h-5 mr-2" />
                                {restoreLoading ? 'Visszaállítás...' : 'Visszaállítás Fájlból'}
                            </Button>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".json"
                                className="hidden"
                            />
                        </div>

                        {/* Auto Backups List */}
                        {autoBackups.length > 0 && (
                            <div className="mt-6 border-t border-zinc-800 pt-4">
                                <h4 className="text-sm font-bold text-zinc-300 mb-3 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Automatikus Napi Mentések (Server)
                                </h4>
                                <div className="space-y-2">
                                    {autoBackups.map(filename => (
                                        <div key={filename} className="flex justify-between items-center bg-zinc-950 p-3 rounded border border-zinc-800/50">
                                            <div className="flex items-center gap-2">
                                                <FileJson className="w-4 h-4 text-zinc-500" />
                                                <span className="text-sm text-zinc-300">{filename}</span>
                                            </div>
                                            <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded">
                                                A szerveren tárolva
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
