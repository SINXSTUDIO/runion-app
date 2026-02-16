"use client";

import { useState } from "react";
import { upsertSeller, deleteSeller } from "@/actions/sellers";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Building2, Banknote, MapPin, Phone, Mail, User, ShieldCheck, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import SellerImportModal from "./SellerImportModal";

// Use Radix UI Dialog or simple Overlay for modal. 
// For simplicity in this rapid fix, I will use a simple inline editing or a custom modal overlay.

export default function SellerListClient({ initialSellers }: { initialSellers: any[] }) {
    const [sellers, setSellers] = useState(initialSellers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingSeller, setEditingSeller] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const openCreateModal = () => {
        setEditingSeller({
            name: "",
            address: "",
            phone: "",
            email: "",
            taxNumber: "",
            regNumber: "",
            representative: "",
            bankName: "",
            bankAccountNumber: "",
            bankAccountNumberEuro: "",
            ibanEuro: "",
            active: true,
            order: 0
        });
        setIsModalOpen(true);
    };

    const openEditModal = (seller: any) => {
        setEditingSeller({ ...seller }); // Clone object
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Convert empty strings to null where appropriate is handled by action schema usually, but explicit cleaning is good
        const result = await upsertSeller(editingSeller);

        if (result.success) {
            toast.success("Szervezet mentve");
            setIsModalOpen(false);
            router.refresh();
        } else {
            toast.error(result.error || "Hiba mentés közben");
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Biztosan törölni szeretnéd ezt a szervezetet?")) return;

        const result = await deleteSeller(id);
        if (result.success) {
            toast.success("Szervezet törölve");
            router.refresh();
        } else {
            toast.error(result.error || "Hiba törlés közben");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end gap-3">
                <Button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2" variant="outline">
                    <Upload className="w-4 h-4" />
                    Import JSON
                </Button>
                <Button onClick={openCreateModal} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Új Szervezet
                </Button>
            </div>

            <SellerImportModal isOpen={isImportModalOpen} onClose={() => {
                setIsImportModalOpen(false);
                router.refresh();
            }} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sellers.map((seller) => (
                    <div key={seller.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-gradient-to-l from-zinc-900 via-zinc-900 to-transparent">
                            <button
                                onClick={() => openEditModal(seller)}
                                className="p-2 bg-zinc-800 text-white rounded-lg hover:bg-accent hover:text-black transition-colors"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(seller.id)}
                                className="p-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                                <Building2 className="w-6 h-6 text-accent" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg leading-tight">{seller.name}</h3>
                                {seller.id === 'bakonyorszag' || seller.key === 'bakonyorszag' && (
                                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">System Key</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-zinc-400">
                            {seller.address && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-zinc-600" />
                                    <span>{seller.address}</span>
                                </div>
                            )}
                            {seller.taxNumber && (
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-zinc-600" />
                                    <span>Adószám: <span className="text-zinc-300 font-mono">{seller.taxNumber}</span></span>
                                </div>
                            )}
                            {seller.bankAccountNumber && (
                                <div className="pt-2 mt-2 border-t border-zinc-800">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Banknote className="w-4 h-4 text-accent" />
                                        <span className="font-bold text-zinc-300">Számlaszám (HUF)</span>
                                    </div>
                                    <p className="font-mono text-zinc-500 text-xs pl-6">{seller.bankName}</p>
                                    <p className="font-mono text-white text-xs pl-6">{seller.bankAccountNumber}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center sticky top-0 bg-zinc-950 z-10">
                            <h2 className="text-xl font-bold text-white">
                                {editingSeller.id ? "Szervezet Szerkesztése" : "Új Szervezet Létrehozása"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Alapadatok */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-accent uppercase tracking-wider border-b border-zinc-800 pb-2">Alapadatok</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-zinc-400 mb-1">Szervezet Neve *</label>
                                        <input
                                            required
                                            value={editingSeller.name}
                                            onChange={(e) => setEditingSeller({ ...editingSeller, name: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-accent focus:outline-none"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-zinc-400 mb-1">Cím *</label>
                                        <input
                                            required
                                            value={editingSeller.address}
                                            onChange={(e) => setEditingSeller({ ...editingSeller, address: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-accent focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1">Adószám</label>
                                        <input
                                            value={editingSeller.taxNumber || ''}
                                            onChange={(e) => setEditingSeller({ ...editingSeller, taxNumber: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-accent focus:outline-none font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1">Cégjegyzékszám</label>
                                        <input
                                            value={editingSeller.regNumber || ''}
                                            onChange={(e) => setEditingSeller({ ...editingSeller, regNumber: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-accent focus:outline-none font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1">Képviselő</label>
                                        <input
                                            value={editingSeller.representative || ''}
                                            onChange={(e) => setEditingSeller({ ...editingSeller, representative: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-accent focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Banki Adatok */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-accent uppercase tracking-wider border-b border-zinc-800 pb-2">Banki Információk</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1">Bank Neve</label>
                                        <input
                                            value={editingSeller.bankName || ''}
                                            onChange={(e) => setEditingSeller({ ...editingSeller, bankName: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-accent focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1">Bankszámlaszám (HUF)</label>
                                        <input
                                            value={editingSeller.bankAccountNumber || ''}
                                            onChange={(e) => setEditingSeller({ ...editingSeller, bankAccountNumber: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-accent focus:outline-none font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1">Bankszámlaszám (EUR) / IBAN</label>
                                        <input
                                            value={editingSeller.bankAccountNumberEuro || ''}
                                            onChange={(e) => setEditingSeller({ ...editingSeller, bankAccountNumberEuro: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-accent focus:outline-none font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1">IBAN (Euro)</label>
                                        <input
                                            value={editingSeller.ibanEuro || ''}
                                            onChange={(e) => setEditingSeller({ ...editingSeller, ibanEuro: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-accent focus:outline-none font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Kapcsolat */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-accent uppercase tracking-wider border-b border-zinc-800 pb-2">Kapcsolat</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1">Email Cím</label>
                                        <input
                                            type="email"
                                            value={editingSeller.email || ''}
                                            onChange={(e) => setEditingSeller({ ...editingSeller, email: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-accent focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1">Telefonszám</label>
                                        <input
                                            value={editingSeller.phone || ''}
                                            onChange={(e) => setEditingSeller({ ...editingSeller, phone: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-white focus:border-accent focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Mégse</Button>
                                <Button type="submit" disabled={isLoading} className="bg-accent text-black hover:bg-white">
                                    {isLoading ? "Mentés..." : "Mentés"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
