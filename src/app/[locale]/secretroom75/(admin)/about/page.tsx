import { getAboutPage } from '@/actions/content';
import AboutForm from '@/components/secretroom75/AboutForm';

export default async function AdminAboutPage() {
    const aboutData = await getAboutPage();

    return (
        <div className="container mx-auto px-4 max-w-5xl py-8 space-y-8 animate-in fade-in zoom-in duration-500">
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
                    Rólunk <span className="text-accent">Szerkesztése</span>
                </h1>
                <p className="text-zinc-400 mt-2">
                    Itt módosíthatod a "Rólunk" oldal tartalmát és képeit.
                </p>
            </div>

            <AboutForm initialData={aboutData} />
        </div>
    );
}
