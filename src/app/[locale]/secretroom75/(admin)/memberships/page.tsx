import { getMembershipTiers, importMembershipPayments } from '@/actions/memberships';
import SecretHeader from '@/components/secretroom75/SecretHeader';
import MembershipTable from '@/components/secretroom75/MembershipTable';
import MembershipExportButton from '@/components/secretroom75/MembershipExportButton';
import MembershipSellerSelector from '@/components/secretroom75/MembershipSellerSelector';
import prisma from '@/lib/prisma';
import { Crown, Upload } from 'lucide-react';

export default async function MembershipsPage() {
    const memberships = await getMembershipTiers();
    const sellers = await prisma.seller.findMany({ where: { active: true } });
    const globalSettings = await prisma.globalSettings.findFirst();

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500 container mx-auto px-4 max-w-7xl py-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black italic uppercase mb-2 flex items-center gap-3 text-white">
                        <Crown className="w-8 h-8 text-accent" />
                        Tagság Kezelés
                    </h1>
                    <p className="text-zinc-400">
                        Előfizetések, VIP szintek és kedvezmények beállítása
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 items-center">
                    <MembershipExportButton />

                    {/* Bulk Import Form */}
                    <form action={importMembershipPayments as any} className="flex gap-2 items-center bg-zinc-900 p-2 rounded-xl border border-white/10">
                        <input type="file" name="file" accept=".csv" className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" required />
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg" title="CSV Feltöltés (Rendelés ID, Státusz)">
                            <Upload className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>


            {/* Seller Configuration */}
            <MembershipSellerSelector
                sellers={sellers}
                currentSellerId={globalSettings?.membershipSellerId || null}
                currentEmail={globalSettings?.membershipNotificationEmail}
            />

            <MembershipTable memberships={memberships.map((m: any) => ({
                ...m,
                discountPercentage: Number(m.discountPercentage),
                price: Number(m.price)
            }))} />
        </div >
    );
}
