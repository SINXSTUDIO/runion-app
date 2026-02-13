'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Edit2, Calendar, DollarSign, Clock, Users, MapPin, Copy } from 'lucide-react';
import { createDistance, updateDistance, deleteDistance, duplicateDistance } from '@/actions/distances';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/Dialog';

type PriceTier = {
    id?: string;
    name: string;
    price: number;
    priceEur?: number;
    validFrom: string; // ISO date string
    validTo: string;
};

type Distance = {
    id: string;
    name: string;
    nameEn?: string;
    nameDe?: string;
    description?: string;
    price: number | string;
    priceEur?: number | string;
    capacityLimit: number;
    startTime?: string;
    priceTiers?: PriceTier[] | any[];
    crewPricing?: any; // JSON {"1": 130, "2": 200, ...}
};

interface DistanceManagerProps {
    eventId: string;
    distances: Distance[];
}

export default function DistanceManager({ eventId, distances }: DistanceManagerProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDistance, setEditingDistance] = useState<Distance | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<{
        name: string;
        nameEn: string;
        nameDe: string;
        description: string;
        price: number;
        priceEur: number;
        capacityLimit: number;
        startTime: string;
        tiers: PriceTier[];
        useCrewPricing: boolean;
        crewPricing: { [key: string]: number };
    }>({
        name: '',
        nameEn: '',
        nameDe: '',
        description: '',
        price: 0,
        priceEur: 0,
        capacityLimit: 100,
        startTime: '',
        tiers: [],
        useCrewPricing: false,
        crewPricing: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
    });

    const resetForm = () => {
        setFormData({
            name: '',
            nameEn: '',
            nameDe: '',
            description: '',
            price: 0,
            priceEur: 0,
            capacityLimit: 100,
            startTime: '',
            tiers: [],
            useCrewPricing: false,
            crewPricing: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
        });
        setEditingDistance(null);
    };

    const handleOpen = (dist?: Distance) => {
        if (dist) {
            setEditingDistance(dist);
            setFormData({
                name: dist.name,
                nameEn: dist.nameEn || '',
                nameDe: dist.nameDe || '',
                description: dist.description || '',
                price: Number(dist.price),
                priceEur: dist.priceEur ? Number(dist.priceEur) : 0,
                capacityLimit: dist.capacityLimit,
                startTime: dist.startTime ? new Date(dist.startTime).toISOString().slice(0, 16) : '',
                tiers: (dist.priceTiers || []).map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    price: Number(t.price),
                    priceEur: t.priceEur ? Number(t.priceEur) : 0,
                    validFrom: t.validFrom ? new Date(t.validFrom).toISOString().slice(0, 16) : '',
                    validTo: t.validTo ? new Date(t.validTo).toISOString().slice(0, 16) : ''
                })),
                useCrewPricing: !!dist.crewPricing,
                crewPricing: dist.crewPricing
                    ? Object.fromEntries(
                        Object.entries(dist.crewPricing).map(([key, value]) => [key, Number(value)])
                    )
                    : { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        // Validation
        if (!formData.name) {
            toast.error('Add meg a táv nevét!');
            return;
        }
        const hasInvalidTiers = formData.tiers.some(t => !t.name.trim());
        if (hasInvalidTiers) {
            toast.error('Minden ársávnak kell nevet adni!');
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                priceTiers: undefined, // remove from dest
                useCrewPricing: undefined, // remove UI state
                tiers: formData.tiers, // use valid name
                crewPricing: formData.useCrewPricing
                    ? Object.fromEntries(
                        Object.entries(formData.crewPricing).map(([key, value]) => [key, Number(value)])
                    )
                    : null
            };

            const result = editingDistance
                ? await updateDistance(editingDistance.id, eventId, payload)
                : await createDistance(eventId, payload);

            if (result.success) {
                toast.success(editingDistance ? 'Táv frissítve!' : 'Táv létrehozva!');
                setIsDialogOpen(false);
                resetForm();
            } else {
                toast.error('Hiba: ' + result.error);
            }
        } catch (e) {
            toast.error('Váratlan hiba történt');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Biztosan törölni szeretnéd ezt a távot? A hozzá tartozó nevezések is törlődhetnek!')) return;
        setIsLoading(true);
        const result = await deleteDistance(id, eventId);
        setIsLoading(false);
        if (result.success) {
            toast.success('Táv törölve!');
        } else {
            toast.error('Törlési hiba: ' + result.error);
        }
    };

    const handleDuplicate = async (id: string) => {
        if (!confirm('Biztosan másolni szeretnéd ezt a távot?')) return;
        setIsLoading(true);
        const result = await duplicateDistance(id, eventId);
        setIsLoading(false);
        if (result.success) {
            toast.success('Táv másolva!');
        } else {
            toast.error('Másolási hiba: ' + result.error);
        }
    };

    // Tier Management
    const addTier = () => {
        setFormData(prev => ({
            ...prev,
            tiers: [...prev.tiers, { name: '', price: prev.price, priceEur: prev.priceEur || 0, validFrom: '', validTo: '' }]
        }));
    };

    const removeTier = (index: number) => {
        setFormData(prev => ({
            ...prev,
            tiers: prev.tiers.filter((_, i) => i !== index)
        }));
    };

    const updateTier = (index: number, field: keyof PriceTier, value: any) => {
        const newTiers = [...formData.tiers];
        // @ts-ignore
        newTiers[index][field] = value;
        setFormData(prev => ({ ...prev, tiers: newTiers }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent" />
                    Versenytávok
                </h3>
                <Button onClick={() => handleOpen()} className="bg-accent text-black hover:bg-accent/80 font-bold">
                    <Plus className="w-4 h-4 mr-2" />
                    Új Táv
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {distances.length === 0 && (
                    <div className="text-zinc-500 italic p-4 bg-zinc-900/50 rounded-xl text-center">
                        Még nincsenek távok rögzítve.
                    </div>
                )}
                {distances.map(dist => (
                    <div key={dist.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center group">
                        <div className="flex-1">
                            <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                {dist.name}
                                <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700 font-normal">
                                    {(dist.priceTiers || []).length > 0 ? `${(dist.priceTiers || []).length} ársáv` : 'Fix ár'}
                                </span>
                            </h4>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-zinc-400">
                                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {dist.capacityLimit} fő</span>
                                <span className="flex items-center gap-1">
                                    <DollarSign className="w-3.5 h-3.5" />
                                    {Number(dist.price).toLocaleString()} Ft
                                    {dist.priceEur ? ` / ${dist.priceEur} €` : ''}
                                    (Alap)
                                </span>
                                {dist.startTime && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(dist.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpen(dist)} className="text-blue-400 hover:bg-blue-400/10">
                                <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDuplicate(dist.id)} className="text-emerald-400 hover:bg-emerald-400/10">
                                <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(dist.id)} className="text-red-400 hover:bg-red-400/10">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal (using fixed overlay if Dialog not avail, but sticking to built-in Dialog classes I saw earlier) */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold font-heading">
                            {editingDistance ? 'Táv Szerkesztése' : 'Új Táv Létrehozása'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs uppercase text-zinc-500 font-bold mb-1 block">Megnevezés (HU)</label>
                                <input className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs uppercase text-zinc-500 font-bold mb-1 block">Létszámkorlát</label>
                                <input type="number" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" value={formData.capacityLimit} onChange={e => setFormData({ ...formData, capacityLimit: parseInt(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <label className="text-xs uppercase text-zinc-500 font-bold mb-1 block">Alapár HUF</label>
                                <input type="number" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" value={formData.price} onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <label className="text-xs uppercase text-zinc-500 font-bold mb-1 block">Alapár EUR</label>
                                <input type="number" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" value={formData.priceEur} onChange={e => setFormData({ ...formData, priceEur: parseInt(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <label className="text-xs uppercase text-zinc-500 font-bold mb-1 block">Start Időpont</label>
                                <input type="datetime-local" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                            </div>
                        </div>

                        {/* Pricing Tiers */}
                        <div className="border-t border-zinc-800 pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-bold">Dinamikus Árazás (Sávok)</h4>
                                <Button size="sm" variant="outline" onClick={addTier} className="text-xs border-dashed border-zinc-600">
                                    + Sáv Hozzáadása
                                </Button>
                            </div>

                            {formData.tiers.length === 0 ? (
                                <p className="text-sm text-zinc-500">Nincsenek beállítva sávok. Az alapár lesz érvényes mindig.</p>
                            ) : (
                                <div className="space-y-3">
                                    {formData.tiers.map((tier, idx) => (
                                        <div key={idx} className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 flex flex-col gap-3">
                                            <div className="flex justify-between items-center">
                                                <input
                                                    placeholder="Sáv neve (pl. Early Bird) *"
                                                    className={`bg-transparent border-b ${!tier.name ? 'border-red-500' : 'border-zinc-700'} text-white font-bold focus:ring-0 p-1 w-full mr-2`}
                                                    value={tier.name}
                                                    onChange={e => updateTier(idx, 'name', e.target.value)}
                                                />
                                                <Button size="sm" variant="ghost" onClick={() => removeTier(idx)} className="text-red-500 h-6 w-6 p-0 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2 text-sm">
                                                <div>
                                                    <label className="text-[10px] text-zinc-500 uppercase block">Ár HUF</label>
                                                    <input type="number" className="w-full bg-zinc-950 border border-zinc-700 rounded p-1" value={tier.price} onChange={e => updateTier(idx, 'price', parseInt(e.target.value))} />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-zinc-500 uppercase block">Ár EUR</label>
                                                    <input type="number" className="w-full bg-zinc-950 border border-zinc-700 rounded p-1" value={tier.priceEur || 0} onChange={e => updateTier(idx, 'priceEur', parseInt(e.target.value))} />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-zinc-500 uppercase block">Érvényes tól</label>
                                                    <input type="datetime-local" className="w-full bg-zinc-950 border border-zinc-700 rounded p-1 text-[10px]" value={tier.validFrom} onChange={e => updateTier(idx, 'validFrom', e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-zinc-500 uppercase block">Érvényes ig</label>
                                                    <input type="datetime-local" className="w-full bg-zinc-950 border border-zinc-700 rounded p-1 text-[10px]" value={tier.validTo} onChange={e => updateTier(idx, 'validTo', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Crew Pricing Section */}
                        <div className="border-t border-zinc-800 pt-4">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="text-lg font-bold flex items-center gap-2">
                                        <Users className="w-5 h-5 text-accent" />
                                        Crew Árazás (Segítők)
                                    </h4>
                                    <p className="text-sm text-zinc-500 mt-1">
                                        Dinamikus árak különböző crew létszámokhoz
                                    </p>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.useCrewPricing}
                                        onChange={(e) => setFormData({ ...formData, useCrewPricing: e.target.checked })}
                                        className="w-5 h-5 accent-accent rounded"
                                    />
                                    <span className="text-sm font-medium">Engedélyezés</span>
                                </label>
                            </div>

                            {formData.useCrewPricing && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-zinc-900/50 p-4 rounded-lg">
                                    {[1, 2, 3, 4, 5].map(crewCount => (
                                        <div key={crewCount} className="flex items-center gap-2">
                                            <label className="text-sm font-medium text-zinc-400 w-20">
                                                {crewCount} Crew:
                                            </label>
                                            <input
                                                type="number"
                                                className="flex-1 bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm focus:border-accent focus:outline-none"
                                                value={formData.crewPricing[crewCount.toString()]}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    crewPricing: {
                                                        ...formData.crewPricing,
                                                        [crewCount.toString()]: parseInt(e.target.value) || 0
                                                    }
                                                })}
                                                placeholder="Ár"
                                            />
                                            <span className="text-xs text-zinc-500">EUR</span>
                                        </div>
                                    ))}
                                    <div className="md:col-span-2 lg:col-span-3 mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-300">
                                        💡 <strong>Tipp:</strong> Ha crew árazást használsz, a nevezés oldal dinamikusan kérdezi meg a crew méretet (1-5 fő), és az ár automatikusan változik.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Mégse</Button>
                        <Button onClick={handleSave} disabled={isLoading} className="bg-white text-black hover:bg-zinc-200">
                            {isLoading ? 'Mentés...' : 'Mentés'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// MapPin helper needs import
import { MapPin as MapPinIcon } from 'lucide-react';
