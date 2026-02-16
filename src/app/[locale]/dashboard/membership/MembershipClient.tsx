'use client';

import { useState } from 'react';
import { purchaseMembership, cancelMembership } from '@/actions/memberships';
import { toast } from 'sonner';
import { Crown, Check, Trash2 } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';

type Tier = {
    id: string;
    name: string;
    price: number;
    description: string;
    discountPercentage: number;
    durationMonths: number;
    features?: string;
    featuresEn?: string;
    featuresDe?: string;
};

type Props = {
    user: any;
    tiers: Tier[];
    translations: any;
    sellers?: any[];
    activeSeller?: any;
};

export default function MembershipClient({ user, tiers, translations: t, sellers, activeSeller }: Props) {
    const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
    const [isBillingOpen, setIsBillingOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const locale = useLocale();

    // Billing Form State
    const [formData, setFormData] = useState({
        billingName: user.billingName || '',
        billingZip: user.billingZip || '',
        billingCity: user.billingCity || '',
        billingAddress: user.billingAddress || '',
        billingTaxNumber: user.billingTaxNumber || ''
    });

    const getEurEstimate = (price: number) => (price / 400).toFixed(1);

    const handleSelectTier = (tier: Tier) => {
        setSelectedTier(tier);
        setIsBillingOpen(true);
    };

    const handlePurchase = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTier) return;

        setIsLoading(true);
        try {
            const result = await purchaseMembership(selectedTier.id, formData);
            if (result.success) {
                toast.success(t.successTitle, {
                    description: t.successMessage,
                    duration: 8000
                });
                setIsBillingOpen(false);
                setSelectedTier(null);
                router.refresh();
                router.push('/dashboard/membership/success');
            } else {
                toast.error(result.error || 'Hiba történt.');
            }
        } catch (err) {
            toast.error('Váratlan hiba történt.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm(t.confirmCancel)) return;
        setIsLoading(true);
        try {
            const result = await cancelMembership();
            if (result.success) {
                toast.success('Sikeresen törölve', {
                    description: 'A tagságod megszűnt.',
                    duration: 5000
                });
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch (err) {
            toast.error('Váratlan hiba.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isBillingOpen && selectedTier) {
        return (
            <div className="max-w-2xl mx-auto animate-in fade-in zoom-in duration-300">
                <button
                    onClick={() => setIsBillingOpen(false)}
                    className="mb-4 text-sm text-zinc-400 hover:text-white flex items-center gap-2"
                >
                    ← {t.back}
                </button>

                <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <Crown className="w-6 h-6 text-accent" />
                        {t.confirmPurchase}: <span className="text-accent">{selectedTier.name}</span>
                    </h2>

                    <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-zinc-400">Ár:</span>
                            <div className="text-right">
                                <span className="text-xl font-bold block">{selectedTier.price.toLocaleString('hu-HU')} Ft</span>
                                {locale !== 'hu' && (
                                    <span className="text-sm text-zinc-400">~{getEurEstimate(selectedTier.price)} €</span>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-400">Időtartam:</span>
                            <span>{selectedTier.durationMonths} {t.month}</span>
                        </div>
                    </div>

                    {activeSeller && (
                        <div className="mb-6 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <h4 className="text-emerald-400 font-bold mb-2 text-sm uppercase tracking-wider">
                                {t.transferDetails || 'Utalási Információk'}
                            </h4>
                            <div className="space-y-2 text-sm text-zinc-300">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Kedvezményezett:</span>
                                    <span className="font-medium text-white">{activeSeller.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Bank:</span>
                                    <span className="font-medium text-white">{activeSeller.bankName}</span>
                                </div>
                                <div>
                                    <span className="text-zinc-500 block mb-1">Számlaszám:</span>
                                    <span className="font-mono text-white bg-black/30 px-2 py-1 rounded block w-full text-center">
                                        {activeSeller.bankAccountNumber}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handlePurchase} className="space-y-4">
                        <h3 className="font-semibold text-lg">{t.billingDetails}</h3>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Név / Cégnév</label>
                            <input
                                type="text" required
                                value={formData.billingName}
                                onChange={e => setFormData({ ...formData, billingName: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Irszám</label>
                                <input
                                    type="text" required
                                    value={formData.billingZip}
                                    onChange={e => setFormData({ ...formData, billingZip: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent outline-none"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Város</label>
                                <input
                                    type="text" required
                                    value={formData.billingCity}
                                    onChange={e => setFormData({ ...formData, billingCity: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Cím</label>
                            <input
                                type="text" required
                                value={formData.billingAddress}
                                onChange={e => setFormData({ ...formData, billingAddress: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-accent outline-none"
                            />
                        </div>


                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? t.processing : (
                                <span>
                                    {t.buy} - {selectedTier.price.toLocaleString('hu-HU')} Ft
                                    {locale !== 'hu' && ` (~${getEurEstimate(selectedTier.price)} €)`}
                                </span>
                            )}
                        </button>
                    </form>
                </div >
            </div >
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-black italic uppercase mb-2 flex items-center gap-3">
                    <Crown className="w-8 h-8 text-accent" />
                    {t.title}
                </h1>

                {/* Current Status Card */}
                <div className="mt-6 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10">
                        <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-2">{t.currentStatus}</h2>
                        <div className="flex items-center gap-4">
                            <div className="text-3xl font-bold text-white">
                                {user.membershipTierName || t.noMembership}
                            </div>
                            {user.membershipTierName && (
                                <div className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm font-bold flex items-center gap-1">
                                    <Check className="w-4 h-4" /> Aktív
                                </div>
                            )}
                        </div>
                        {user.membershipExpiresAt && (
                            <p className="mt-2 text-zinc-400">
                                {t.activeUntil} <span className="text-white font-medium">{new Date(user.membershipExpiresAt).toLocaleDateString()}</span>
                            </p>
                        )}

                        {user.membershipTierName && (
                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
                                <button
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                    className="text-red-500 hover:text-red-400 text-sm font-bold flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Törlés teszteléshez"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {t.cancel}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tiers Grid */}
            <div>
                <h2 className="text-xl font-bold mb-6">{t.availablePlans}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tiers.map(tier => {
                        const isCurrent = user.membershipTierId === tier.id;
                        return (
                            <div key={tier.id} className={`
                                relative group rounded-2xl p-6 border transition-all duration-300
                                ${isCurrent ? 'bg-accent/10 border-accent' : 'bg-zinc-900/50 border-white/10 hover:border-white/30 hover:bg-zinc-900/80'}
                            `}>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-2xl font-bold">{tier.name}</h3>
                                    {isCurrent && <Crown className="text-accent w-6 h-6" />}
                                </div>

                                <div className="mb-6">
                                    <span className="text-3xl font-black">{tier.price.toLocaleString('hu-HU')}</span>
                                    <span className="text-zinc-400 text-sm"> Ft / {tier.durationMonths} {t.month}</span>
                                    {locale !== 'hu' && (
                                        <div className="text-sm text-accent font-medium mt-1">
                                            ~{getEurEstimate(tier.price)} €
                                        </div>
                                    )}
                                </div>

                                <p className="text-zinc-400 text-sm mb-6 min-h-[3rem]">
                                    {tier.description || 'Nincs leírás'}
                                </p>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Check className="w-4 h-4 text-green-500" />
                                        <span>{tier.discountPercentage}% {t.discount}</span>
                                    </div>
                                    {(
                                        (locale === 'en' ? tier.featuresEn :
                                            locale === 'de' ? tier.featuresDe :
                                                tier.features) || tier.features
                                    )?.split('\n').filter(Boolean).map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm">
                                            <Check className="w-4 h-4 text-green-500 min-w-4" />
                                            <span>{feature.trim()}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleSelectTier(tier)}
                                    // Disable if it's strictly strictly current, OR maybe allow extend?
                                    // For now allow extend/renew.
                                    className={`
                                        w-full py-3 rounded-xl font-bold transition-all
                                        ${isCurrent
                                            ? 'bg-white/10 hover:bg-white/20 text-white'
                                            : 'bg-white text-black hover:bg-zinc-200'}
                                    `}
                                >
                                    {isCurrent ? t.renew : t.buy}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
