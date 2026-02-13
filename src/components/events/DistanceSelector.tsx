"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Clock, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function DistanceSelector({ distances, locale, slug }: { distances: any[], locale: string, slug: string }) {
    const [selectedId, setSelectedId] = useState(distances[0]?.id || '');

    const selectedDistance = distances.find(d => d.id === selectedId) || distances[0];

    if (!selectedDistance) return null;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat(locale === 'hu' ? 'hu-HU' : 'en-US', {
            style: 'currency',
            currency: 'HUF',
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 font-heading flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent" />
                    Választott Táv Részletei
                </h3>

                {/* List View Selection (More visible than dropdown) */}
                <div className="space-y-2 mb-6">
                    {distances.map(d => (
                        <div
                            key={d.id}
                            onClick={() => setSelectedId(d.id)}
                            className={`
                                cursor-pointer group flex items-center justify-between p-4 rounded-xl border-2 transition-all
                                ${selectedId === d.id
                                    ? 'border-accent bg-zinc-800 shadow-[0_0_15px_rgba(0,242,254,0.1)]'
                                    : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedId === d.id ? 'border-accent' : 'border-zinc-600'}`}>
                                    {selectedId === d.id && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                                </div>
                                <div>
                                    <div className={`font-bold text-lg ${selectedId === d.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                                        {d.name}
                                    </div>
                                </div>
                            </div>
                            <div className={`font-mono font-bold ${selectedId === d.id ? 'text-accent' : 'text-zinc-500'}`}>
                                {formatPrice(Number(d.price))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Selected Detail View */}
                <div className="bg-zinc-950/50 rounded-xl p-6 border border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="mb-4">
                        <div className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-bold">Leírás</div>
                        <p className="text-zinc-400 italic leading-relaxed text-sm">
                            {selectedDistance.description || "A leírás hamarosan feltöltésre kerül."}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-300 mb-6 border-t border-zinc-800 pt-4">
                        <div className="flex items-center gap-2 bg-zinc-900 px-2 py-1 rounded">
                            <Clock className="w-4 h-4 text-accent" />
                            <span className="font-mono font-bold">
                                {new Date(selectedDistance.startTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {selectedDistance.capacityLimit} fő
                        </div>
                    </div>

                    <Link href={`/races/${slug}/register?distanceId=${selectedId}`} className="block">
                        <Button className="w-full py-4 text-lg font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white hover:bg-accent hover:border-accent hover:text-black transition-colors">
                            Nevezés
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
