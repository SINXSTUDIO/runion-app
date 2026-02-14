import prisma from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import ProductList from '@/components/shop/ProductList';
import { ShoppingBag, FileText, Users, Heart, Shield, Truck, Star, Award, Gift, Zap, TrendingUp, ThumbsUp, CheckCircle, Info } from 'lucide-react';

export default async function BoutiquePage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations('BoutiquePage');

    const productsData = await prisma.product.findMany({
        where: { active: true },
        orderBy: { createdAt: 'desc' },
    });

    const products = productsData.map(p => ({
        ...p,
        price: Number(p.price)
    }));

    const settings = await prisma.globalSettings.findFirst();
    const shopEnabled = (settings as any)?.shopEnabled ?? true; // Default to true if not set

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Hero / Header */}
                <div className="relative w-full min-h-[50vh] flex items-center justify-center rounded-3xl overflow-hidden mb-16 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 group">
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/images/brutal-runner.png"
                            alt="Runion Boutique Hero"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 text-center p-8 max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-8xl font-black font-heading italic uppercase tracking-tighter mb-6 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                            <span className="text-white">RUN</span>
                            <span className="text-accent">ION</span>
                            <br className="md:hidden" />
                            <span className="text-white ml-2 md:ml-4">{t('title')}</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-zinc-200 font-medium max-w-2xl mx-auto mb-8 drop-shadow-md leading-relaxed">
                            {t('subtitle')}
                        </p>

                        <div className="flex justify-center gap-2 mb-8">
                            <div className="w-16 h-1 bg-accent rounded-full shadow-[0_0_10px_rgba(0,242,254,0.5)]"></div>
                            <div className="w-4 h-1 bg-white rounded-full opacity-50"></div>
                            <div className="w-4 h-1 bg-white rounded-full opacity-30"></div>
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-zinc-900/80 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-zinc-900 to-transparent pointer-events-none"></div>
                </div>

                {/* Product Grid */}
                <ProductList products={products} locale={locale} shopEnabled={shopEnabled} />

                {/* Info Section */}
                <FeatureSection t={t} settings={settings} locale={locale} />
            </div>
        </div>
    );
}

// Separate component to handle client-side-like rendering or just keep it server (Server Components can render Lucide icons)
// Separate component to handle client-side-like rendering or just keep it server (Server Components can render Lucide icons)

const ICON_MAP: Record<string, any> = {
    ShoppingBag, FileText, Users, Heart, Shield, Truck, Star, Award, Gift, Zap, TrendingUp, ThumbsUp, CheckCircle, Info
};

function FeatureSection({ t, settings, locale }: { t: any, settings: any, locale: string }) {

    const getLocalizedContent = (featureNum: 1 | 2 | 3, type: 'Title' | 'Desc') => {
        const key = `feature${featureNum}${type}`;
        if (locale === 'en' && settings?.[`${key}En`]) return settings[`${key}En`];
        if (locale === 'de' && settings?.[`${key}De`]) return settings[`${key}De`];
        return settings?.[key] || null; // Fallback to HU/default from settings
    };

    const renderIcon1 = () => {
        const iconName = settings?.feature1Icon;
        if (iconName && ICON_MAP[iconName]) {
            const Icon = ICON_MAP[iconName];
            return <Icon className="text-accent" />;
        }
        return <ShoppingBag className="text-accent" />;
    };

    const renderIcon2 = () => {
        const iconName = settings?.feature2Icon;
        if (iconName && ICON_MAP[iconName]) {
            const Icon = ICON_MAP[iconName];
            return <Icon className="text-accent" />;
        }
        return <span className="text-xl font-black text-accent">PDF</span>;
    };

    const renderIcon3 = () => {
        const iconName = settings?.feature3Icon;
        if (iconName && ICON_MAP[iconName]) {
            const Icon = ICON_MAP[iconName];
            return <Icon className="text-accent" />;
        }
        return <img src="/runners.png" alt="Runion" className="w-8 h-8 opacity-50 grayscale" />;
    };

    return (
        <div className="mt-20 border-t border-white/10 pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="bg-zinc-900/50 p-6 rounded-lg border border-white/5">
                <div className="bg-zinc-800 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto md:mx-0">
                    {renderIcon1()}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 uppercase">{getLocalizedContent(1, 'Title') || t('premium')}</h3>
                <p className="text-gray-400 text-sm">{getLocalizedContent(1, 'Desc') || t('premiumDesc')}</p>
            </div>
            <div className="bg-zinc-900/50 p-6 rounded-lg border border-white/5">
                <div className="bg-zinc-800 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto md:mx-0">
                    {renderIcon2()}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 uppercase">{getLocalizedContent(2, 'Title') || t('invoice')}</h3>
                <p className="text-gray-400 text-sm">{getLocalizedContent(2, 'Desc') || t('invoiceDesc')}</p>
            </div>
            <div className="bg-zinc-900/50 p-6 rounded-lg border border-white/5">
                <div className="bg-zinc-800 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto md:mx-0">
                    {renderIcon3()}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 uppercase">{getLocalizedContent(3, 'Title') || t('support')}</h3>
                <p className="text-gray-400 text-sm">{getLocalizedContent(3, 'Desc') || t('supportDesc')}</p>
            </div>
        </div>
    );
}

