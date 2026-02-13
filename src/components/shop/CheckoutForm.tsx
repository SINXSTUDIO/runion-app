'use client';

import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import { createOrder } from '@/actions/shop';
import { useRouter } from '@/i18n/routing';
import { Loader2, CreditCard, Landmark, Truck, FileCheck, ClipboardList, Check } from 'lucide-react';
import Link from 'next/link';

interface CheckoutFormProps {
    defaultValues: {
        name: string;
        email: string;
        city: string;
        zipCode: string;
        address: string;
        phone: string;
        billingName?: string;
        billingZip?: string;
        billingCity?: string;
        billingAddress?: string;
        taxNumber?: string;
    };
    locale: string;
    settings: any; // Using any for simplicity or define properly
}

export default function CheckoutForm({ defaultValues, locale, settings }: CheckoutFormProps) {
    const { items, total, clearCart } = useCart();

    // Calculate Shipping
    const shippingCost = settings?.shopShippingCost || 2000;
    const freeThreshold = settings?.shopFreeShippingThreshold || 20000;
    const isFreeShipping = total >= freeThreshold;
    const finalShippingCost = isFreeShipping ? 0 : shippingCost;
    const finalTotal = total + finalShippingCost;

    const t = useTranslations('CheckoutPage');
    const router = useRouter();
    // ...
    // (Wait, I need to make sure I don't cut off state definitions. I'll rely on matching specific blocks)

    // ... (logic)

    // Update Summary Display
    <div className="space-y-3 mb-8">
        <div className="flex justify-between text-xs text-zinc-500 uppercase tracking-widest">
            <span>{t('subtotal')}</span>
            <span>{total.toLocaleString('hu-HU')} Ft</span>
        </div>
        <div className="flex justify-between text-xs text-zinc-500 uppercase tracking-widest">
            <span>{t('delivery')}</span>
            <span className={isFreeShipping ? "text-green-500" : "text-white"}>
                {isFreeShipping ? t('free') : `${finalShippingCost.toLocaleString('hu-HU')} Ft`}
            </span>
        </div>
        <div className="pt-4 border-t border-white/10 flex justify-between font-black text-2xl italic">
            <span className="text-white uppercase">{t('total')}</span>
            <span className="text-accent">{finalTotal.toLocaleString('hu-HU')} Ft</span>
        </div>
    </div>
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Legal Acceptance State
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptPrivacy, setAcceptPrivacy] = useState(false);

    async function handleSubmit(formData: FormData) {
        if (!acceptTerms) {
            setError('A rendelés leadásához el kell fogadnod az Általános Szerződési Feltételeket!');
            return;
        }
        if (!acceptPrivacy) {
            setError('A rendelés leadásához el kell fogadnod az Adatkezelési Tájékoztatót!');
            return;
        }

        setIsPending(true);
        setError(null);

        // ... (rest of the logic)
        const orderPayload = {
            ...Object.fromEntries(formData),
            items: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                size: item.size
            }))
        };

        formData.append('json', JSON.stringify(orderPayload));

        try {
            const result = await createOrder(null, formData);

            if (result.success) {
                clearCart();
                router.push(`/boutique/checkout/success/${result.orderId}`);
            } else {
                setError(result.message || 'Hiba történt a rendelés során.');
            }
        } catch (e) {
            setError('Váratlan hiba történt.');
        } finally {
            setIsPending(false);
        }
    }

    if (items.length === 0) {
        // ... (empty cart view)
        return (
            <div className="text-center py-20 bg-zinc-900 border border-white/5 rounded-[2rem]">
                <div className="bg-zinc-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Loader2 className="w-10 h-10 text-accent opacity-20" />
                </div>
                <p className="text-2xl font-black uppercase italic italic text-white mb-6">A kosarad üres.</p>
                <Button
                    onClick={() => router.push('/boutique')}
                    className="bg-accent text-black font-bold uppercase py-6 px-10 hover:scale-105 transition-all"
                >
                    Vissza a Butikba
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Form Column */}
            <div className="lg:col-span-8 space-y-12">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-2xl font-bold flex gap-3 items-center animate-in fade-in slide-in-from-top-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        {error}
                    </div>
                )}

                <form action={handleSubmit as any} className="space-y-12">
                    {/* ... (Shipping Info - kept as is) */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Truck className="text-accent w-6 h-6" />
                            <h2 className="text-2xl font-black uppercase italic tracking-tight">{t('shipping')}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Név" name="shippingName" defaultValue={defaultValues.name} required />
                            <InputField label="Email" name="shippingEmail" type="email" defaultValue={defaultValues.email} required placeholder="email@pelda.hu" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputField label="Irányítószám" name="shippingZip" defaultValue={defaultValues.zipCode} required />
                            <div className="md:col-span-2">
                                <InputField label="Város" name="shippingCity" defaultValue={defaultValues.city} required />
                            </div>
                        </div>
                        <InputField label="Cím (Utca, házszám, emelet)" name="shippingAddress" defaultValue={defaultValues.address} required />
                        <InputField label="Telefonszám" name="shippingPhone" defaultValue={defaultValues.phone} required placeholder="+36..." />
                    </div>

                    {/* ... (Billing Info - kept as is) */}
                    <div className="space-y-6 pt-12 border-t border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <FileCheck className="text-accent w-6 h-6" />
                                <h2 className="text-2xl font-black uppercase italic tracking-tight">{t('billing')}</h2>
                            </div>
                            <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest hidden sm:block">
                                {t('billingMatch')}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Név / Cégnév" name="billingName" defaultValue={defaultValues.billingName || defaultValues.name} required />
                            <InputField label="Adószám (Cég esetén)" name="billingTaxNumber" defaultValue={defaultValues.taxNumber} placeholder="12345678-x-yy" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputField label="Irányítószám" name="billingZip" defaultValue={defaultValues.billingZip || defaultValues.zipCode} required />
                            <div className="md:col-span-2">
                                <InputField label="Város" name="billingCity" defaultValue={defaultValues.billingCity || defaultValues.city} required />
                            </div>
                        </div>
                        <InputField label="Cím" name="billingAddress" defaultValue={defaultValues.billingAddress || defaultValues.address} required />
                    </div>

                    {/* ... (Note - kept as is) */}
                    <div className="pt-12 border-t border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <ClipboardList className="text-accent w-6 h-6" />
                            <h2 className="text-2xl font-black uppercase italic tracking-tight">{t('note')}</h2>
                        </div>
                        <textarea
                            className="w-full h-32 bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-white placeholder:text-zinc-600"
                            name="note"
                            placeholder="Egyéb információ a futárnak vagy a rendeléssel kapcsolatban..."
                        />
                    </div>

                    {/* Legal Acceptance Checkboxes */}
                    <div className="space-y-4 pt-8 border-t border-white/5">
                        <label className="flex items-center gap-4 cursor-pointer group bg-zinc-900/50 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                            <div className={`w-6 h-6 rounded border flex items-center justify-center transition-all flex-shrink-0 ${acceptTerms ? 'bg-accent border-accent text-black' : 'border-zinc-700 bg-black'}`}>
                                {acceptTerms && <Check className="w-4 h-4" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
                            <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">
                                Elfogadom az <Link href="/aszf" target="_blank" className="underline text-accent hover:text-white" onClick={(e) => e.stopPropagation()}>Általános Szerződési Feltételeket</Link> (ÁSZF)
                            </span>
                        </label>

                        <label className="flex items-center gap-4 cursor-pointer group bg-zinc-900/50 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                            <div className={`w-6 h-6 rounded border flex items-center justify-center transition-all flex-shrink-0 ${acceptPrivacy ? 'bg-accent border-accent text-black' : 'border-zinc-700 bg-black'}`}>
                                {acceptPrivacy && <Check className="w-4 h-4" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={acceptPrivacy} onChange={(e) => setAcceptPrivacy(e.target.checked)} />
                            <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">
                                Elfogadom az <Link href="/adatvedelem" target="_blank" className="underline text-accent hover:text-white" onClick={(e) => e.stopPropagation()}>Adatkezelési Tájékoztatót</Link>
                            </span>
                        </label>
                    </div>

                    {/* Hidden Inputs for Payment Method */}
                    <input type="hidden" name="paymentMethod" value="BANK_TRANSFER" />

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-8 text-xl font-black uppercase italic tracking-widest bg-accent text-black hover:bg-white transition-all shadow-[0_0_30px_rgba(0,242,254,0.2)] hover:shadow-[0_0_50px_rgba(0,242,254,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? <Loader2 className="animate-spin mr-3 w-6 h-6" /> : null}
                        {t('placeOrder')}
                    </Button>
                </form>
            </div>

            {/* Summary Column - kept as is but removed the legal text at bottom */}
            <div className="lg:col-span-4 space-y-8">
                {/* ... (Summary box content) */}
                <div className="bg-zinc-900 border border-white/10 p-8 rounded-[2rem] sticky top-24 shadow-xl">
                    <h2 className="text-2xl font-black uppercase italic tracking-tight mb-8 border-b border-white/5 pb-4">{t('summary')}</h2>
                    <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                        {items.map((item) => (
                            <div key={`${item.productId}-${item.size}`} className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <p className="font-bold text-white text-sm uppercase leading-tight">{item.name}</p>
                                    <p className="text-[10px] text-zinc-500 font-mono mt-1">
                                        {item.size ? `${item.size} | ` : ''} {item.quantity} DB
                                    </p>
                                </div>
                                <div className="font-mono text-sm text-accent whitespace-nowrap">
                                    {(item.price * item.quantity).toLocaleString('hu-HU')} FT
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3 mb-8">
                        <div className="flex justify-between text-xs text-zinc-500 uppercase tracking-widest">
                            <span>{t('subtotal')}</span>
                            <span>{total.toLocaleString('hu-HU')} Ft</span>
                        </div>
                        <div className="flex justify-between text-xs text-zinc-500 uppercase tracking-widest">
                            <span>{t('delivery')}</span>
                            <span className={isFreeShipping ? "text-green-500" : "text-white"}>
                                {isFreeShipping ? t('free') : `${finalShippingCost.toLocaleString('hu-HU')} Ft`}
                            </span>
                        </div>
                        <div className="pt-4 border-t border-white/10 font-black text-2xl italic text-right">
                            <div className="text-white uppercase mb-1">{t('total')}</div>
                            <div className="text-accent">{finalTotal.toLocaleString('hu-HU')} Ft</div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                        <h3 className="text-xs font-mono font-bold uppercase text-zinc-500 mb-4 tracking-tighter">{t('paymentMethod')}</h3>
                        <div className="p-4 bg-accent/5 border border-accent/20 rounded-2xl flex items-center gap-4 transition-all hover:bg-accent/10">
                            <div className="bg-accent text-black p-3 rounded-xl shadow-[0_0_15px_rgba(0,242,254,0.3)]">
                                <Landmark className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-black text-white text-sm uppercase italic">{t('bankTransfer')}</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-mono">{t('bankTransferDesc')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
