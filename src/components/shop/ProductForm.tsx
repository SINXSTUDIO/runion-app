'use client';

import { useActionState, useState, useEffect } from 'react';
import { createProduct, updateProduct, deleteProduct } from '@/actions/admin-products';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useRouter } from '@/i18n/routing';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Textarea } from '@/components/ui/Textarea';

interface ProductFormProps {
    product?: any;
    mode: 'create' | 'edit';
}

export default function ProductForm({ product, mode }: ProductFormProps) {
    const router = useRouter();
    const action = mode === 'create' ? createProduct : updateProduct.bind(null, product?.id);
    const [state, formAction, isPending] = useActionState(action, undefined);

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message);
            router.push('/secretroom75/products');
            router.refresh();
        }
    }, [state, router]);

    const [useSizeStock, setUseSizeStock] = useState(!!product?.stockBreakdown);
    const [sizeStocks, setSizeStocks] = useState<Record<string, number>>(product?.stockBreakdown || {});
    const [newSize, setNewSize] = useState('');

    const handleAddSize = () => {
        if (!newSize.trim()) return;
        setSizeStocks(prev => ({ ...prev, [newSize.trim().toUpperCase()]: 0 }));
        setNewSize('');
    };

    const handleSizeStockChange = (size: string, count: number) => {
        setSizeStocks(prev => ({ ...prev, [size]: count >= 0 ? count : 0 }));
    };

    const handleRemoveSize = (size: string) => {
        const newStocks = { ...sizeStocks };
        delete newStocks[size];
        setSizeStocks(newStocks);
    };

    const handleDelete = async () => {
        if (confirm('Biztosan törölni szeretnéd ezt a terméket?')) {
            await deleteProduct(product.id);
            toast.success('Termék törölve');
            router.push('/secretroom75/products');
            router.refresh();
        }
    };

    const insertTemplate = (fieldName: string, lang: 'hu' | 'en' | 'de') => {
        const textarea = document.querySelector(`textarea[name="${fieldName}"]`) as HTMLTextAreaElement;
        if (!textarea) return;

        const templates = {
            hu: `\n\n### Férfi Mérettáblázat\n\n| Méret | Hossz (cm) | Szélesség (cm) |\n|---|---|---|\n| XXS | 64 | 44 |\n| XS | 66 | 46 |\n| S | 68 | 48 |\n| M | 70 | 50 |\n| L | 72 | 53 |\n| XL | 74 | 56 |\n| XXL | 76 | 58 |\n\n### Női Mérettáblázat\n\n| Méret | Hossz (cm) | Szélesség (cm) |\n|---|---|---|\n| XXS | 60 | 40 |\n| XS | 62 | 42 |\n| S | 64 | 44 |\n| M | 66 | 46 |\n| L | 68 | 49 |\n| XL | 70 | 52 |\n| XXL | 72 | 55 |`,
            en: `\n\n### Men's Size Chart\n\n| Size | Length (cm) | Width (cm) |\n|---|---|---|\n| XXS | 64 | 44 |\n| XS | 66 | 46 |\n| S | 68 | 48 |\n| M | 70 | 50 |\n| L | 72 | 53 |\n| XL | 74 | 56 |\n| XXL | 76 | 58 |\n\n### Women's Size Chart\n\n| Size | Length (cm) | Width (cm) |\n|---|---|---|\n| XXS | 60 | 40 |\n| XS | 62 | 42 |\n| S | 64 | 44 |\n| M | 66 | 46 |\n| L | 68 | 49 |\n| XL | 70 | 52 |\n| XXL | 72 | 55 |`,
            de: `\n\n### Herren Größentabelle\n\n| Größe | Länge (cm) | Breite (cm) |\n|---|---|---|\n| XXS | 64 | 44 |\n| XS | 66 | 46 |\n| S | 68 | 48 |\n| M | 70 | 50 |\n| L | 72 | 53 |\n| XL | 74 | 56 |\n| XXL | 76 | 58 |\n\n### Damen Größentabelle\n\n| Größe | Länge (cm) | Breite (cm) |\n|---|---|---|\n| XXS | 60 | 40 |\n| XS | 62 | 42 |\n| S | 64 | 44 |\n| M | 66 | 46 |\n| L | 68 | 49 |\n| XL | 70 | 52 |\n| XXL | 72 | 55 |`
        };

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);

        textarea.value = before + templates[lang] + after;

        // Trigger change event/update needed? Uncontrolled inputs update automatically.
        textarea.focus();
    };

    return (
        <form action={formAction} className="space-y-6 max-w-4xl mx-auto bg-zinc-900 p-8 rounded-xl border border-white/10 relative">
            {mode === 'edit' && (
                <div className="absolute top-8 right-8 z-10">
                    <Button type="button" variant="ghost" size="icon" onClick={handleDelete} title="Végleges törlés" className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Multilingual Content */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="hu" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6 bg-zinc-800">
                            <TabsTrigger value="hu">Magyar (Alap)</TabsTrigger>
                            <TabsTrigger value="en">Angol</TabsTrigger>
                            <TabsTrigger value="de">Német</TabsTrigger>
                        </TabsList>

                        <TabsContent forceMount={true} value="hu" className="space-y-4 animate-in fade-in-0 slide-in-from-left-1 duration-200 data-[state=inactive]:hidden">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-zinc-400">Termék neve (HU) *</label>
                                <Input name="name" defaultValue={product?.name} required placeholder="pl. RUNION Hoodie" className="bg-zinc-800 border-zinc-700 text-white" />
                                {state?.errors?.name && <p className="text-red-500 text-xs">{state.errors.name}</p>}
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-zinc-400">Leírás (HU)</label>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => insertTemplate('description', 'hu')} className="text-xs text-accent hover:text-white h-6">
                                        + Mérettáblázat sablon
                                    </Button>
                                </div>
                                <Textarea name="description" defaultValue={product?.description} placeholder="Termék leírása, mérettáblázat..." rows={12} className="bg-zinc-800 border-zinc-700 text-white font-mono text-sm" />
                            </div>
                        </TabsContent>

                        <TabsContent forceMount={true} value="en" className="space-y-4 animate-in fade-in-0 slide-in-from-left-1 duration-200 data-[state=inactive]:hidden">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-zinc-400">Termék neve (EN)</label>
                                <Input name="nameEn" defaultValue={product?.nameEn} placeholder="pl. RUNION Hoodie" className="bg-zinc-800 border-zinc-700 text-white" />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-zinc-400">Leírás (EN)</label>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => insertTemplate('descriptionEn', 'en')} className="text-xs text-accent hover:text-white h-6">
                                        + Size Chart Template
                                    </Button>
                                </div>
                                <Textarea name="descriptionEn" defaultValue={product?.descriptionEn} placeholder="Product description, size chart..." rows={12} className="bg-zinc-800 border-zinc-700 text-white font-mono text-sm" />
                            </div>
                        </TabsContent>

                        <TabsContent forceMount={true} value="de" className="space-y-4 animate-in fade-in-0 slide-in-from-left-1 duration-200 data-[state=inactive]:hidden">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-zinc-400">Termék neve (DE)</label>
                                <Input name="nameDe" defaultValue={product?.nameDe} placeholder="z.B. RUNION Hoodie" className="bg-zinc-800 border-zinc-700 text-white" />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-zinc-400">Leírás (DE)</label>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => insertTemplate('descriptionDe', 'de')} className="text-xs text-accent hover:text-white h-6">
                                        + Größentabelle Vorlage
                                    </Button>
                                </div>
                                <Textarea name="descriptionDe" defaultValue={product?.descriptionDe} placeholder="Produktbeschreibung, Größentabelle..." rows={12} className="bg-zinc-800 border-zinc-700 text-white font-mono text-sm" />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column: Global Settings */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-zinc-400">Ár (HUF)</label>
                        <Input name="price" type="number" defaultValue={product?.price} required className="bg-zinc-800 border-zinc-700 text-white text-lg font-bold" />
                        {state?.errors?.price && <p className="text-red-500 text-xs">{state.errors.price}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-zinc-400">Kép</label>
                        <input type="hidden" name="imageUrl" id="imageUrl" defaultValue={product?.imageUrl || ''} />
                        <ImageUpload
                            value={product?.imageUrl || ''}
                            onChange={(url) => {
                                const el = document.getElementById('imageUrl') as HTMLInputElement;
                                if (el) el.value = url;
                            }}
                        />
                    </div>

                    {/* Stock Management */}
                    <div className="bg-zinc-950/30 p-4 rounded-lg border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-zinc-400">Készletkezelés</label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-500">Méretek</span>
                                <Switch checked={useSizeStock} onCheckedChange={setUseSizeStock} />
                            </div>
                        </div>

                        {!useSizeStock ? (
                            <div>
                                <label className="block text-sm font-medium mb-1 text-zinc-400">Globális Készlet (db)</label>
                                <Input name="stock" type="number" defaultValue={product?.stock ?? 0} required className="bg-zinc-800 border-zinc-700 text-white" />
                                <p className="text-xs text-zinc-500 mt-1">Ha 0, akkor "Nem rendelhető".</p>
                                {state?.errors?.stock && <p className="text-red-500 text-xs">{state.errors.stock}</p>}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <input type="hidden" name="stockBreakdown" value={JSON.stringify(sizeStocks)} />
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Méret"
                                        value={newSize}
                                        onChange={e => setNewSize(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-white flex-1 min-w-0"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddSize();
                                            }
                                        }}
                                    />
                                    <Button type="button" onClick={handleAddSize} variant="secondary" size="sm">Add</Button>
                                </div>

                                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                                    {Object.entries(sizeStocks).map(([size, count]) => (
                                        <div key={size} className="flex justify-between items-center bg-zinc-800 p-2 rounded border border-zinc-700 text-sm">
                                            <span className="font-bold text-white">{size}</span>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    value={count}
                                                    onChange={(e) => handleSizeStockChange(size, Number(e.target.value))}
                                                    className="w-16 h-7 bg-zinc-900 border-zinc-600 text-white text-right p-1"
                                                />
                                                <button type="button" onClick={() => handleRemoveSize(size)} className="text-zinc-500 hover:text-red-400">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {Object.keys(sizeStocks).length === 0 && (
                                        <p className="text-xs text-zinc-500 text-center py-2">Nincs méret.</p>
                                    )}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-zinc-800 text-xs">
                                    <span className="text-zinc-400">Összesen:</span>
                                    <span className="font-bold text-accent">{Object.values(sizeStocks).reduce((a, b) => a + b, 0)} db</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 bg-zinc-800/50 p-4 rounded-lg border border-white/5">
                        <Switch name="active" defaultChecked={product?.active ?? true} />
                        <div>
                            <span className="block font-medium text-white text-sm">Aktív</span>
                            <span className="text-xs text-zinc-500 block">Látható a shopban</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button type="button" variant="outline" onClick={() => router.back()}>Mégse</Button>
                <Button type="submit" disabled={isPending} size="lg" className="w-full md:w-auto">
                    {isPending ? 'Mentés...' : (mode === 'create' ? 'Termék Létrehozása' : 'Módosítások Mentése')}
                </Button>
            </div>

            {state?.message && !state.success && (
                <p className="text-red-500 text-center font-mono text-sm bg-red-500/10 p-2 rounded mt-4">
                    {typeof state.message === 'object' ? JSON.stringify(state.message) : state.message}
                </p>
            )}
        </form>
    );
}
