'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { upsertFeature } from '@/actions/features';
import { X, Save, Plus, Trophy, Timer, Users, Camera, TrendingUp, Heart, Star, Zap, Shield, MapPin, Calendar, Award } from 'lucide-react';

type FeatureFormProps = {
    feature?: any;
    onClose: () => void;
};

const COMMON_ICONS = [
    { name: 'Trophy', icon: Trophy },
    { name: 'Timer', icon: Timer },
    { name: 'Users', icon: Users },
    { name: 'Camera', icon: Camera },
    { name: 'TrendingUp', icon: TrendingUp },
    { name: 'Heart', icon: Heart },
    { name: 'Star', icon: Star },
    { name: 'Zap', icon: Zap },
    { name: 'Shield', icon: Shield },
    { name: 'MapPin', icon: MapPin },
    { name: 'Calendar', icon: Calendar },
    { name: 'Award', icon: Award },
];

export default function FeatureForm({ feature, onClose }: FeatureFormProps) {
    const [loading, setLoading] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState(feature?.iconName || 'Trophy');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            id: feature?.id || undefined,
            iconName: selectedIcon,
            title: formData.get('title') as string,
            titleEn: (formData.get('titleEn') as string) || null,
            titleDe: (formData.get('titleDe') as string) || null,
            description: formData.get('description') as string,
            descriptionEn: (formData.get('descriptionEn') as string) || null,
            descriptionDe: (formData.get('descriptionDe') as string) || null,
            order: parseInt(formData.get('order') as string) || 0,
            active: formData.get('active') === 'true',
        };

        const result = await upsertFeature(data as any);
        if (result.success) {
            onClose();
        } else {
            setError(result.error || 'Failed to save feature');
            setLoading(false);
        }
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {feature ? <Save className="w-5 h-5 text-accent" /> : <Plus className="w-5 h-5 text-accent" />}
                    {feature ? "Feature Szerkesztése" : "Új Feature Hozzáadása"}
                </h3>
                <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Icon Selection */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-400 mb-3">Ikon Kiválasztása</label>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                            {COMMON_ICONS.map((item) => (
                                <button
                                    key={item.name}
                                    type="button"
                                    onClick={() => setSelectedIcon(item.name)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${selectedIcon === item.name
                                        ? 'bg-accent/10 border-accent text-accent'
                                        : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-600'
                                        }`}
                                >
                                    <item.icon className="w-6 h-6 mb-1" />
                                    <span className="text-[10px] uppercase tracking-tighter">{item.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Titles */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Cím (HU)</label>
                            <input
                                name="title"
                                defaultValue={feature?.title}
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Cím (EN)</label>
                            <input
                                name="titleEn"
                                defaultValue={feature?.titleEn}
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Cím (DE)</label>
                            <input
                                name="titleDe"
                                defaultValue={feature?.titleDe}
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Descriptions */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Leírás (HU)</label>
                            <textarea
                                name="description"
                                defaultValue={feature?.description}
                                rows={3}
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none resize-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Leírás (EN)</label>
                            <textarea
                                name="descriptionEn"
                                defaultValue={feature?.descriptionEn}
                                rows={3}
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Leírás (DE)</label>
                            <textarea
                                name="descriptionDe"
                                defaultValue={feature?.descriptionDe}
                                rows={3}
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none resize-none"
                            />
                        </div>
                    </div>

                    {/* Order & Active */}
                    <div className="flex items-center gap-6">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Sorrend</label>
                            <input
                                type="number"
                                name="order"
                                defaultValue={feature?.order || 0}
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                            />
                        </div>
                        <div className="mt-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="active"
                                        value="true"
                                        defaultChecked={feature ? feature.active : true}
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
                    <Button type="submit" disabled={loading} className="font-black uppercase italic tracking-tighter">
                        {loading ? "Mentés..." : (feature ? "Változtatások Mentése" : "Feature Mentése")}
                    </Button>
                </div>
            </form>
        </div>
    );
}
