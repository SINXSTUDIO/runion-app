"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "../ui/ImageUpload";
import { createPartner, updatePartner } from "@/actions/partners";
import { X, Save, Check, Plus } from "lucide-react";

type PartnerFormProps = {
    partner?: any;
    onClose: () => void;
};

export default function PartnerForm({ partner, onClose }: PartnerFormProps) {
    const [state, formAction] = useFormState(
        partner ? updatePartner.bind(null, partner.id) : createPartner,
        { message: "", errors: {} }
    );

    const [logoUrl, setLogoUrl] = useState(partner?.logoUrl || "");

    if (state?.success) {
        onClose();
    }

    return (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {partner ? <Save className="w-5 h-5 text-accent" /> : <Plus className="w-5 h-5 text-accent" />}
                    {partner ? "Partner Szerkesztése" : "Új Partner Hozzáadása"}
                </h3>
                <button
                    onClick={onClose}
                    className="text-zinc-500 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <form action={formAction} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Partner Neve</label>
                        <input
                            name="name"
                            defaultValue={partner?.name}
                            placeholder="Pl. Nemzeti Sportügynökség"
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none transition-colors"
                            required
                        />
                        {state?.errors?.name && <p className="text-red-500 text-sm mt-1">{state.errors.name}</p>}
                    </div>

                    <div className="space-y-3">
                        <ImageUpload
                            label="Partner Logó"
                            value={logoUrl}
                            onChange={setLogoUrl}
                            description="Tiszta, lehetőleg átlátszó hátterű PNG vagy optimalizált WebP logó."
                        />
                        <input type="hidden" name="logoUrl" value={logoUrl} />
                        {state?.errors?.logoUrl && <p className="text-red-500 text-sm mt-1">{state.errors.logoUrl}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Megjelenítési Sorrend</label>
                            <input
                                type="number"
                                name="order"
                                defaultValue={partner?.order || 0}
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
                                        defaultChecked={partner ? partner.active : true}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-zinc-800 rounded-full peer peer-checked:bg-accent transition-colors"></div>
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                                </div>
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Aktív Partner</span>
                            </label>
                        </div>
                    </div>
                </div>

                {state?.message && !state.success && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm">
                        {state.message}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white"
                    >
                        Mégse
                    </Button>
                    <Button
                        type="submit"
                        className="font-black uppercase italic tracking-tighter"
                    >
                        {partner ? "Változtatások Mentése" : "Partner Mentése"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
