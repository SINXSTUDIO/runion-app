import { getSellers } from "@/actions/sellers";
import SellerListClient from "./components/SellerListClient";
import { Building2 } from "lucide-react";

export default async function SellersAdminPage() {
    const sellers = await getSellers();

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                <div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                        <Building2 className="text-accent w-8 h-8" />
                        Szervezetek & Számlázás
                    </h1>
                    <p className="text-zinc-400 mt-1">Eseményekhez és tranzakciókhoz rendelt hivatalos szervezetek/kedvezményezettek kezelése.</p>
                    <p className="text-xs text-red-400 mt-2 font-bold uppercase tracking-wider">FIGYELEM: Az adatok módosítása kihat a számlákra és folyamatban lévő eseményekre!</p>
                </div>
            </div>

            <SellerListClient initialSellers={sellers} />
        </div>
    );
}
