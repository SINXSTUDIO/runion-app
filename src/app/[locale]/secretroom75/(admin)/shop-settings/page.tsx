import { getSettings } from '@/actions/settings';
import { prisma } from '@/lib/prisma';
import ShopSettingsForm from '@/components/secretroom75/ShopSettingsForm';
import { ShoppingBag } from 'lucide-react';

export default async function ShopSettingsPage() {
    const settings = await getSettings();
    const sellers = await prisma.seller.findMany({
        where: { active: true }
    });

    if (!settings) {
        return <div className="text-white">Hiba: A beállítások nem elérhetők.</div>;
    }

    return (
        <div className="flex flex-col items-center max-w-5xl mx-auto w-full space-y-8">
            <div className="flex items-center justify-between w-full">
                <div>
                    <h1 className="text-3xl font-black font-heading italic text-white uppercase tracking-wider">
                        Boutique <span className="text-accent">Beállítások</span>
                    </h1>
                    <p className="text-zinc-400 mt-2">
                        Itt állíthatod be a Shop visszaigazoló e-mailjeiben megjelenő adatokat.
                    </p>
                </div>
                <div className="bg-accent/10 p-3 rounded-xl border border-accent/20">
                    <ShoppingBag className="w-8 h-8 text-accent" />
                </div>
            </div>

            <ShopSettingsForm settings={settings} sellers={sellers} />
        </div>
    );
}
