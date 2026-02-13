'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pencil, Trash2, CheckCircle, XCircle, Plus } from 'lucide-react';
import { updateMembershipTier, deleteMembershipTier, createMembershipTier } from '@/actions/memberships';
import { MembershipSchema } from '@/lib/schemas';
import { toast } from 'sonner';
import { z } from 'zod';

export default function MembershipTable({ memberships }: { memberships: any[] }) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const [editData, setEditData] = useState<any>({});

    const startEdit = (tier: any) => {
        setEditingId(tier.id);
        setEditData({
            name: tier.name,
            nameEn: tier.nameEn || '',
            nameDe: tier.nameDe || '',
            price: Number(tier.price),
            discountType: Number(tier.discountAmount) > 0 ? 'FIXED' : 'PERCENT',
            discountPercentage: Number(tier.discountPercentage),
            discountAmount: Number(tier.discountAmount),
            description: tier.description || '',
            descriptionEn: tier.descriptionEn || '',
            descriptionDe: tier.descriptionDe || '',
            features: tier.features || '',
            featuresEn: tier.featuresEn || '',
            featuresDe: tier.featuresDe || '',
            durationMonths: tier.durationMonths || 12
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData({});
        setIsCreating(false);
    };

    const validateData = (data: any) => {
        const result = MembershipSchema.safeParse(data);
        if (!result.success) {
            const errorMsg = result.error.issues[0].message;
            toast.error(errorMsg);
            return false;
        }
        return true;
    };

    const saveEdit = async (id: string) => {
        if (!validateData(editData)) return;

        const res = await updateMembershipTier(id, editData);
        if (res.success) {
            toast.success('Sikeres frissítés');
            setEditingId(null);
        } else {
            toast.error(res.error);
        }
    };

    const saveNew = async () => {
        if (!validateData(editData)) return;

        const res = await createMembershipTier(editData);
        if (res.success) {
            toast.success('Sikeres létrehozás');
            setIsCreating(false);
            setEditData({});
        } else {
            toast.error(res.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Biztosan törlöd?')) return;
        const res = await deleteMembershipTier(id);
        if (res.success) {
            toast.success('Törölve');
        } else {
            toast.error(res.error);
        }
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Tagsági Szintek</h3>
                <Button onClick={() => { setIsCreating(true); setEditData({}); }} className="bg-accent text-black font-bold">
                    <Plus className="w-4 h-4 mr-2" /> Új Szint
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-zinc-950 text-zinc-400 uppercase text-xs">
                        <tr>
                            <th className="p-4">Megnevezés</th>
                            <th className="p-4">Ár (Ft)</th>
                            <th className="p-4">Időtartam (Hó)</th>
                            <th className="p-4">Kedvezmény</th>
                            <th className="p-4">Leírás</th>
                            <th className="p-4">Jellemzők (Soronként)</th>
                            <th className="p-4">Felhasználók</th>
                            <th className="p-4 text-right">Műveletek</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {isCreating && (
                            <tr className="bg-accent/5">
                                <td className="p-4 space-y-2 align-top">
                                    <Input value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} placeholder="HU Név" className="bg-zinc-950 border-zinc-800" />
                                    <Input value={editData.nameEn || ''} onChange={e => setEditData({ ...editData, nameEn: e.target.value })} placeholder="EN Name" className="bg-zinc-950 border-zinc-800 text-xs" />
                                    <Input value={editData.nameDe || ''} onChange={e => setEditData({ ...editData, nameDe: e.target.value })} placeholder="DE Name" className="bg-zinc-950 border-zinc-800 text-xs" />
                                </td>
                                <td className="p-4 align-top">
                                    <Input type="number" value={editData.price || ''} onChange={e => setEditData({ ...editData, price: e.target.value })} placeholder="Ár" className="bg-zinc-950 w-32" />
                                </td>
                                <td className="p-4 align-top">
                                    <Input type="number" value={editData.durationMonths || 12} onChange={e => setEditData({ ...editData, durationMonths: e.target.value })} placeholder="Hónap" className="bg-zinc-950 w-24" />
                                </td>
                                <td className="p-4 align-top">
                                    <div className="flex flex-col gap-1">
                                        <select
                                            className="bg-zinc-950 border border-zinc-800 text-xs p-1 rounded"
                                            value={editData.discountType || 'PERCENT'}
                                            onChange={e => setEditData({ ...editData, discountType: e.target.value })}
                                        >
                                            <option value="PERCENT">% Százalék</option>
                                            <option value="FIXED">Fix Összeg</option>
                                        </select>
                                        {editData.discountType === 'FIXED' ? (
                                            <Input
                                                type="number"
                                                value={editData.discountAmount || 0}
                                                onChange={e => setEditData({ ...editData, discountAmount: e.target.value, discountPercentage: 0 })}
                                                placeholder="Ft"
                                                className="bg-zinc-950 w-24"
                                            />
                                        ) : (
                                            <Input
                                                type="number"
                                                value={editData.discountPercentage || 0}
                                                onChange={e => setEditData({ ...editData, discountPercentage: e.target.value, discountAmount: 0 })}
                                                placeholder="%"
                                                className="bg-zinc-950 w-24"
                                            />
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 space-y-2 align-top">
                                    <Input value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} placeholder="HU Leírás" className="bg-zinc-950 border-zinc-800" />
                                    <Input value={editData.descriptionEn || ''} onChange={e => setEditData({ ...editData, descriptionEn: e.target.value })} placeholder="EN Description" className="bg-zinc-950 border-zinc-800 text-xs" />
                                    <Input value={editData.descriptionDe || ''} onChange={e => setEditData({ ...editData, descriptionDe: e.target.value })} placeholder="DE Description" className="bg-zinc-950 border-zinc-800 text-xs" />
                                </td>
                                <td className="p-4 space-y-2 align-top">
                                    <textarea value={editData.features || ''} onChange={e => setEditData({ ...editData, features: e.target.value })} placeholder="HU Jellemzők (új sor)" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs min-h-[80px]" />
                                    <textarea value={editData.featuresEn || ''} onChange={e => setEditData({ ...editData, featuresEn: e.target.value })} placeholder="EN Features" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs min-h-[80px]" />
                                    <textarea value={editData.featuresDe || ''} onChange={e => setEditData({ ...editData, featuresDe: e.target.value })} placeholder="DE Features" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs min-h-[80px]" />
                                </td>
                                <td className="p-4 align-top">-</td>
                                <td className="p-4 text-right align-top flex gap-2 justify-end">
                                    <Button onClick={saveNew} className="bg-green-500 text-black px-2 py-1 h-8"><CheckCircle className="w-4 h-4" /></Button>
                                    <Button onClick={cancelEdit} className="bg-zinc-700 text-white px-2 py-1 h-8"><XCircle className="w-4 h-4" /></Button>
                                </td>
                            </tr>
                        )}
                        {memberships.map(tier => (
                            <tr key={tier.id} className="hover:bg-zinc-900/50">
                                {editingId === tier.id ? (
                                    <>
                                        <td className="p-4 space-y-2 align-top">
                                            <Input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="bg-zinc-950 border-zinc-800" />
                                            <Input value={editData.nameEn} onChange={e => setEditData({ ...editData, nameEn: e.target.value })} placeholder="EN Name" className="bg-zinc-950 border-zinc-800 text-xs" />
                                            <Input value={editData.nameDe} onChange={e => setEditData({ ...editData, nameDe: e.target.value })} placeholder="DE Name" className="bg-zinc-950 border-zinc-800 text-xs" />
                                        </td>
                                        <td className="p-4 align-top">
                                            <Input type="number" value={editData.price} onChange={e => setEditData({ ...editData, price: e.target.value })} className="bg-zinc-950 w-32" />
                                        </td>
                                        <td className="p-4 align-top">
                                            <Input type="number" value={editData.durationMonths} onChange={e => setEditData({ ...editData, durationMonths: e.target.value })} className="bg-zinc-950 w-24" />
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="flex flex-col gap-1">
                                                <select
                                                    className="bg-zinc-950 border border-zinc-800 text-xs p-1 rounded"
                                                    value={editData.discountType || 'PERCENT'}
                                                    onChange={e => setEditData({ ...editData, discountType: e.target.value })}
                                                >
                                                    <option value="PERCENT">% Százalék</option>
                                                    <option value="FIXED">Fix Összeg</option>
                                                </select>
                                                {editData.discountType === 'FIXED' ? (
                                                    <Input
                                                        type="number"
                                                        value={editData.discountAmount || 0}
                                                        onChange={e => setEditData({ ...editData, discountAmount: e.target.value, discountPercentage: 0 })}
                                                        placeholder="Ft"
                                                        className="bg-zinc-950 w-24"
                                                    />
                                                ) : (
                                                    <Input
                                                        type="number"
                                                        value={editData.discountPercentage || 0}
                                                        onChange={e => setEditData({ ...editData, discountPercentage: e.target.value, discountAmount: 0 })}
                                                        placeholder="%"
                                                        className="bg-zinc-950 w-24"
                                                    />
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 space-y-2 align-top">
                                            <Input value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} className="bg-zinc-950 border-zinc-800" />
                                            <Input value={editData.descriptionEn} onChange={e => setEditData({ ...editData, descriptionEn: e.target.value })} placeholder="EN Description" className="bg-zinc-950 border-zinc-800 text-xs" />
                                            <Input value={editData.descriptionDe} onChange={e => setEditData({ ...editData, descriptionDe: e.target.value })} placeholder="DE Description" className="bg-zinc-950 border-zinc-800 text-xs" />
                                        </td>
                                        <td className="p-4 space-y-2 align-top">
                                            <textarea value={editData.features || ''} onChange={e => setEditData({ ...editData, features: e.target.value })} placeholder="HU Jellemzők" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs min-h-[80px]" />
                                            <textarea value={editData.featuresEn || ''} onChange={e => setEditData({ ...editData, featuresEn: e.target.value })} placeholder="EN Features" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs min-h-[80px]" />
                                            <textarea value={editData.featuresDe || ''} onChange={e => setEditData({ ...editData, featuresDe: e.target.value })} placeholder="DE Features" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs min-h-[80px]" />
                                        </td>
                                        <td className="p-4 align-top text-zinc-400">{tier._count.users} fő</td>
                                        <td className="p-4 align-top text-right flex gap-2 justify-end">
                                            <Button onClick={() => saveEdit(tier.id)} className="bg-green-500 text-black px-2 py-1 h-8"><CheckCircle className="w-4 h-4" /></Button>
                                            <Button onClick={cancelEdit} className="bg-zinc-700 text-white px-2 py-1 h-8"><XCircle className="w-4 h-4" /></Button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="p-4 font-bold text-white align-top">
                                            <div>{tier.name}</div>
                                            <div className="text-[10px] text-zinc-500 flex gap-2">
                                                <span className="opacity-50">EN:</span> {tier.nameEn || tier.name}
                                                <span className="opacity-50 ml-2">DE:</span> {tier.nameDe || tier.name}
                                            </div>
                                        </td>
                                        <td className="p-4 text-zinc-300 align-top">{Number(tier.price).toLocaleString()} Ft</td>
                                        <td className="p-4 text-zinc-300 align-top">{tier.durationMonths || 12} hónap</td>
                                        <td className="p-4 text-accent font-bold align-top">
                                            {Number(tier.discountAmount) > 0 ? (
                                                <span>-{Number(tier.discountAmount).toLocaleString()} Ft</span>
                                            ) : (
                                                <span>{Number(tier.discountPercentage)}%</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-zinc-500 text-sm max-w-xs align-top">
                                            <div>{tier.description || '-'}</div>
                                            {tier.descriptionEn && <div className="text-[10px] italic">EN: {tier.descriptionEn}</div>}
                                            {tier.descriptionDe && <div className="text-[10px] italic">DE: {tier.descriptionDe}</div>}
                                        </td>
                                        <td className="p-4 text-zinc-500 text-sm max-w-xs align-top">
                                            <div className="whitespace-pre-line">{tier.features || '-'}</div>
                                            {tier.featuresEn && <hr className="border-zinc-800 my-1" />}
                                            {tier.featuresEn && <div className="text-[10px] italic whitespace-pre-line">EN: {tier.featuresEn}</div>}
                                            {tier.featuresDe && <hr className="border-zinc-800 my-1" />}
                                            {tier.featuresDe && <div className="text-[10px] italic whitespace-pre-line">DE: {tier.featuresDe}</div>}
                                        </td>
                                        <td className="p-4 text-zinc-400 align-top">{tier._count.users} fő</td>
                                        <td className="p-4 text-right flex gap-2 justify-end align-top">
                                            <Button onClick={() => startEdit(tier)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-2 py-1 h-8"><Pencil className="w-3 h-3" /></Button>
                                            <Button onClick={() => handleDelete(tier.id)} className="bg-red-900/20 hover:bg-red-900/40 text-red-500 px-2 py-1 h-8"><Trash2 className="w-3 h-3" /></Button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
