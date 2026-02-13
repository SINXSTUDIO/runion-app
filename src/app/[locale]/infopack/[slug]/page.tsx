import { getEventBySlug } from '@/actions/events';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import {
    MapPin, Calendar, Clock, Info, Banknote, List, Users,
    Car, Camera, Mic, Gift, Heart, Coffee, Utensils,
    Facebook, Map as MapIcon, ChevronRight, Timer, ArrowRight,
    Rocket, ShoppingBag, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { Card } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

export default async function InfopackPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { slug, locale } = await params;
    const response = await getEventBySlug(slug) as any;
    const event = response.success ? response.data : null;

    if (!event) {
        notFound();
    }

    const t = await getTranslations({ locale, namespace: 'HomePage.featured' });

    // Icon mapper for dynamic content
    const IconComponent = ({ name, className }: { name: string, className?: string }) => {
        const icons: any = {
            MapPin, Calendar, Clock, Info, Banknote, List, Users,
            Car, Camera, Mic, Gift, Heart, Coffee, Utensils,
            Facebook, MapIcon, ChevronRight, Timer, ArrowRight,
            Rocket, ShoppingBag, MessageSquare
        };
        const LucideIcon = icons[name] || Info;
        return <LucideIcon className={className} />;
    };

    // Parse infopack data safely
    let infopack: any = {};
    try {
        const raw = event.infopack;
        if (raw) {
            infopack = typeof raw === 'string' ? JSON.parse(raw) : raw;
            // Handle secondary stringification if necessary
            if (typeof infopack === 'string') infopack = JSON.parse(infopack);
        }
    } catch (e) {
        console.error('Infopack parse error:', e);
    }

    return (
        <div className="min-h-screen bg-black text-white pb-20 selection:bg-accent/30">
            {/* Hero Section */}
            <div className="relative w-full h-[60vh] min-h-[500px] overflow-hidden">
                <div className="absolute inset-0 animate-ken-burns">
                    <Image
                        src={event.coverImage || '/images/infopack-hero.webp'}
                        alt={event.title}
                        fill
                        className="object-cover opacity-60 blur-[1px]"
                        priority
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-black/20" />

                <div className="absolute bottom-0 inset-x-0 pb-16">
                    <div className="container mx-auto px-4">
                        <Badge variant="outline" className="text-accent border-accent/50 bg-accent/10 mb-6 backdrop-blur-md px-4 py-1.5 text-sm uppercase tracking-widest font-bold animate-slide-in-top">
                            Infópakk & Részletek
                        </Badge>
                        <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter mb-4 text-white leading-tight animate-slide-in-left">
                            {event.title}
                        </h1>
                        <div className="flex flex-wrap text-zinc-300 gap-x-8 gap-y-3 font-bold text-lg italic uppercase animate-fade-in [animation-delay:200ms]">
                            <div className="flex items-center gap-2 group cursor-default">
                                <Calendar className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                                {new Date(event.eventDate).toLocaleDateString(locale === 'hu' ? 'hu-HU' : 'en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    weekday: 'long'
                                })}
                            </div>
                            <div className="flex items-center gap-2 group cursor-default">
                                <MapPin className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                                {event.location}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12 animate-fade-in [animation-delay:400ms]">

                        {/* Athlete Greeting / Important Message */}
                        {infopack.importantMessage && (
                            <section className="bg-zinc-900/40 p-10 rounded-[40px] border border-zinc-800 relative group overflow-hidden hover:border-accent/40 transition-colors">
                                <div className="absolute top-0 right-0 p-8 text-accent opacity-5 group-hover:opacity-10 transition-opacity">
                                    <MessageSquare className="w-32 h-32" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-black italic uppercase text-zinc-400 mb-6 flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-accent rounded-full" />
                                        Üzenet a Szervezőktől
                                    </h3>
                                    <p className="text-xl text-white font-bold leading-[1.8] whitespace-pre-line italic">
                                        "{infopack.importantMessage}"
                                    </p>
                                </div>
                            </section>
                        )}

                        {/* Highlights / Alert */}
                        {infopack.importantInfo && (
                            <div className="bg-accent/10 border border-accent/30 rounded-3xl p-8 backdrop-blur-md">
                                <h2 className="text-2xl font-black italic uppercase text-accent mb-4 flex items-center gap-3">
                                    <Info className="w-7 h-7" />
                                    Fontos Információ!
                                </h2>
                                <p className="text-xl text-white font-bold leading-relaxed whitespace-pre-line">
                                    {infopack.importantInfo}
                                </p>
                            </div>
                        )}

                        {/* On-site Registration Prices */}
                        {infopack.onSitePrices?.length > 0 && (
                            <section className="space-y-6">
                                <h3 className="text-2xl font-black italic uppercase flex items-center gap-3">
                                    <div className="w-2 h-8 bg-accent rounded-full" />
                                    Helyszíni nevezés és árak
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {infopack.onSitePrices.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-accent/30 transition-all">
                                            <span className="font-bold text-zinc-200">{item.name}</span>
                                            <span className="text-accent font-black italic">{item.price}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-zinc-500 italic">* Chip letéti díj: 2000 Ft.- (Kérjük pontos összeggel készüljetek!)</p>
                            </section>
                        )}

                        {/* Schedule / Rajtok */}
                        {infopack.schedule?.length > 0 && (
                            <section className="space-y-6">
                                <h3 className="text-2xl font-black italic uppercase flex items-center gap-3">
                                    <div className="w-2 h-8 bg-accent rounded-full" />
                                    Rajtidőpontok
                                </h3>
                                <div className="space-y-4">
                                    {infopack.schedule.map((item: any, idx: number) => (
                                        <div key={idx} className="flex gap-6 p-6 bg-zinc-900/30 border border-zinc-800 rounded-3xl group hover:bg-zinc-900/50 transition-all">
                                            <div className="flex flex-col items-center justify-center min-w-[80px] h-[80px] bg-accent/10 border border-accent/20 rounded-2xl text-accent">
                                                <div className="flex flex-col items-center">
                                                    <Clock className="w-5 h-5 mb-1" />
                                                    <span className="text-xl font-black italic">{item.time}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black italic uppercase text-white group-hover:text-accent transition-colors">{item.title}</h4>
                                                <p className="text-zinc-400">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Distances Detail */}
                        {infopack.distances?.length > 0 && (
                            <section className="space-y-6">
                                <h3 className="text-2xl font-black italic uppercase flex items-center gap-3">
                                    <div className="w-2 h-8 bg-accent rounded-full" />
                                    Pálya és Távok
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {infopack.distances.map((item: any, idx: number) => (
                                        <div key={idx} className="p-5 bg-black/40 border border-zinc-800 rounded-2xl">
                                            <h5 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">{item.name}</h5>
                                            <p className="text-xl font-black italic text-white">{item.detail}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-amber-200/80 text-sm italic">
                                    ☝️ Figyelem! A pályán végig jobbratartás van. Kutyával és babakocsival futni balesetveszélyes, kérjük használják a párhuzamos gyalogutat!
                                </div>
                            </section>
                        )}

                        {/* What's included */}
                        {infopack.included?.length > 0 && (
                            <section className="space-y-6">
                                <h3 className="text-2xl font-black italic uppercase flex items-center gap-3">
                                    <div className="w-2 h-8 bg-accent rounded-full" />
                                    Mit tartalmaz a nevezési díj?
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {infopack.included.map((item: any, idx: number) => (
                                        <div key={idx} className="flex flex-col items-center text-center p-4 bg-zinc-900/20 border border-zinc-800 rounded-2xl">
                                            <div className="text-accent mb-2">
                                                <IconComponent name={item.icon} />
                                            </div>
                                            <span className="text-xs font-bold uppercase">{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Surprise Run Section */}
                        {infopack.surpriseRun?.title && (
                            <section className="bg-gradient-to-br from-red-950/20 to-zinc-950 border border-red-500/30 rounded-[40px] p-8 md:p-12 relative overflow-hidden group">
                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-500/10 blur-[100px] rounded-full group-hover:bg-red-500/20 transition-all duration-700"></div>
                                <div className="relative z-10">
                                    <h3 className="text-3xl font-black italic uppercase text-red-500 mb-6 flex items-center gap-4">
                                        <Heart className="w-8 h-8" />
                                        {infopack.surpriseRun.title}
                                    </h3>
                                    <div className="space-y-4 text-zinc-300 text-lg leading-relaxed whitespace-pre-line">
                                        <p>{infopack.surpriseRun.description}</p>
                                        {infopack.surpriseRun.prize && (
                                            <div className="pt-4">
                                                <p className="text-red-400 font-bold uppercase italic">🎁 {infopack.surpriseRun.prize}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Race Category Details & Start Lists */}
                        {infopack.raceCategories?.length > 0 && (
                            <section className="space-y-8">
                                <h3 className="text-3xl font-black italic uppercase flex items-center gap-3">
                                    <div className="w-2.5 h-10 bg-accent rounded-full" />
                                    Versenyszámok és Rajtlisták
                                </h3>
                                <div className="space-y-6">
                                    {infopack.raceCategories.map((cat: any, idx: number) => (
                                        <Card key={idx} className="bg-zinc-900/30 border-zinc-800 rounded-[32px] overflow-hidden group/card hover:border-accent/30 transition-all duration-500">
                                            <div className="p-8 space-y-6">
                                                <div className="flex items-start justify-between gap-4">
                                                    <h4 className="text-2xl font-black italic uppercase text-accent leading-tight group-hover/card:translate-x-1 transition-transform">
                                                        {cat.title}
                                                    </h4>
                                                    <Rocket className="w-8 h-8 text-accent/20 shrink-0" />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-3">
                                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Részletek & Tudnivalók</h5>
                                                        <p className="text-zinc-300 leading-relaxed whitespace-pre-line text-sm">
                                                            {cat.description}
                                                        </p>
                                                    </div>

                                                    {cat.startList && (
                                                        <div className="space-y-3">
                                                            <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Rajtlista</h5>
                                                            <div className="bg-black/50 p-4 rounded-xl border border-zinc-800/50 max-h-[200px] overflow-y-auto scrollbar-hide">
                                                                <pre className="text-[11px] text-zinc-500 font-mono leading-tight whitespace-pre-wrap">
                                                                    {cat.startList}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        )}

                    </div>

                    {/* Sidebar / Links & Widgets */}
                    <div className="space-y-8 animate-fade-in [animation-delay:600ms]">
                        <div className="sticky top-24 space-y-8">
                            {/* Map & GPS Tracks */}
                            {infopack.gpsTracks?.length > 0 && (
                                <Card className="p-6 bg-zinc-900/80 backdrop-blur-xl border-zinc-800 rounded-3xl group/sidebar hover:border-accent/20 transition-colors">
                                    <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-3 text-white">
                                        <MapIcon className="w-6 h-6 text-accent group-hover/sidebar:rotate-12 transition-transform" />
                                        Pályaadok & GPS
                                    </h3>
                                    <div className="space-y-3">
                                        {infopack.gpsTracks.map((item: any, idx: number) => (
                                            <a key={idx} href={item.url} target="_blank" className="block p-4 bg-black rounded-2xl border border-zinc-800 hover:border-accent/50 transition-all">
                                                <span className="font-bold flex items-center justify-between uppercase italic">
                                                    {item.name} <ChevronRight className="w-4 h-4" />
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* Practical Info Card */}
                            {infopack.practicalInfo?.length > 0 && (
                                <Card className="p-6 bg-zinc-900 border-zinc-800 rounded-3xl">
                                    <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-3 text-white">
                                        <Info className="w-6 h-6 text-accent" />
                                        Tudnivalók
                                    </h3>
                                    <div className="space-y-6">
                                        {infopack.practicalInfo.map((item: any, idx: number) => (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex items-center gap-2 text-accent text-sm font-bold uppercase italic">
                                                    <IconComponent name={item.icon} className="w-4 h-4" />
                                                    {item.category}
                                                </div>
                                                <p className="text-sm text-zinc-400">{item.detail}</p>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* Exhibitors Widget */}
                            {infopack.exhibitors && (
                                <Card className="p-8 bg-gradient-to-br from-zinc-900 to-black border-zinc-800 rounded-[32px] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-6 text-accent opacity-5 group-hover:opacity-10 transition-opacity">
                                        <ShoppingBag className="w-20 h-20" />
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-3 text-white">
                                            <ShoppingBag className="w-6 h-6 text-accent" />
                                            Kiállítóink
                                        </h3>
                                        <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line">
                                            {infopack.exhibitors}
                                        </p>
                                    </div>
                                </Card>
                            )}

                            {/* Social & Community */}
                            {infopack.socialLinks?.length > 0 && (
                                <div className="space-y-4">
                                    {infopack.socialLinks.map((item: any, idx: number) => (
                                        <a
                                            key={idx}
                                            href={item.url}
                                            target="_blank"
                                            className={`block p-6 rounded-3xl text-center font-black italic uppercase transform hover:scale-105 transition-all text-sm border ${idx === 0 ? 'bg-blue-600 hover:bg-blue-700 border-blue-500' : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700'}`}
                                        >
                                            <div className="flex items-center justify-center gap-3">
                                                <Facebook className="w-6 h-6" /> {item.name}
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            )}

                            {/* Starting List Widget Placeholder */}
                            <Card className="p-6 bg-zinc-950 border border-accent/20 rounded-3xl hover:border-accent/40 transition-colors">
                                <h3 className="text-xl font-black italic uppercase mb-4 flex items-center gap-3 text-accent">
                                    <List className="w-6 h-6" /> Rajtlista Hírek
                                </h3>
                                <p className="text-sm text-zinc-400 mb-6 italic">A legfrissebb előnevezési listák elérhetőek!</p>
                                <Link href={`/races/${slug}`} className="block">
                                    <Button className="w-full bg-accent/10 border border-accent/50 text-accent font-bold hover:bg-accent hover:text-black transition-all">
                                        Megtekintés
                                    </Button>
                                </Link>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer/Contact in Infopack */}
            <div className="mt-20 border-t border-zinc-900 pt-10 text-center container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-10">
                    {infopack.footerSpeakers && (
                        <div className="flex flex-col items-center">
                            <Mic className="text-accent mb-2" />
                            <span className="text-xs font-bold uppercase text-zinc-500 mb-1">Szpíkerek</span>
                            <span className="font-bold">{infopack.footerSpeakers}</span>
                        </div>
                    )}
                    {infopack.footerPhotographers && (
                        <div className="flex flex-col items-center">
                            <Camera className="text-accent mb-2" />
                            <span className="text-xs font-bold uppercase text-zinc-500 mb-1">Fotósaink</span>
                            <span className="font-bold">{infopack.footerPhotographers}</span>
                        </div>
                    )}
                </div>
                {infopack.footerOrganizers && (
                    <div className="text-zinc-500 text-sm italic">
                        ®️ Rendezők: {infopack.footerOrganizers}
                    </div>
                )}
            </div>
        </div>
    );
}
