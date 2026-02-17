import { getMembershipTiers } from '@/actions/memberships';
import MembershipTable from '@/components/secretroom75/MembershipTable';
import MembershipExportButton from '@/components/secretroom75/MembershipExportButton';
import MembershipSellerSelector from '@/components/secretroom75/MembershipSellerSelector';
import MembershipImportForm from '@/components/secretroom75/MembershipImportForm';
import prisma from '@/lib/prisma';
import { Crown } from 'lucide-react';

interface MembershipTier {
    id: string;
    name: string;
    description: string | null;
    price: number;
    discountPercentage: number;
    // Add other fields as necessary based on your schema
    [key: string]: any;
}

export default async function MembershipsPage() {
    const rawMemberships = await getMembershipTiers();
    const sellers = await prisma.seller.findMany({ where: { active: true } });
    const globalSettings = await prisma.globalSettings.findFirst();

    // Transform data to ensure numbers are numbers, not Decimals
    const memberships = rawMemberships.map((m: any) => ({
        ...m,
        discountPercentage: m.discountPercentage ? Number(m.discountPercentage) : 0,
        price: m.price ? Number(m.price) : 0,
        discountAmount: m.discountAmount ? Number(m.discountAmount) : 0,
    }));

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
                    <MembershipImportForm />
                </div>
            </div>


            {/* Seller Configuration */}
            <MembershipSellerSelector
                sellers={sellers}
                currentSellerId={globalSettings?.membershipSellerId || null}
                currentEmail={globalSettings?.membershipNotificationEmail}
            />

            <MembershipTable memberships={memberships} />
        </div >
    );
}
