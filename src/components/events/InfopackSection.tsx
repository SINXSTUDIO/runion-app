import { Info, MapPin, Clock, DollarSign, Gift, Heart, Rocket, ShoppingBag, Mic, Camera, Users, Facebook, AlertTriangle, Map as MapIcon, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface InfopackData {
    importantInfo?: string;
    onSitePrices?: { name: string; price: string }[];
    schedule?: { time: string; title: string; desc: string }[];
    distances?: { name: string; detail: string }[];
    included?: { text: string; icon: string }[];
    surpriseRun?: { title: string; description: string; prize: string };
    raceCategories?: { title: string; description: string; startList: string }[];
    exhibitors?: string;
    practicalInfo?: { category: string; detail: string; icon: string }[];
    gpsTracks?: { name: string; url: string }[];
    socialLinks?: { name: string; url: string }[];
    footerSpeakers?: string;
    footerPhotographers?: string;
    footerOrganizers?: string;
}

interface InfopackSectionProps {
    infopack: InfopackData;
}

export function InfopackSection({ infopack }: InfopackSectionProps) {
    if (!infopack) return null;

    // Helper to get Lucide icon by name
    const getIcon = (name: string) => {
        const icons: any = {
            Timer: Clock,
            Gift: Gift,
            Heart: Heart,
            Coffee: MapPin, // Fallback/Mapping
            Utensils: ShoppingBag, // Fallback
            Camera: Camera,
            ArrowRight: Rocket, // Fallback
            Info: Info,
            Car: MapPin, // Fallback
            Users: Users,
            Banknote: DollarSign
        };
        const IconComponent = icons[name] || Info;
        return <IconComponent className="w-5 h-5 text-accent" />;
    };

    return (
        <div className="space-y-12 mt-16 pt-16 border-t border-zinc-800">
            <h2 className="text-3xl md:text-5xl font-black font-heading uppercase text-center mb-12 text-white">
                <span className="text-accent">#</span>verseny<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-500">infók</span>
            </h2>

            {/* Important Alert */}
            {infopack.importantInfo && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-3xl p-6 md:p-8 flex gap-6 items-start">
                    <AlertTriangle className="w-10 h-10 text-red-500 shrink-0 animate-pulse" />
                    <div className="space-y-2">
                        <h3 className="text-xl font-black uppercase text-red-500">Fontos Információ</h3>
                        <p className="text-lg text-white font-medium whitespace-pre-line">{infopack.importantInfo}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Schedule */}
                {infopack.schedule && infopack.schedule.length > 0 && (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8">
                        <h3 className="text-2xl font-black uppercase text-white mb-6 flex items-center gap-3">
                            <Clock className="w-6 h-6 text-accent" /> Menetrend
                        </h3>
                        <div className="space-y-6">
                            {infopack.schedule.map((item, idx) => (
                                <div key={idx} className="flex gap-4 relative group">
                                    <div className="w-16 pt-1 text-accent font-black text-xl text-right shrink-0">{item.time}</div>
                                    <div className="w-px bg-zinc-800 relative">
                                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-900 border-2 border-accent rounded-full" />
                                    </div>
                                    <div className="pb-4">
                                        <h4 className="text-lg font-bold text-white uppercase">{item.title}</h4>
                                        <p className="text-zinc-400 text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* On-Site Prices & Distances */}
                <div className="space-y-8">
                    {infopack.onSitePrices && infopack.onSitePrices.length > 0 && (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8">
                            <h3 className="text-2xl font-black uppercase text-white mb-6 flex items-center gap-3">
                                <DollarSign className="w-6 h-6 text-accent" /> Helyszíni Nevezés
                            </h3>
                            <div className="space-y-3">
                                {infopack.onSitePrices.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-zinc-900">
                                        <span className="font-bold text-zinc-300">{item.name}</span>
                                        <span className="font-black text-accent text-lg">{item.price}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {infopack.distances && infopack.distances.length > 0 && (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8">
                            <h3 className="text-2xl font-black uppercase text-white mb-6 flex items-center gap-3">
                                <MapIcon className="w-6 h-6 text-accent" /> Pálya Infók
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {infopack.distances.map((item, idx) => (
                                    <div key={idx} className="p-4 bg-black/40 rounded-xl border border-zinc-900">
                                        <div className="font-black text-white uppercase mb-1">{item.name}</div>
                                        <div className="text-zinc-400 text-sm">{item.detail}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Included Section */}
            {infopack.included && infopack.included.length > 0 && (
                <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-3xl p-8 text-center">
                    <h3 className="text-2xl font-black uppercase text-white mb-8 flex justify-center items-center gap-3">
                        <Gift className="w-6 h-6 text-accent" /> Mit tartalmaz a nevezés?
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {infopack.included.map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-white/5 transition-colors">
                                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                                    {getIcon(item.icon)}
                                </div>
                                <span className="font-bold text-zinc-300">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Practical Info & Exhibitors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {infopack.practicalInfo && infopack.practicalInfo.length > 0 && (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8">
                            <h3 className="text-2xl font-black uppercase text-white mb-6 flex items-center gap-3">
                                <Info className="w-6 h-6 text-accent" /> Praktikus Tudnivalók
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {infopack.practicalInfo.map((item, idx) => (
                                    <div key={idx} className="p-4 bg-black/40 rounded-xl border border-zinc-900">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getIcon(item.icon)}
                                            <span className="text-xs font-bold text-accent uppercase tracking-widest">{item.category}</span>
                                        </div>
                                        <p className="text-white font-medium">{item.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Race Categories Detailed */}
                    {infopack.raceCategories && infopack.raceCategories.length > 0 && (
                        <div className="space-y-6">
                            {infopack.raceCategories.map((cat, idx) => (
                                <div key={idx} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8">
                                    <h3 className="text-xl md:text-2xl font-black uppercase text-white mb-4">
                                        {cat.title}
                                    </h3>
                                    <p className="text-zinc-300 mb-6 leading-relaxed whitespace-pre-line">
                                        {cat.description}
                                    </p>
                                    {cat.startList && (
                                        <div className="bg-black/60 rounded-xl p-4 border border-zinc-800">
                                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Rajtlista / Start List</h4>
                                            <pre className="font-mono text-sm text-accent whitespace-pre-wrap">{cat.startList}</pre>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    {/* GPS Tracks */}
                    {infopack.gpsTracks && infopack.gpsTracks.length > 0 && (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
                            <h3 className="text-xl font-black uppercase text-white mb-4 flex items-center gap-2">
                                <MapIcon className="w-5 h-5 text-accent" /> GPS Útvonalak
                            </h3>
                            <div className="space-y-3">
                                {infopack.gpsTracks.map((item, idx) => (
                                    <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" className="block">
                                        <Button variant="outline" className="w-full justify-between group border-zinc-700 hover:border-accent hover:bg-accent/10 hover:text-white">
                                            {item.name}
                                            <LinkIcon className="w-4 h-4 text-zinc-500 group-hover:text-accent" />
                                        </Button>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Social Links */}
                    {infopack.socialLinks && infopack.socialLinks.length > 0 && (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
                            <h3 className="text-xl font-black uppercase text-white mb-4 flex items-center gap-2">
                                <Facebook className="w-5 h-5 text-accent" /> Közösség
                            </h3>
                            <div className="space-y-3">
                                {infopack.socialLinks.map((item, idx) => (
                                    <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" className="block">
                                        <Button className="w-full bg-[#1877F2] hover:bg-[#1864D1] text-white font-bold">
                                            {item.name}
                                        </Button>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Exhibitors */}
                    {infopack.exhibitors && (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
                            <h3 className="text-xl font-black uppercase text-white mb-4 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-accent" /> Kiállítók
                            </h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                {infopack.exhibitors}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Credits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-zinc-800 text-center md:text-left">
                {infopack.footerSpeakers && (
                    <div>
                        <div className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-1">Szpíkerek</div>
                        <div className="text-white font-bold">{infopack.footerSpeakers}</div>
                    </div>
                )}
                {infopack.footerPhotographers && (
                    <div>
                        <div className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-1">Fotósok</div>
                        <div className="text-white font-bold">{infopack.footerPhotographers}</div>
                    </div>
                )}
                {infopack.footerOrganizers && (
                    <div>
                        <div className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-1">Rendezők</div>
                        <div className="text-white font-bold">{infopack.footerOrganizers}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
