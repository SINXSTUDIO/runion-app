'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { updateShopSettings } from '@/actions/settings';
import { Save, Building2, CreditCard, Mail, ArrowDownCircle, Truck, Image as ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface GlobalSettings {
    shopEmail: string | null;
    shopBeneficiaryName: string | null;
    shopBankName: string | null;
    shopBankAccountNumber: string | null;
    shopShippingCost: number | null;
    shopFreeShippingThreshold: number | null;
    shopNote: string | null;
    shopTaxNumber: string | null;
    shopAddress: string | null;
    shopLogoUrl: string | null;
    feature1Title: string | null;
    feature1TitleEn: string | null;
    feature1TitleDe: string | null;
    feature1Desc: string | null;
    feature1DescEn: string | null;
    feature1DescDe: string | null;
    feature1Icon: string | null;
    feature2Title: string | null;
    feature2TitleEn: string | null;
    feature2TitleDe: string | null;
    feature2Desc: string | null;
    feature2DescEn: string | null;
    feature2DescDe: string | null;
    feature2Icon: string | null;
    feature3Title: string | null;
    feature3TitleEn: string | null;
    feature3TitleDe: string | null;
    feature3Desc: string | null;
    feature3DescEn: string | null;
    feature3DescDe: string | null;
    feature3Icon: string | null;
}

interface Seller {
    id: string;
    name: string;
    bankName: string | null;
    bankAccountNumber: string | null;
    address?: string; // Optional if not all have it
    taxNumber?: string;
}

export default function ShopSettingsForm({ settings, sellers }: { settings: any; sellers: any[] }) {
    // const t = useTranslations('Admin.ShopSettings'); // Assuming keys exist or fallback
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        shopEmail: settings.shopEmail || '',
        shopBeneficiaryName: settings.shopBeneficiaryName || '',
        shopBankName: settings.shopBankName || '',
        shopBankAccountNumber: settings.shopBankAccountNumber || '',
        shopShippingCost: settings.shopShippingCost || 0,
        shopFreeShippingThreshold: settings.shopFreeShippingThreshold || 0,
        shopNote: settings.shopNote || '',
        shopTaxNumber: settings.shopTaxNumber || '',
        shopAddress: settings.shopAddress || '',
        shopLogoUrl: settings.shopLogoUrl || '',
        feature1Title: settings.feature1Title || '',
        feature1TitleEn: settings.feature1TitleEn || '',
        feature1TitleDe: settings.feature1TitleDe || '',
        feature1Desc: settings.feature1Desc || '',
        feature1DescEn: settings.feature1DescEn || '',
        feature1DescDe: settings.feature1DescDe || '',
        feature1Icon: settings.feature1Icon || '',
        feature2Title: settings.feature2Title || '',
        feature2TitleEn: settings.feature2TitleEn || '',
        feature2TitleDe: settings.feature2TitleDe || '',
        feature2Desc: settings.feature2Desc || '',
        feature2DescEn: settings.feature2DescEn || '',
        feature2DescDe: settings.feature2DescDe || '',
        feature2Icon: settings.feature2Icon || '',
        feature3Title: settings.feature3Title || '',
        feature3TitleEn: settings.feature3TitleEn || '',
        feature3TitleDe: settings.feature3TitleDe || '',
        feature3Desc: settings.feature3Desc || '',
        feature3DescEn: settings.feature3DescEn || '',
        feature3DescDe: settings.feature3DescDe || '',
        feature3Icon: settings.feature3Icon || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSellerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const sellerId = e.target.value;
        if (!sellerId) return;

        const seller = sellers.find(s => s.id === sellerId);
        if (seller) {
            setFormData(prev => ({
                ...prev,
                shopBeneficiaryName: seller.name,
                shopBankName: seller.bankName || '',
                shopBankAccountNumber: seller.bankAccountNumber || '',
                shopAddress: seller.address || '',
                shopTaxNumber: seller.taxNumber || '',
            }));
            toast.info('Adatok betöltve a kiválasztott szervezetből.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await updateShopSettings(formData);
            if (result.success) {
                toast.success('Beállítások mentve!');
            } else {
                toast.error('Hiba történt a mentés során.');
            }
        } catch (error) {
            toast.error('Váratlan hiba történt.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-4xl">
            <div className="bg-zinc-900 border border-white/5 rounded-xl p-8 space-y-8 shadow-2xl">

                {/* Logo Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                        <ImageIcon className="w-5 h-5 text-accent" />
                        <h3 className="text-lg font-bold text-white">Logó Beállítása (Díjbekérő Fejléc)</h3>
                    </div>

                    <div className="space-y-2">
                        <ImageUpload
                            value={formData.shopLogoUrl}
                            onChange={(url) => setFormData(prev => ({ ...prev, shopLogoUrl: url }))}
                            label="Díjbekérő Logó Feltöltése"
                            description="A díjbekérő bal felső sarkában jelenik meg. Ajánlott méret: 200x100px (PNG vagy JPG)"
                            preset="standard"
                        />
                    </div>
                </div>

                {/* Email Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                        <Mail className="w-5 h-5 text-accent" />
                        <h3 className="text-lg font-bold text-white">E-mail Beállítások</h3>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Bolt E-mail Cím (Feladó)</label>
                        <input
                            type="email"
                            name="shopEmail"
                            value={formData.shopEmail}
                            onChange={handleChange}
                            placeholder="shop@runion.eu"
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-accent"
                        />
                        <p className="text-xs text-zinc-600">Ez a cím jelenik meg feladóként a rendelés visszaigazolásnál.</p>
                    </div>
                </div>

                {/* Shipping Section */}
                <div className="space-y-6 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                        <Truck className="w-5 h-5 text-accent" />
                        <h3 className="text-lg font-bold text-white">Szállítási Költségek</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Szállítási Költség (Ft)</label>
                            <input
                                type="number"
                                name="shopShippingCost"
                                value={formData.shopShippingCost}
                                onChange={handleChange}
                                placeholder="Pl. 2000"
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-accent"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Ingyenes Szállítási Határ (Ft)</label>
                            <input
                                type="number"
                                name="shopFreeShippingThreshold"
                                value={formData.shopFreeShippingThreshold}
                                onChange={handleChange}
                                placeholder="Pl. 20000"
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-accent"
                            />
                        </div>
                    </div>
                </div>

                {/* Shop Features Section */}
                <div className="space-y-6 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                        <ArrowDownCircle className="w-5 h-5 text-accent" />
                        <h3 className="text-lg font-bold text-white">Bolt Szöveges Tartalom (Alsó Sáv)</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Feature 1 */}
                        <div className="space-y-4 p-4 bg-black/20 rounded-lg border border-white/5">
                            <h4 className="font-bold text-accent">1. Elem (Bal)</h4>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Ikon</label>
                                <select
                                    name="feature1Icon"
                                    value={formData.feature1Icon || ''}
                                    onChange={(e) => setFormData({ ...formData, feature1Icon: e.target.value })}
                                    className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent"
                                >
                                    <option value="">Alapértelmezett (ShoppingBag)</option>
                                    <option value="ShoppingBag">ShoppingBag</option>
                                    <option value="FileText">FileText</option>
                                    <option value="Users">Users</option>
                                    <option value="Heart">Heart</option>
                                    <option value="Shield">Shield</option>
                                    <option value="Truck">Truck</option>
                                    <option value="Star">Star</option>
                                    <option value="Award">Award</option>
                                    <option value="Gift">Gift</option>
                                    <option value="Zap">Zap</option>
                                    <option value="TrendingUp">TrendingUp</option>
                                    <option value="ThumbsUp">ThumbsUp</option>
                                    <option value="CheckCircle">CheckCircle</option>
                                    <option value="Info">Info</option>
                                </select>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Cím (HU)</label>
                                    <input
                                        type="text"
                                        name="feature1Title"
                                        value={formData.feature1Title || ''}
                                        onChange={handleChange}
                                        placeholder="PRÉMIUM MINŐSÉG"
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Cím (EN)</label>
                                    <input
                                        type="text"
                                        name="feature1TitleEn"
                                        value={formData.feature1TitleEn || ''}
                                        onChange={handleChange}
                                        placeholder="PREMIUM QUALITY"
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Cím (DE)</label>
                                    <input
                                        type="text"
                                        name="feature1TitleDe"
                                        value={formData.feature1TitleDe || ''}
                                        onChange={handleChange}
                                        placeholder="PREMIUM QUALITÄT"
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Leírás (HU)</label>
                                    <textarea
                                        name="feature1Desc"
                                        value={formData.feature1Desc || ''}
                                        onChange={(e) => setFormData({ ...formData, feature1Desc: e.target.value })}
                                        placeholder="Minden termékünket..."
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent min-h-[80px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Leírás (EN)</label>
                                    <textarea
                                        name="feature1DescEn"
                                        value={formData.feature1DescEn || ''}
                                        onChange={(e) => setFormData({ ...formData, feature1DescEn: e.target.value })}
                                        placeholder="All our products..."
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent min-h-[80px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Leírás (DE)</label>
                                    <textarea
                                        name="feature1DescDe"
                                        value={formData.feature1DescDe || ''}
                                        onChange={(e) => setFormData({ ...formData, feature1DescDe: e.target.value })}
                                        placeholder="Alle unsere Produkte..."
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent min-h-[80px]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="space-y-4 p-4 bg-black/20 rounded-lg border border-white/5">
                            <h4 className="font-bold text-accent">2. Elem (Közép)</h4>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Ikon</label>
                                <select
                                    name="feature2Icon"
                                    value={formData.feature2Icon || ''}
                                    onChange={(e) => setFormData({ ...formData, feature2Icon: e.target.value })}
                                    className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent"
                                >
                                    <option value="">Alapértelmezett (PDF szöveg)</option>
                                    <option value="ShoppingBag">ShoppingBag</option>
                                    <option value="FileText">FileText</option>
                                    <option value="Users">Users</option>
                                    <option value="Heart">Heart</option>
                                    <option value="Shield">Shield</option>
                                    <option value="Truck">Truck</option>
                                    <option value="Star">Star</option>
                                    <option value="Award">Award</option>
                                    <option value="Gift">Gift</option>
                                    <option value="Zap">Zap</option>
                                    <option value="TrendingUp">TrendingUp</option>
                                    <option value="ThumbsUp">ThumbsUp</option>
                                    <option value="CheckCircle">CheckCircle</option>
                                    <option value="Info">Info</option>
                                </select>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Cím (HU)</label>
                                    <input
                                        type="text"
                                        name="feature2Title"
                                        value={formData.feature2Title || ''}
                                        onChange={handleChange}
                                        placeholder="PDF DÍJBEKÉRŐ"
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Cím (EN)</label>
                                    <input
                                        type="text"
                                        name="feature2TitleEn"
                                        value={formData.feature2TitleEn || ''}
                                        onChange={handleChange}
                                        placeholder="INSTANT INVOICE"
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Cím (DE)</label>
                                    <input
                                        type="text"
                                        name="feature2TitleDe"
                                        value={formData.feature2TitleDe || ''}
                                        onChange={handleChange}
                                        placeholder="SOFORTIGE RECHNUNG"
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Leírás (HU)</label>
                                    <textarea
                                        name="feature2Desc"
                                        value={formData.feature2Desc || ''}
                                        onChange={(e) => setFormData({ ...formData, feature2Desc: e.target.value })}
                                        placeholder="Rendelés után..."
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent min-h-[80px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Leírás (EN)</label>
                                    <textarea
                                        name="feature2DescEn"
                                        value={formData.feature2DescEn || ''}
                                        onChange={(e) => setFormData({ ...formData, feature2DescEn: e.target.value })}
                                        placeholder="After ordering..."
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent min-h-[80px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Leírás (DE)</label>
                                    <textarea
                                        name="feature2DescDe"
                                        value={formData.feature2DescDe || ''}
                                        onChange={(e) => setFormData({ ...formData, feature2DescDe: e.target.value })}
                                        placeholder="Nach der Bestellung..."
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent min-h-[80px]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="space-y-4 p-4 bg-black/20 rounded-lg border border-white/5">
                            <h4 className="font-bold text-accent">3. Elem (Jobb)</h4>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Ikon</label>
                                <select
                                    name="feature3Icon"
                                    value={formData.feature3Icon || ''}
                                    onChange={(e) => setFormData({ ...formData, feature3Icon: e.target.value })}
                                    className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent"
                                >
                                    <option value="">Alapértelmezett (Runners kép)</option>
                                    <option value="ShoppingBag">ShoppingBag</option>
                                    <option value="FileText">FileText</option>
                                    <option value="Users">Users</option>
                                    <option value="Heart">Heart</option>
                                    <option value="Shield">Shield</option>
                                    <option value="Truck">Truck</option>
                                    <option value="Star">Star</option>
                                    <option value="Award">Award</option>
                                    <option value="Gift">Gift</option>
                                    <option value="Zap">Zap</option>
                                    <option value="TrendingUp">TrendingUp</option>
                                    <option value="ThumbsUp">ThumbsUp</option>
                                    <option value="CheckCircle">CheckCircle</option>
                                    <option value="Info">Info</option>
                                </select>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Cím (HU)</label>
                                    <input
                                        type="text"
                                        name="feature3Title"
                                        value={formData.feature3Title || ''}
                                        onChange={handleChange}
                                        placeholder="KÖZÖSSÉG TÁMOGATÁSA"
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Cím (EN)</label>
                                    <input
                                        type="text"
                                        name="feature3TitleEn"
                                        value={formData.feature3TitleEn || ''}
                                        onChange={handleChange}
                                        placeholder="SUPPORT RUNNING"
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Cím (DE)</label>
                                    <input
                                        type="text"
                                        name="feature3TitleDe"
                                        value={formData.feature3TitleDe || ''}
                                        onChange={handleChange}
                                        placeholder="LAUFEN UNTERSTÜTZEN"
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Leírás (HU)</label>
                                    <textarea
                                        name="feature3Desc"
                                        value={formData.feature3Desc || ''}
                                        onChange={(e) => setFormData({ ...formData, feature3Desc: e.target.value })}
                                        placeholder="Vásárlásoddal..."
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent min-h-[80px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Leírás (EN)</label>
                                    <textarea
                                        name="feature3DescEn"
                                        value={formData.feature3DescEn || ''}
                                        onChange={(e) => setFormData({ ...formData, feature3DescEn: e.target.value })}
                                        placeholder="With every purchase..."
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent min-h-[80px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Leírás (DE)</label>
                                    <textarea
                                        name="feature3DescDe"
                                        value={formData.feature3DescDe || ''}
                                        onChange={(e) => setFormData({ ...formData, feature3DescDe: e.target.value })}
                                        placeholder="Mit jedem Kauf..."
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent min-h-[80px]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shop Note Section */}
                <div className="space-y-6 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                        <Save className="w-5 h-5 text-accent" />
                        <h3 className="text-lg font-bold text-white">Egyedi Megjegyzés</h3>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Megjegyzés a rendeléshez (Email & PDF)</label>
                        <textarea
                            name="shopNote"
                            value={formData.shopNote}
                            onChange={(e) => setFormData({ ...formData, shopNote: e.target.value })}
                            placeholder="Pl. Köszönjük a vásárlást! Szállítási idő 2-3 nap."
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-accent min-h-[100px]"
                        />
                        <p className="text-xs text-zinc-600">Ez a szöveg meg fog jelenni a visszaigazoló emailben és a díjbekérőn is.</p>
                    </div>
                </div>

                {/* Bank Details Section */}
                <div className="space-y-6 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between pb-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-accent" />
                            <h3 className="text-lg font-bold text-white">Számlázási és Banki Adatok</h3>
                        </div>
                        {/* Seller Selector */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500 uppercase font-bold">Gyorskitöltés:</span>
                            <select
                                onChange={handleSellerSelect}
                                className="bg-black border border-zinc-700 text-white text-sm rounded-lg p-2 focus:border-accent outline-none"
                                defaultValue=""
                            >
                                <option value="" disabled>Válassz szervezetet...</option>
                                {sellers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Bolt Címe (Számlán megjelenő)</label>
                                <input
                                    type="text"
                                    name="shopAddress"
                                    value={formData.shopAddress}
                                    onChange={handleChange}
                                    placeholder="Pl. 1234 Budapest, Futó utca 1."
                                    className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-accent"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Adószám</label>
                                <input
                                    type="text"
                                    name="shopTaxNumber"
                                    value={formData.shopTaxNumber}
                                    onChange={handleChange}
                                    placeholder="Pl. 12345678-2-42"
                                    className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-accent"
                                />
                            </div>
                        </div>

                        <div className="h-px bg-white/5 my-6" />

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Kedvezményezett Neve</label>
                            <input
                                type="text"
                                name="shopBeneficiaryName"
                                value={formData.shopBeneficiaryName}
                                onChange={handleChange}
                                placeholder="Pl. Runion Sport Egyesület"
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-accent"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Bank Neve</label>
                                <input
                                    type="text"
                                    name="shopBankName"
                                    value={formData.shopBankName}
                                    onChange={handleChange}
                                    placeholder="Pl. OTP Bank"
                                    className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-accent"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Számlaszám</label>
                                <input
                                    type="text"
                                    name="shopBankAccountNumber"
                                    value={formData.shopBankAccountNumber}
                                    onChange={handleChange}
                                    placeholder="00000000-00000000-00000000"
                                    className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-accent"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <Button type="submit" disabled={loading} className="w-full md:w-auto px-12 py-6 text-lg bg-accent text-black font-bold hover:bg-accent/90 shadow-[0_0_20px_rgba(0,242,254,0.3)] rounded-xl transition-all hover:scale-105">
                    <Save className="w-5 h-5 mr-2" />
                    {loading ? 'Mentés...' : 'Beállítások Mentése'}
                </Button>
            </div>
        </form >
    );
}
