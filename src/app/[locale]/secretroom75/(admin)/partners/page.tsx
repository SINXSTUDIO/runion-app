import { getPartners, deletePartner } from "@/actions/partners";
import { Button } from "@/components/ui/Button";
import PartnerListClient from "./PartnerListClient";
import { Plus, Handshake } from "lucide-react";

export default async function PartnersAdminPage() {
    const partners = await getPartners();

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                <div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                        <Handshake className="text-accent w-8 h-8" />
                        Partnerek Kezelése
                    </h1>
                    <p className="text-zinc-400 mt-1">Kezeld a főoldali stratégiai együttműködő partnereket</p>
                </div>
            </div>

            <PartnerListClient initialPartners={partners} />
        </div>
    );
}
