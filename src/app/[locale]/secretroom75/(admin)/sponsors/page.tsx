import { getSponsors } from "@/actions/sponsors";
import { Award } from "lucide-react";
import SponsorListClient from "./SponsorListClient";

export default async function SponsorsAdminPage() {
    const sponsors = await getSponsors();

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                <div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                        <Award className="text-accent w-8 h-8" />
                        Támogatók Kezelése
                    </h1>
                    <p className="text-zinc-400 mt-1">Kezeld a főoldalon megjelenő támogatói logókat</p>
                </div>
            </div>

            <SponsorListClient initialSponsors={sponsors} />
        </div>
    );
}
