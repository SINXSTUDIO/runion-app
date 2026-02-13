import { getTranslations } from 'next-intl/server';
import { Trophy, Heart } from 'lucide-react';
import Image from 'next/image';
import prisma from '@/lib/prisma';

export default async function AboutPage(props: {
    params: Promise<{ locale: string }>
}) {
    const params = await props.params;
    const { locale } = params;
    const t = await getTranslations('AboutPage');

    // Fetch from DB
    const aboutData = await prisma.aboutPage.findFirst();

    // Determine content based on locale if translations exist in DB, 
    // otherwise fallback to translation keys, then seeded/primary content
    let title = aboutData?.title || t('title');
    let description = aboutData?.description || t('description');
    let founderRole = aboutData?.founderRole || t('founderRole'); // Default to HU from DB or translation key

    if (locale === 'en') {
        if (aboutData?.titleEn) title = aboutData.titleEn;
        else if (t.has('title')) title = t('title'); // Fallback to translation if localized DB title is missing
        if (aboutData?.descriptionEn) description = aboutData.descriptionEn;
        else if (t.has('description')) description = t('description'); // Fallback to translation file if DB is empty

        if (aboutData?.founderRoleEn) founderRole = aboutData.founderRoleEn;
        else if (t.has('founderRole')) founderRole = t('founderRole');
    } else if (locale === 'de') {
        if (aboutData?.titleDe) title = aboutData.titleDe;
        else if (t.has('title')) title = t('title');

        if (aboutData?.descriptionDe) description = aboutData.descriptionDe;
        else if (t.has('description')) description = t('description');

        if (aboutData?.founderRoleDe) founderRole = aboutData.founderRoleDe;
        else if (t.has('founderRole')) founderRole = t('founderRole');
    }

    // For founder name, also respect locale if needed (though name usually stays same, order might change)
    const founder = t.has('founder') ? t('founder') : (aboutData?.founderName || "Baranyai Máté");

    // Images
    const image1 = aboutData?.image1Url || "https://images.unsplash.com/photo-1452626038306-9aae0e07173a?q=80&w=800&auto=format&fit=crop";
    const image2 = aboutData?.image2Url || "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=800&auto=format&fit=crop";

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-10" />
                <div className="absolute inset-0 bg-[url('/images/brutal-runner.png')] bg-cover bg-center opacity-60 blur-sm scale-105 animate-pulse-slow" />

                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
                    <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent drop-shadow-2xl pr-4">
                        {title.toUpperCase()}
                    </h1>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-5xl mx-auto px-6 py-20 relative z-20 -mt-32">
                <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
                    <div className="grid md:grid-cols-[1fr_auto] gap-12 items-start">
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-3xl font-bold mb-6 text-accent flex items-center gap-3">
                                    <Heart className="w-8 h-8" />
                                    {t('mission')}
                                </h2>
                                <p className="text-xl leading-relaxed text-gray-300 font-light whitespace-pre-wrap">
                                    {description}
                                </p>
                            </div>

                            <div className="pt-8 border-t border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="bg-accent/10 p-4 rounded-full border border-accent/20">
                                        <Trophy className="w-8 h-8 text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black italic text-white">
                                            {founder}
                                        </p>
                                        <p className="text-gray-400 font-medium">
                                            {founderRole}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats / Visuals column - optional, could be images or stats */}
                        <div className="hidden md:flex flex-col gap-6 w-64">
                            <div className="aspect-square bg-zinc-800 rounded-2xl overflow-hidden relative group">
                                <Image
                                    src={image1}
                                    alt="Running Community"
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors" />
                            </div>
                            <div className="aspect-video bg-zinc-800 rounded-2xl overflow-hidden relative group">
                                <Image
                                    src={image2}
                                    alt="Running Success"
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
            </div>
        </div>
    );
}
