'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '../ui/ImageUpload';
import { upsertSponsor } from '@/actions/sponsors';
import { X, Save, Plus } from 'lucide-react';

type SponsorFormProps = {
    sponsor?: any;
    onClose: () => void;
};

export default function SponsorForm({ sponsor, onClose }: SponsorFormProps) {
    const [loading, setLoading] = useState(false);
    const [logoUrl, setLogoUrl] = useState(sponsor?.logoUrl || '');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            id: sponsor?.id || undefined,
            name: formData.get('name') as string,
            logoUrl: logoUrl,
            order: parseInt(formData.get('order') as string) || 0,
            active: formData.get('active') === 'true',
        };

        const result = await upsertSponsor(data as any);
        if (result.success) {
            onClose();
            window.location.reload();
        } else {
            setError(result.error || 'Failed to save sponsor');
            setLoading(false);
        }
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 w-full max-w-xl">
            <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {sponsor ? <Save className="w-5 h-5 text-accent" /> : <Plus className="w-5 h-5 text-accent" />}
                    {sponsor ? "Támogató Szerkesztése" : "Új Támogató Hozzáadása"}
                </h3>
                <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Támogató Neve</label>
                        <input
                            name="name"
                            defaultValue={sponsor?.name}
                            placeholder="Pl. Adidas"
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                            required
                        />
                    </div>

                    {/* Logo Upload */}
                    <div>
                        <ImageUpload
                            label="Támogató Logó"
                            value={logoUrl}
                            onChange={setLogoUrl}
                            description="Ajánlott átlátszó háttér (PNG). Optimális méret: 200x100px."
                        />
                    </div>

                    {/* Order & Active */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Sorrend</label>
                            <input
                                type="number"
                                name="order"
                                defaultValue={sponsor?.order || 0}
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                            />
                        </div>
                        <div className="flex items-end pb-3">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="active"
                                        value="true"
                                        defaultChecked={sponsor ? sponsor.active : true}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-zinc-800 rounded-full peer peer-checked:bg-accent transition-colors"></div>
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                                </div>
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Aktív</span>
                            </label>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Mégse</Button>
                    <Button type="submit" disabled={loading || !logoUrl} className="font-black uppercase italic tracking-tighter">
                        {loading ? "Mentés..." : (sponsor ? "Változtatások Mentése" : "Támogató Mentése")}
                    </Button>
                </div>
            </form>
        </div>
    );
}
