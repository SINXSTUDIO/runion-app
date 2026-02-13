'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from 'sonner';
import { updateTransferSettings } from '@/actions/settings';
import { Save, Loader2, ArrowLeftRight } from 'lucide-react';

interface TransferSettingsFormProps {
    initialSettings: {
        transferInfoHu?: string | null;
        transferInfoEn?: string | null;
        transferInfoDe?: string | null;
        transferBeneficiary?: string | null;
        transferBankName?: string | null;
        transferBankAccountNumber?: string | null;
        transferNote?: string | null;
        transferEmail?: string | null;
        transferSellerId?: string | null;
    };
    companies?: any[];
}

export default function TransferSettingsForm({ initialSettings, companies = [] }: TransferSettingsFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        transferInfoHu: initialSettings.transferInfoHu || '',
        transferInfoEn: initialSettings.transferInfoEn || '',
        transferInfoDe: initialSettings.transferInfoDe || '',
        transferBeneficiary: initialSettings.transferBeneficiary || '',
        transferBankName: initialSettings.transferBankName || '',
        transferBankAccountNumber: initialSettings.transferBankAccountNumber || '',
        transferNote: initialSettings.transferNote || '',
        transferEmail: initialSettings.transferEmail || '',
        transferSellerId: initialSettings.transferSellerId || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-fill from selected company
        if (name === 'transferSellerId' && value) {
            const company = companies.find(c => c.id === value);
            if (company) {
                setFormData(prev => ({
                    ...prev,
                    transferBeneficiary: company.name || prev.transferBeneficiary,
                    transferBankName: company.bankName || prev.transferBankName,
                    transferBankAccountNumber: company.bankAccountNumber || prev.transferBankAccountNumber,
                }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await updateTransferSettings(formData);
            if (result.success) {
                toast.success('Beállítások sikeresen mentve!');
            } else {
                toast.error('Hiba történt a mentés során: ' + result.error);
            }
        } catch (error) {
            toast.error('Váratlan hiba történt.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-6 bg-zinc-900 border-zinc-800">
            <div className="flex items-center gap-3 mb-6">
                <ArrowLeftRight className="w-6 h-6 text-accent" />
                <h3 className="text-xl font-bold text-white uppercase italic">Átnevezés / Adatmódosítás Beállítások</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <h4 className="text-lg font-medium text-zinc-300 border-b border-zinc-800 pb-2">Kommunikáció</h4>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Értesítési Email Cím</label>
                        <p className="text-xs text-zinc-500 mb-2">Erre a címre küldünk értesítést minden új kérelemről.</p>
                        <Input
                            name="transferEmail"
                            type="email"
                            value={formData.transferEmail}
                            onChange={handleChange}
                            placeholder="Pl: admin@runion.hu"
                            className="bg-black border-zinc-700"
                        />
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-800">
                    <h4 className="text-lg font-medium text-zinc-300 border-b border-zinc-800 pb-2">Tájékoztató Szövegek (Árak, Határidők)</h4>

                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Magyar (HU)</label>
                            <Textarea
                                name="transferInfoHu"
                                value={formData.transferInfoHu}
                                onChange={handleChange}
                                placeholder="Pl: Versenynevezés átírása a nevezést követő 30. napig ingyenes..."
                                className="bg-black border-zinc-700 min-h-[100px]"
                            />
                        </div>
                        {/* EN/DE Textareas remain same */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Angol (EN)</label>
                            <Textarea
                                name="transferInfoEn"
                                value={formData.transferInfoEn}
                                onChange={handleChange}
                                placeholder="Registration transfer is free..."
                                className="bg-black border-zinc-700 min-h-[100px]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Német (DE)</label>
                            <Textarea
                                name="transferInfoDe"
                                value={formData.transferInfoDe}
                                onChange={handleChange}
                                placeholder="Die Ummeldung ist kostenlos..."
                                className="bg-black border-zinc-700 min-h-[100px]"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-800">
                    <h4 className="text-lg font-medium text-zinc-300 border-b border-zinc-800 pb-2">Átnevezési Díj Utalási Adatok</h4>
                    <p className="text-sm text-zinc-500 mb-4">Válassz egy szervezőt az adatok automatikus kitöltéséhez, vagy add meg manuálisan.</p>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Szervező Választása</label>
                        <select
                            name="transferSellerId"
                            value={formData.transferSellerId}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            <option value="">-- Egyedi adatok megadása --</option>
                            {companies.map(company => (
                                <option key={company.id} value={company.id}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Kedvezményezett Neve</label>
                            <Input
                                name="transferBeneficiary"
                                value={formData.transferBeneficiary}
                                onChange={handleChange}
                                placeholder="Pl: KAHU Egyesület"
                                className="bg-black border-zinc-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Bank Neve</label>
                            <Input
                                name="transferBankName"
                                value={formData.transferBankName}
                                onChange={handleChange}
                                placeholder="Pl: OTP Bank"
                                className="bg-black border-zinc-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Számlaszám</label>
                            <Input
                                name="transferBankAccountNumber"
                                value={formData.transferBankAccountNumber}
                                onChange={handleChange}
                                placeholder="Pl: 11748038-24826190-00000000"
                                className="bg-black border-zinc-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Közlemény (Minta)</label>
                            <Input
                                name="transferNote"
                                value={formData.transferNote}
                                onChange={handleChange}
                                placeholder="Pl: NVZS2024 – ADOMÁNY..."
                                className="bg-black border-zinc-700"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <Button type="submit" disabled={loading} className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Beállítások Mentése
                    </Button>
                </div>
            </form>
        </Card>
    );
}
