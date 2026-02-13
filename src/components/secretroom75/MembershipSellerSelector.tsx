'use client';

import { useState } from 'react';
import { updateMembershipSeller } from '@/actions/settings';
import { toast } from 'sonner';
import { Building2 } from 'lucide-react';
import { SellerSummary } from '@/types/seller';

type Props = {
    sellers: SellerSummary[];
    currentSellerId: string | null;
    currentEmail?: string | null;
};

import { useTranslations } from 'next-intl';

export default function MembershipSellerSelector({ sellers, currentSellerId, currentEmail }: Props) {
    const [selectedId, setSelectedId] = useState(currentSellerId || '');
    const [email, setEmail] = useState(currentEmail || '');
    const [isLoading, setIsLoading] = useState(false);
    const t = useTranslations('Common');

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const result = await updateMembershipSeller(selectedId, email);
            if (result.success) {
                toast.success('Szervező beállítása mentve!');
            } else {
                toast.error('Hiba a mentés során.');
            }
        } catch (error) {
            toast.error('Váratlan hiba.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-zinc-900 border border-white/10 p-6 rounded-2xl mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-accent" />
                Tagság Szervezője (Kedvezményezett)
            </h3>
            <p className="text-zinc-400 text-sm mb-4">
                Válaszd ki, hogy melyik partner (szervező) számlázza a tagsági díjakat. Az összes tagsági utalás ezen partner számlaszámára fog érkezni, és az email értesítések is az ő email címére mennek.
            </p>

            <div className="flex gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Szervező Kiválasztása</label>
                    <select
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent outline-none text-white"
                    >
                        <option value="">-- Nincs kiválasztva (Alapértelmezett Shop adatok) --</option>
                        {sellers.map((seller) => (
                            <option key={seller.id} value={seller.id} className="bg-zinc-900">
                                {seller.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Értesítési Email (Opcionális)</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="pl. tagsag@runion.hu"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent outline-none text-white"
                    />
                </div>
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-accent hover:bg-accent/90 text-black font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                >
                    {isLoading ? t('saving') : t('save')}
                </button>
            </div>
        </div>
    );
}
