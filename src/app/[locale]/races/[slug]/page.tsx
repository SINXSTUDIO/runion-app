import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import DistanceCard from '@/components/events/DistanceCard';
import { SocialProofWidget } from '@/components/events/SocialProofWidget';
import { generateEventMetadata } from '@/lib/seo/metadata';
import { generateEventSchema, generateBreadcrumbSchema, organizationSchema, JsonLd } from '@/lib/seo/structured-data';
import { ShareButtons } from '@/components/events/ShareButtons';
import { InfopackSection } from '@/components/events/InfopackSection';

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { slug, locale } = await params;

    const event = await prisma.event.findUnique({
        where: { slug },
        include: {
            distances: true,
            seller: true,
            sellerEuro: true,
            organizer: true
        }
    });

    if (!event) {
        return { title: 'Event not found' };
    }

    return generateEventMetadata(
        {
            title: event.title,
            description: event.description,
            location: event.location,
            slug: event.slug,
            coverImage: event.coverImage || undefined,
            eventDate: new Date(event.eventDate),
        },
        locale
    );
}

export default async function EventDetailsPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { slug, locale } = await params;
    const t = await getTranslations({ locale, namespace: 'EventDetails' });

    const event = await prisma.event.findUnique({
        where: { slug },
        include: {
            distances: {
                include: {
                    _count: {
                        select: { registrations: true }
                    }
                }
            },
            seller: true,
            sellerEuro: true,
            organizer: true
        }
    });

    if (!event) {
        notFound();
    }

    // Fetch total count separately (or sum up distance counts, but separate is safer if there are deleted distances?)
    // Actually, simple count is fine.
    const totalRegistrations = await prisma.registration.count({
        where: { distance: { eventId: event.id } }
    });

    const dateStr = new Date(event.eventDate).toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Prepare distance counts for widget
    const distanceCounts = event.distances.map(d => ({
        id: d.id,
        name: d.name,
        count: d._count.registrations
    }));

    // Generate structured data schemas
    const eventSchema = generateEventSchema({
        title: event.title,
        description: event.description,
        slug: event.slug,
        eventDate: new Date(event.eventDate),
        endDate: event.endDate ? new Date(event.endDate) : null,
        location: event.location,
        coverImage: event.coverImage || undefined,
        distances: event.distances.map(d => ({
            ...d,
            price: Number(d.price),
            priceEur: d.priceEur ? Number(d.priceEur) : undefined,
            _count: { registrations: d._count.registrations }
        })),
        organizer: event.organizer ? {
            clubName: event.organizer.clubName || undefined
        } : undefined,
    });

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Races', url: '/races' },
        { name: event.title, url: `/races/${event.slug}` },
    ]);

    return (
        <>
            {/* Structured Data - JSON-LD for SEO & AI */}
            <JsonLd data={eventSchema} />
            <JsonLd data={breadcrumbSchema} />
            <JsonLd data={organizationSchema} />

            <div className="min-h-screen bg-black text-white pb-20">
                {/* Hero Section */}
                <div className="relative w-full h-[60vh] min-h-[500px]">
                    <Image
                        src={event.coverImage || '/images/maintenance-bg-cheer.png'}
                        alt={event.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                    <div className="absolute bottom-0 inset-x-0 pb-12 pt-32 bg-gradient-to-t from-black to-transparent">
                        <div className="container mx-auto px-4">
                            <Badge variant="outline" className="text-accent border-accent/50 bg-accent/10 mb-6 backdrop-blur-md px-4 py-1 text-sm uppercase tracking-widest font-bold">
                                {event.status === 'PUBLISHED' ? t('openRegistration') : t('closedRegistration')}
                            </Badge>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-heading tracking-tighter uppercase mb-4 text-white leading-tight">
                                {event.title}
                            </h1>
                            <div className="flex flex-wrap text-zinc-300 gap-x-8 gap-y-3 font-medium text-lg">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-accent" />
                                    {dateStr}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-accent" />
                                    {event.location}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="container mx-auto px-4 mt-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Right Column: Sidebar */}
                        <div className="space-y-8">
                            {/* Registration CTA Box */}
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 sticky top-32 backdrop-blur-sm">
                                <h3 className="text-2xl font-black font-heading uppercase mb-4 text-white">{t('ctaTitle')}</h3>
                                <p className="text-zinc-400 mb-6 text-lg">
                                    {t('deadline')} <br />
                                    <span className="text-accent font-bold text-xl">
                                        {new Date(event.regDeadline).toLocaleDateString(locale)}
                                    </span>
                                </p>
                                <Link href={`/races/${slug}/register`}>
                                    <Button className="w-full bg-accent text-black hover:bg-accent/80 font-black h-14 rounded-full text-xl mb-4 shadow-[0_0_20px_rgba(0,242,255,0.2)] transition-all hover:scale-[1.02]">
                                        {t('startRegistration')}
                                        <ArrowRight className="w-6 h-6 ml-2" />
                                    </Button>
                                </Link>
                            </div>

                            {/* Social Proof Widget */}
                            {totalRegistrations > 0 && (
                                <SocialProofWidget
                                    eventId={event.id}
                                    totalRegistrations={totalRegistrations}
                                    distanceCounts={distanceCounts}
                                />
                            )}

                            {/* Location Map Link */}
                            {event.googleMapsUrl && (
                                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 hover:border-accent/50 transition-all group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <MapPin className="w-6 h-6 text-accent" />
                                        <h3 className="text-xl font-bold font-heading uppercase text-white">{t('locationMap')}</h3>
                                    </div>
                                    <p className="text-zinc-400 mb-4">{event.location}</p>
                                    <a
                                        href={event.googleMapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block"
                                    >
                                        <Button className="w-full bg-accent/10 text-accent border border-accent/50 hover:bg-accent hover:text-black font-bold transition-all group-hover:scale-[1.02]">
                                            🗺️ {t('openInMaps')}
                                        </Button>
                                    </a>
                                </div>
                            )}
                            {/* Share Buttons */}
                            <ShareButtons
                                url={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://runion.hu'}/races/${slug}`}
                                title={event.title}
                                labels={{
                                    share: t('share'),
                                    copy: t('copyLink'),
                                    copied: t('copied')
                                }}
                            />
                        </div>

                        {/* Left Column: Description & Distances */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* About Section */}
                            <section className="bg-zinc-900/30 border border-zinc-800/50 p-4 md:p-8 rounded-3xl">
                                <h2 className="text-xl md:text-3xl font-black font-heading uppercase mb-4 md:mb-8 flex items-center gap-2 md:gap-4 text-white">
                                    <span className="w-1 md:w-2 h-6 md:h-8 bg-accent rounded-full" />
                                    {t('aboutTitle')}
                                </h2>
                                <div className="prose prose-invert prose-sm md:prose-xl max-w-none text-zinc-300 leading-relaxed">
                                    <div dangerouslySetInnerHTML={{
                                        __html: (locale === 'en' ? (event.descriptionEn || event.description) :
                                            locale === 'de' ? (event.descriptionDe || event.description) :
                                                event.description).replace(/\n/g, '<br/>')
                                    }} />
                                </div>
                            </section>

                            {/* Distance Cards */}
                            {event.distances && event.distances.length > 0 && (
                                <section>
                                    <h2 className="text-xl md:text-3xl font-black font-heading uppercase mb-4 md:mb-8 flex items-center gap-2 md:gap-4 text-white">
                                        <span className="w-1 md:w-2 h-6 md:h-8 bg-accent rounded-full" />
                                        {t('distances')}
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6">
                                        {event.distances.map((distance: any, index: number) => (
                                            <DistanceCard
                                                key={distance.id}
                                                distance={distance}
                                                eventSlug={slug}
                                                locale={locale}
                                                index={index}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* Infopack Section - Only if active */}
                    {event.infopackActive && event.infopack && (
                        <InfopackSection infopack={event.infopack as any} />
                    )}
                </div>
                {/* Payment Info Section - HIDDEN AS PER USER REQUEST (2026-02-17) but keeping data valid */}
                {/* 
                {(event.seller || event.sellerEuro) && (
                        <div className="mt-12 p-8 bg-zinc-900 rounded-2xl border border-zinc-800">
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <span className="text-accent">💳</span>
                                Fizetési Információk / Payment Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-lg font-bold text-zinc-300 border-b border-zinc-700 pb-2">
                                        🇭🇺 Belföldi utalás (HUF)
                                    </h4>
                                    <div className="space-y-2 text-zinc-400">
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-zinc-500">Kedvezményezett</p>
                                            <p className="text-white font-medium">{event.seller?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-zinc-500">Bank</p>
                                            <p className="text-white">{event.seller?.bankName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-zinc-500">Számlaszám</p>
                                            <p className="text-accent font-mono text-lg">{event.seller?.bankAccountNumber}</p>
                                        </div>
                                        <div className="bg-zinc-800/50 p-3 rounded-lg mt-4">
                                            <p className="text-xs text-zinc-500 mb-1">Közlemény / Reference:</p>
                                            <p className="text-white font-mono">"Nevezés - [Név] - [Táv]"</p>
                                        </div>
                                    </div>
                                </div>

                                {(event.sellerEuro || event.seller?.ibanEuro) && (
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-bold text-zinc-300 border-b border-zinc-700 pb-2">
                                            🇪🇺 International Transfer (EUR)
                                        </h4>
                                        <div className="space-y-2 text-zinc-400">
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-zinc-500">Beneficiary Name</p>
                                                <p className="text-white font-medium">
                                                    {event.sellerEuro?.nameEuro || event.sellerEuro?.name || event.seller?.nameEuro || event.seller?.name}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-zinc-500">IBAN</p>
                                                <p className="text-accent font-mono text-lg">
                                                    {event.sellerEuro?.ibanEuro || event.seller?.ibanEuro}
                                                </p>
                                            </div>
                                            {(event.sellerEuro?.bankName || (event.sellerEuro && !event.sellerEuro.bankName)) ? (
                                                <div>
                                                    <p className="text-xs uppercase tracking-wider text-zinc-500">Bank</p>
                                                    <p className="text-zinc-300">{event.sellerEuro?.bankName || event.seller?.bankName}</p>
                                                </div>
                                            ) : null}

                                            {(event.sellerEuro?.bankAccountNumberEuro || event.seller?.bankAccountNumberEuro) && (
                                                <div>
                                                    <p className="text-xs uppercase tracking-wider text-zinc-500">SWIFT / Account #</p>
                                                    <p className="text-zinc-300 font-mono">
                                                        {event.sellerEuro?.bankAccountNumberEuro || event.seller?.bankAccountNumberEuro}
                                                    </p>
                                                </div>
                                            )}
                                            <div className="bg-zinc-800/50 p-3 rounded-lg mt-4">
                                                <p className="text-xs text-zinc-500 mb-1">Reference:</p>
                                                <p className="text-white font-mono">"Registration - [Name] - [Distance]"</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                } 
                */}
            </div >
        </>
    );
}
