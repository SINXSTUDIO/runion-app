'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { updateAboutPage } from '@/actions/content';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface AboutFormProps {
    initialData: any;
}

export default function AboutForm({ initialData }: AboutFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        founderName: initialData?.founderName || '',
        founderRole: initialData?.founderRole || '',
        image1Url: initialData?.image1Url || '',
        image2Url: initialData?.image2Url || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (name: string, url: string) => {
        setFormData(prev => ({ ...prev, [name]: url }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await updateAboutPage(formData);
            if (res.success) {
                toast.success('Sikeres mentés!');
                router.refresh();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Hiba történt.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-bold text-white mb-4">Általános Információk</h2>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Címsor</label>
                    <Input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Rólunk"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Leírás</label>
                    <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="min-h-[200px] font-mono text-sm"
                        placeholder="Hosszú leírás..."
                    />
                </div>
            </div>

            <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-bold text-white mb-4">Alapító</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Név</label>
                        <Input
                            name="founderName"
                            value={formData.founderName}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Titulus</label>
                        <Input
                            name="founderRole"
                            value={formData.founderRole}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-bold text-white mb-4">Képek</h2>

                <div className="grid md:grid-cols-2 gap-8">
                    <ImageUpload
                        label="Kép 1 (Négyzetes)"
                        description="Válassz egy képet a közösségről"
                        value={formData.image1Url}
                        onChange={(url) => handleImageChange('image1Url', url)}
                    />

                    <ImageUpload
                        label="Kép 2 (Széles)"
                        description="Válassz egy képet a sikerekről"
                        value={formData.image2Url}
                        onChange={(url) => handleImageChange('image2Url', url)}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4 pb-12">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-accent text-black hover:bg-accent/90 px-8 py-6 text-lg font-bold transition-all hover:scale-105 active:scale-95"
                >
                    {isLoading ? 'Mentés...' : 'Változtatások Mentése'}
                </Button>
            </div>
        </form>
    );
}
