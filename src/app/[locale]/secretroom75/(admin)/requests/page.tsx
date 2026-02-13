import { getChangeRequests } from '@/actions/requests';
import { getSettings } from '@/actions/settings';
import { getCompanies } from '@/actions/content';
import RequestListClient from './RequestListClient';
import TransferSettingsForm from '@/components/admin/TransferSettingsForm';
import { ArrowLeftRight, Settings, List } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

export const dynamic = 'force-dynamic';

export default async function RequestsAdminPage() {
    const [requests, settings, companies] = await Promise.all([
        getChangeRequests(),
        getSettings(),
        getCompanies()
    ]);

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500 container mx-auto px-4 max-w-7xl py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                <div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                        <ArrowLeftRight className="text-accent w-8 h-8" />
                        Átnevezés / Adatmódosítás
                    </h1>
                    <p className="text-zinc-400 mt-1">Beérkezett átnevezési és adatmódosítási kérelmek kezelése</p>
                </div>
            </div>

            <Tabs defaultValue="list" className="w-full">
                <TabsList className="grid w-full md:w-[400px] grid-cols-2 mb-8 bg-zinc-900">
                    <TabsTrigger value="list" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                        <List className="w-4 h-4 mr-2" />
                        Kérelmek Listája
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                        <Settings className="w-4 h-4 mr-2" />
                        Űrlap Szerkesztése
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-0">
                    <RequestListClient initialRequests={requests} />
                </TabsContent>

                <TabsContent value="settings" className="mt-0">
                    <div className="max-w-4xl">
                        <TransferSettingsForm
                            initialSettings={(settings as any) || {}}
                            companies={companies || []}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
