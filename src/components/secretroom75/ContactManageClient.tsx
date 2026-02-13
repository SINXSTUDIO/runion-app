'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
    upsertCompany,
    deleteCompany,
    upsertFAQ,
    deleteFAQ,
    updateFAQOrder
} from '@/actions/content';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Plus, Building2, HelpCircle } from 'lucide-react';

interface ContactManageProps {
    companies: any[];
    faqs: any[];
}

export default function ContactManageClient({ companies, faqs }: ContactManageProps) {
    const [activeTab, setActiveTab] = useState<'companies' | 'faq'>('companies');

    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b border-white/5 pb-2">
                <button
                    onClick={() => setActiveTab('companies')}
                    className={`pb-2 px-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'companies'
                        ? 'border-accent text-accent'
                        : 'border-transparent text-zinc-400 hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        CÉGEK
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('faq')}
                    className={`pb-2 px-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'faq'
                        ? 'border-accent text-accent'
                        : 'border-transparent text-zinc-400 hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        GYIK
                    </div>
                </button>
            </div>

            {activeTab === 'companies' && <CompanyManager initialCompanies={companies} />}
            {activeTab === 'faq' && <FAQManager initialFAQs={faqs} />}
        </div>
    );
}

// --- SUB COMPONENTS ---

function CompanyManager({ initialCompanies }: { initialCompanies: any[] }) {
    const router = useRouter();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [isCreating, setIsCreating] = useState(false);

    const startEdit = (company: any) => {
        setEditingId(company.id);
        setFormData(company);
        setIsCreating(false);
    };

    const startCreate = () => {
        setEditingId(null);
        setFormData({});
        setIsCreating(true);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setIsCreating(false);
        setFormData({});
    };

    const save = async () => {
        const res = await upsertCompany(formData);
        if (res.success) {
            cancelEdit();
            router.refresh();
        } else {
            toast.error(res.message);
        }
    };

    const remove = async (id: string) => {
        if (!confirm('Biztosan törlöd?')) return;
        const res = await deleteCompany(id);
        if (res.success) router.refresh();
    };

    return (
        <div className="space-y-6">
            {!isCreating && !editingId && (
                <div className="flex justify-end">
                    <Button onClick={startCreate} className="bg-accent text-black gap-2">
                        <Plus className="w-4 h-4" /> Új Cég
                    </Button>
                </div>
            )}

            {(isCreating || editingId) && (
                <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-bold text-white">{isCreating ? 'Új cég' : 'Cég szerkesztése'}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input
                            placeholder="Cég neve"
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                        <Input
                            placeholder="Azonosító (pl. bac)"
                            value={formData.key || ''}
                            onChange={e => setFormData({ ...formData, key: e.target.value })}
                        />
                        <Input
                            placeholder="Cím"
                            value={formData.address || ''}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                        <Input
                            placeholder="Telefonszám"
                            value={formData.phone || ''}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <Input
                            placeholder="Email"
                            value={formData.email || ''}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                        <Input
                            placeholder="Adószám"
                            value={formData.taxNumber || ''}
                            onChange={e => setFormData({ ...formData, taxNumber: e.target.value })}
                        />
                        <Input
                            placeholder="Nyilvántartási szám"
                            value={formData.regNumber || ''}
                            onChange={e => setFormData({ ...formData, regNumber: e.target.value })}
                        />
                        <Input
                            placeholder="Képviselő"
                            value={formData.representative || ''}
                            onChange={e => setFormData({ ...formData, representative: e.target.value })}
                        />
                        <Input
                            placeholder="IBAN"
                            value={formData.iban || ''}
                            onChange={e => setFormData({ ...formData, iban: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={cancelEdit} className="text-zinc-400">Mégse</Button>
                        <Button onClick={save} className="bg-accent text-black">Mentés</Button>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {initialCompanies.map((company) => (
                    <div key={company.id} className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl flex justify-between items-center group hover:border-white/10">
                        <div>
                            <h4 className="font-bold text-white">{company.name}</h4>
                            <p className="text-sm text-zinc-400">{company.address}</p>
                        </div>
                        <div className="flex gap-2 opacity-10 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" onClick={() => startEdit(company)}>
                                <Pencil className="w-4 h-4 text-blue-400" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => remove(company.id)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FAQManager({ initialFAQs }: { initialFAQs: any[] }) {
    const router = useRouter();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [isCreating, setIsCreating] = useState(false);

    const startEdit = (item: any) => {
        setEditingId(item.id);
        setFormData(item);
        setIsCreating(false);
    };

    const startCreate = () => {
        setEditingId(null);
        setFormData({});
        setIsCreating(true);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setIsCreating(false);
        setFormData({});
    };

    const save = async () => {
        const res = await upsertFAQ(formData);
        if (res.success) {
            cancelEdit();
            router.refresh();
        } else {
            toast.error(res.message);
        }
    };

    const remove = async (id: string) => {
        if (!confirm('Biztosan törlöd?')) return;
        const res = await deleteFAQ(id);
        if (res.success) router.refresh();
    };

    return (
        <div className="space-y-6">
            {!isCreating && !editingId && (
                <div className="flex justify-end">
                    <Button onClick={startCreate} className="bg-accent text-black gap-2">
                        <Plus className="w-4 h-4" /> Új Kérdés
                    </Button>
                </div>
            )}

            {(isCreating || editingId) && (
                <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-bold text-white">{isCreating ? 'Új kérdés' : 'Kérdés szerkesztése'}</h3>
                    <div className="space-y-4">
                        <Input
                            placeholder="Kérdés"
                            value={formData.question || ''}
                            onChange={e => setFormData({ ...formData, question: e.target.value })}
                        />
                        <Textarea
                            placeholder="Válasz"
                            value={formData.answer || ''}
                            onChange={e => setFormData({ ...formData, answer: e.target.value })}
                            className="min-h-[100px]"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={cancelEdit} className="text-zinc-400">Mégse</Button>
                        <Button onClick={save} className="bg-accent text-black">Mentés</Button>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {initialFAQs.map((faq) => (
                    <div key={faq.id} className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl flex justify-between items-start group hover:border-white/10">
                        <div className="space-y-1">
                            <h4 className="font-bold text-white max-w-2xl">{faq.question}</h4>
                            <p className="text-sm text-zinc-400 line-clamp-2 max-w-3xl">{faq.answer}</p>
                        </div>
                        <div className="flex gap-2 opacity-10 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" onClick={() => startEdit(faq)}>
                                <Pencil className="w-4 h-4 text-blue-400" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => remove(faq.id)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
