'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { deleteGalleryImage } from '@/actions/gallery';
import GalleryForm from '@/components/secretroom75/GalleryForm';
import { Plus, Trash2, Edit2, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function GalleryListClient({ initialImages }: { initialImages: any[] }) {
    const [images, setImages] = useState(initialImages);
    const [editingImage, setEditingImage] = useState<any>(null);
    const [isAdding, setIsAdding] = useState(false);

    const handleDelete = async (id: string) => {
        if (window.confirm('Biztosan törölni szeretnéd ezt a képet?')) {
            const result = await deleteGalleryImage(id);
            if (result.success) {
                setImages(images.filter(img => img.id !== id));
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 font-black uppercase italic tracking-tighter"
                >
                    <Plus className="w-5 h-5" />
                    Új Kép Hozzáadása
                </Button>
            </div>

            {(isAdding || editingImage) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <GalleryForm
                        image={editingImage}
                        onClose={() => {
                            setIsAdding(false);
                            setEditingImage(null);
                        }}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images.map((image) => (
                    <div
                        key={image.id}
                        className={`bg-zinc-900 border ${image.active ? 'border-zinc-800' : 'border-red-900/30 opacity-60'} rounded-2xl overflow-hidden relative group transition-all hover:border-zinc-700`}
                    >
                        {!image.active && (
                            <div className="absolute top-3 right-3 px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase rounded border border-red-500/20 z-10">
                                Inaktív
                            </div>
                        )}

                        {/* Image Preview */}
                        <div className="relative h-48 bg-black overflow-hidden">
                            <Image
                                src={image.imageUrl}
                                alt={image.caption || "Gallery image"}
                                fill
                                className="object-cover transition-transform group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            {image.caption && (
                                <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{image.caption}</p>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                                <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                                    Sorrend: {image.order}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setEditingImage(image)}
                                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(image.id)}
                                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {images.length === 0 && (
                <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
                    <ImageIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500 italic">Még nincsenek képek hozzáadva a galériához.</p>
                </div>
            )}
        </div>
    );
}
