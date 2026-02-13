import { getCompanies, getFAQs } from '@/actions/content';
import ContactManageClient from '@/components/secretroom75/ContactManageClient';

export default async function AdminContactPage() {
    const [companies, faqs] = await Promise.all([
        getCompanies(),
        getFAQs()
    ]);

    return (
        <div className="container mx-auto px-4 max-w-5xl py-8 space-y-8 animate-in fade-in zoom-in duration-500">
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
                    Kapcsolat <span className="text-accent">Szerkesztése</span>
                </h1>
                <p className="text-zinc-400 mt-2">
                    Itt módosíthatod a szervezeti adatokat és a gyakran ismételt kérdéseket.
                </p>
            </div>

            <ContactManageClient companies={companies} faqs={faqs} />
        </div>
    );
}
