import { getTranslations } from 'next-intl/server';
import { serializeData } from '@/lib/utils/serialization';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import prisma from '@/lib/prisma';
import EventCard from '@/components/events/EventCard';
import { ArrowRight, Trophy, Timer, Users, Camera, TrendingUp, Heart } from 'lucide-react';
import HeroSlideshow from '@/components/ui/HeroSlideshow';
import EventCountdown from '@/components/ui/EventCountdown';
import SponsorSlider from '@/components/ui/SponsorSlider';
import NewsletterForm from '@/components/NewsletterForm';
import Image from 'next/image';
import Partners from '@/components/layout/Partners';
import FeaturedEvent from '@/components/home/FeaturedEvent';
import * as LucideIcons from 'lucide-react';
import { homeMetadata } from '@/lib/seo/metadata';
import { organizationSchema, websiteSchema, JsonLd } from '@/lib/seo/structured-data';
import { Metadata } from 'next';

interface HomePageProps {
    params: Promise<{ locale: string }>;
}

// SEO Metadata
export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
    const { locale } = await params;
    return {
        ...homeMetadata,
        alternates: {
            canonical: `https://runion.hu/${locale}`,
            languages: {
                'hu': '/hu',
                'en': '/en',
                'de': '/de',
            },
        },
    };
}

export default async function HomePage({ params }: HomePageProps) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'HomePage' });


    // Fetch global settings for featured event
    const settings = await prisma.globalSettings.findFirst({
        include: {
            featuredEvent: {
                include: {
                    distances: {
                        select: { price: true, name: true }
                    }
                }
            }
        } as any
    }).catch(() => null);

    // Fetch upcoming events
    const rawUpcomingEvents = await prisma.event.findMany({
        where: {
            status: 'PUBLISHED',
            eventDate: {
                gte: new Date(),
            },
        },
        orderBy: {
            eventDate: 'asc',
        },
        take: 3,
        include: {
            distances: {
                select: { price: true, name: true }
            }
        }
    });

    const upcomingEvents = serializeData(rawUpcomingEvents);

    // Determine featured event
    let featuredEvent = null;
    if ((settings as any)?.featuredEventActive && (settings as any)?.featuredEvent) {
        featuredEvent = serializeData((settings as any).featuredEvent);
    } else if (upcomingEvents.length > 0) {
        featuredEvent = upcomingEvents[0];
    }

    // Fetch dynamic features
    const dbFeatures = await prisma.homepageFeature.findMany({
        where: { active: true },
        orderBy: { order: 'asc' }
    }).catch(() => []);

    // Fetch dynamic gallery images
    const dbGalleryImages = await prisma.galleryImage.findMany({
        where: { active: true },
        orderBy: { order: 'asc' },
        take: 4
    }).catch(() => []);

    // Fetch dynamic sponsors
    const dbSponsors = await prisma.sponsor.findMany({
        where: { active: true },
        orderBy: { order: 'asc' }
    }).catch(() => []);

    return (
        <>
            {/* Structured Data for SEO & AI */}
            <JsonLd data={organizationSchema} />
            <JsonLd data={websiteSchema} />

            <div className="flex flex-col min-h-screen bg-black text-white">
                {/* Hero Section */}
                <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                    <HeroSlideshow />

                    <div className="relative z-20 container mx-auto px-4 text-center">
                        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 pb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 font-heading tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            {t('heroTitle')}
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                            {t('heroSubtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                            <Link href="/races">
                                <Button size="lg" variant="primary" className="rounded-full px-12 py-6 text-xl shadow-[0_0_25px_rgba(0,242,254,0.4)] hover:shadow-[0_0_40px_rgba(0,242,254,0.6)]">
                                    {t('cta')}
                                    <ArrowRight className="ml-2 w-6 h-6" />
                                </Button>
                            </Link>
                        </div>

                        {featuredEvent && (
                            <div className="mt-4">
                                <EventCountdown
                                    targetDate={featuredEvent.eventDate}
                                    eventTitle={locale === 'en' ? (featuredEvent.titleEn || featuredEvent.title) : locale === 'de' ? (featuredEvent.titleDe || featuredEvent.title) : featuredEvent.title}
                                />
                            </div>
                        )}
                    </div>
                </section>
                <Partners />

                {/* Featured Event Section */}
                {featuredEvent && (
                    <FeaturedEvent
                        event={featuredEvent}
                        locale={locale}
                        customSettings={settings ? {
                            titleHU: settings.featuredEventTitleHU,
                            titleEN: settings.featuredEventTitleEN,
                            titleDE: settings.featuredEventTitleDE,
                            descriptionHU: settings.featuredEventDescriptionHU,
                            descriptionEN: settings.featuredEventDescriptionEN,
                            descriptionDE: settings.featuredEventDescriptionDE,
                            buttonHU: settings.featuredEventButtonHU,
                            buttonEN: settings.featuredEventButtonEN,
                            buttonDE: settings.featuredEventButtonDE,
                        } : undefined}
                    />
                )}

                {/* Features / Why Us */}
                <section className="py-20 bg-zinc-950 border-t border-zinc-900">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {dbFeatures.length > 0 ? (
                                dbFeatures.map((feature: any) => {
                                    const IconComponent = (LucideIcons as any)[feature.iconName] || LucideIcons.HelpCircle;
                                    return (
                                        <FeatureItem
                                            key={feature.id}
                                            icon={<IconComponent className="w-8 h-8 text-accent" />}
                                            title={locale === 'en' ? (feature.titleEn || feature.title) : locale === 'de' ? (feature.titleDe || feature.title) : feature.title}
                                            description={locale === 'en' ? (feature.descriptionEn || feature.description) : locale === 'de' ? (feature.descriptionDe || feature.description) : feature.description}
                                        />
                                    );
                                })
                            ) : (
                                <>
                                    <FeatureItem
                                        icon={<Trophy className="w-8 h-8 text-yellow-500" />}
                                        title={t('feature1Title')}
                                        description={t('feature1Desc')}
                                    />
                                    <FeatureItem
                                        icon={<Timer className="w-8 h-8 text-blue-500" />}
                                        title={t('feature2Title')}
                                        description={t('feature2Desc')}
                                    />
                                    <FeatureItem
                                        icon={<Users className="w-8 h-8 text-emerald-500" />}
                                        title={t('feature3Title')}
                                        description={t('feature3Desc')}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Upcoming Races Section */}
                {upcomingEvents.length > 0 && (
                    <section className="py-24 bg-black relative">
                        <div className="container mx-auto px-4">
                            <div className="flex items-end justify-between mb-12">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                                        {t('upcomingTitle')}
                                    </h2>
                                    <p className="text-zinc-400 mt-2">{t('upcomingSubtitle')}</p>
                                </div>
                                <Link href="/races" className="hidden md:block">
                                    <Button variant="ghost" className="text-accent hover:text-white hover:bg-accent/10 border border-accent/20 hover:border-accent/60">
                                        {t('viewAll')} <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {upcomingEvents.map((event) => (
                                    <EventCard key={event.id} event={event} locale={locale} />
                                ))}
                            </div>

                            <div className="mt-12 text-center md:hidden">
                                <Link href="/races">
                                    <Button className="w-full" variant="outline">
                                        {t('viewAll')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* Sponsors Section */}
                <section className="py-20 bg-zinc-950 border-t border-zinc-900 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-black italic text-white mb-2 uppercase tracking-wide">
                                {t('sponsorsTitle') || "TÁMOGATÓINK"}
                            </h2>
                            <div className="w-32 h-1 bg-accent mx-auto mb-4" />
                            <p className="text-white text-lg font-bold uppercase tracking-widest">
                                {t('sponsorsSubtitle') || "CSATLAKOZZ TE IS HOZZÁNK"}
                            </p>
                        </div>

                        <SponsorSlider sponsors={dbSponsors} />
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-24 bg-black relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-extrabold text-white mb-4 font-heading">{t('statsTitle')}</h2>
                            <p className="text-zinc-400 max-w-2xl mx-auto">{t('statsSubtitle')}</p>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            <StatBox icon={<Trophy className="text-accent" />} value={t('stat1Value')} label={t('stat1Label')} />
                            <StatBox icon={<Users className="text-accent" />} value={t('stat2Value')} label={t('stat2Label')} />
                            <StatBox icon={<TrendingUp className="text-accent" />} value={t('stat3Value')} label={t('stat3Label')} />
                            <StatBox icon={<Heart className="text-accent" />} value={t('stat4Value')} label={t('stat4Label')} />
                        </div>
                    </div>
                </section>

                {/* Gallery Preview Section */}
                <section className="py-24 bg-zinc-950">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-12">
                            <div>
                                <h2 className="text-4xl font-extrabold text-white mb-2 font-heading">{t('galleryTitle')}</h2>
                                <p className="text-zinc-400">{t('gallerySubtitle')}</p>
                            </div>
                            <Camera className="w-12 h-12 text-zinc-800 hidden md:block" />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {dbGalleryImages.length > 0 ? (
                                dbGalleryImages.map((img: any, index: number) => (
                                    <div
                                        key={img.id}
                                        className={`aspect-square relative overflow-hidden rounded-2xl group ${index % 2 === 1 ? 'md:mt-8' : ''}`}
                                    >
                                        <Image
                                            src={img.imageUrl}
                                            alt={img.caption || `Gallery image ${index + 1}`}
                                            width={400}
                                            height={400}
                                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        {img.caption && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                {img.caption}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <>
                                    <div className="aspect-square relative overflow-hidden rounded-2xl group">
                                        <Image src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800" alt="Runner 1" width={400} height={400} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    <div className="aspect-square relative overflow-hidden rounded-2xl group md:mt-8">
                                        <Image src="https://images.unsplash.com/photo-1533560904424-a0c61dc306fc?q=80&w=800" alt="Runner 2" width={400} height={400} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    <div className="aspect-square relative overflow-hidden rounded-2xl group">
                                        <Image src="https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=800" alt="Runner 3" width={400} height={400} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    <div className="aspect-square relative overflow-hidden rounded-2xl group md:mt-8">
                                        <Image src="https://images.unsplash.com/photo-1452626038306-9aae0e07173a?q=80&w=800" alt="Runner 4" width={400} height={400} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Newsletter Section */}
                <section className="py-24 bg-black">
                    <div className="container mx-auto px-4">
                        <NewsletterForm />
                    </div>
                </section>
            </div>
        </>
    );
}

function StatBox({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
    return (
        <div className="text-center p-8 bg-zinc-900/30 rounded-3xl border border-zinc-800/50 hover:border-zinc-700 transition-colors">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-800/50 rounded-xl mb-4">
                {icon}
            </div>
            <div className="text-4xl font-black text-white mb-2 font-heading tracking-tighter">{value}</div>
            <div className="text-zinc-500 uppercase text-xs font-bold tracking-widest">{label}</div>
        </div>
    );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 hover:border-accent/40 hover:-translate-y-1 transition-all duration-300 group">
            <div className="bg-zinc-800/50 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-accent transition-colors">{title}</h3>
            <p className="text-zinc-400 leading-relaxed">{description}</p>
        </div>
    );
}
