import { getLogs } from '@/lib/logger';
import { Button } from '@/components/ui/Button';
import { revalidatePath } from 'next/cache';
import { redirect } from '@/i18n/routing';
import fs from 'fs';
import path from 'path';

export default async function LogsPage() {
    const logs = await getLogs();

    async function clearLogsAction() {
        'use server';
        const LOG_FILE = path.join(process.cwd(), 'logs', 'error.log');
        if (fs.existsSync(LOG_FILE)) {
            fs.writeFileSync(LOG_FILE, '', 'utf8');
        }
        revalidatePath('/secretroom75/logs');
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-black font-heading">Szerver Naplók</h1>
                    <form action={clearLogsAction}>
                        <Button type="submit" variant="outline" className="text-red-500 border-red-500/50 hover:bg-red-950">
                            Naplók törlése
                        </Button>
                    </form>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 overflow-auto max-h-[70vh]">
                    <pre className="font-mono text-xs text-gray-300 whitespace-pre-wrap">
                        {logs || 'Nincsenek bejegyzések.'}
                    </pre>
                </div>
            </div>
        </div>
    );
}
