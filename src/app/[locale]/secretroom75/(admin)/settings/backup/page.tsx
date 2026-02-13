import { getTranslations } from 'next-intl/server';
import BackupManager from '@/components/admin/BackupManager';
import { ShieldCheck } from 'lucide-react';

export default async function BackupPage() {
    return (
        <div className="container mx-auto max-w-4xl py-12 space-y-8">
            <div className="flex items-center gap-6">
                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                    <ShieldCheck className="w-10 h-10 text-emerald-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-black italic text-white mb-2 tracking-tight">Biztonsági Mentés</h1>
                    <p className="text-zinc-400 text-lg">
                        Az adatbázis teljes tartalmának mentése és visszaállítása.
                    </p>
                </div>
            </div>

            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-xl">
                <BackupManager />
            </div>
        </div>
    );
}
