"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "./Button";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { uploadImage, deleteImage } from "@/actions/upload";
import Image from "next/image";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    description?: string;
    preset?: "avatar" | "standard";
}

export function ImageUpload({ value, onChange, label, description, preset = "standard" }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        console.log('[ImageUpload Client] Prepared formData, calling server action...');

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("preset", preset);

            console.log('[ImageUpload Client] Sending request...');
            const result = await uploadImage(formData);
            console.log('[ImageUpload Client] Response received:', result);

            setIsUploading(false);

            if (result.success && result.url) {
                onChange(result.url);
            } else {
                toast.error(result.error || "Hiba történt a feltöltés során");
            }
        } catch (err) {
            console.error('[ImageUpload Client] Unexpected error:', err);
            setIsUploading(false);
            toast.error("Váratlan hiba történt");
        }
    };

    const handleRemove = async () => {
        if (value) {
            await deleteImage(value);
            onChange("");
        }
    };

    return (
        <div className="space-y-4">
            {label && <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>}

            <div className="flex flex-col gap-4">
                {value ? (
                    <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                        <img
                            src={value}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center aspect-video w-full max-w-sm rounded-lg border-2 border-dashed border-zinc-800 bg-zinc-950 hover:border-accent/40 hover:bg-zinc-900/50 cursor-pointer transition-all group"
                    >
                        {isUploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                                <span className="text-sm text-gray-500 font-medium">Feltöltés és optimalizálás...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-3 rounded-full bg-zinc-900 group-hover:bg-zinc-800 transition-colors">
                                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-accent" />
                                </div>
                                <span className="text-sm text-gray-500 font-medium group-hover:text-gray-300">Kattints a kép kiválasztásához</span>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                )}

                {description && (
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{description}</p>
                )}
            </div>
        </div>
    );
}
