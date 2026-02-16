"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { importSellers } from "@/actions/sellers";

interface SellerImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SellerImportModal({ isOpen, onClose }: SellerImportModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const result = await importSellers(formData);
            if (result.success) {
                toast.success(`Sikeres importálás: ${result.count} szervezet frissítve`);
                onClose();
            } else {
                toast.error(result.error || "Hiba az importálás során");
            }
        } catch (error) {
            console.error("Import error:", error);
            toast.error("Váratlan hiba történt");
        } finally {
            setIsLoading(false);
            // Reset input
            e.target.value = "";
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Szervezetek Importálása (JSON)</h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-sm text-zinc-400">
                        Töltsd fel a JSON fájlt a szervezetek adatainak frissítéséhez. A rendszer az ID vagy Név alapján azonosítja a szervezeteket.
                    </p>

                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-700 border-dashed rounded-lg cursor-pointer bg-zinc-900/50 hover:bg-zinc-800 hover:border-accent transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-zinc-400" />
                                <p className="text-sm text-zinc-400">
                                    {isLoading ? "Feldolgozás..." : "Kattints a feltöltéshez"}
                                </p>
                                <p className="text-xs text-zinc-500">JSON formátum</p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept=".json"
                                onChange={handleFileUpload}
                                disabled={isLoading}
                            />
                        </label>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            Mégse
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
