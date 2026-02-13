'use client';

import { useState } from 'react';
import { Search, MapPin, Users, Calendar, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';

interface EventGridProps {
    events: any[];
}

export default function EventGrid({ events }: EventGridProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return 'emerald';
            case 'DRAFT': return 'amber';
            case 'ARCHIVED': return 'red';
            default: return 'zinc';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Search Bar */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 max-w-md">
                <Search className="w-5 h-5 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Keresés események között..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none outline-none text-white placeholder:text-zinc-500 flex-1"
                />
            </div>

            {/* List Layout (Horizontal Cards) */}
            <div className="space-y-4">
                {filteredEvents.map((event) => {
                    const totalRegistrations = event.distances.reduce((sum: number, dist: any) => sum + dist._count.registrations, 0);
                    const color = getStatusColor(event.status);

                    return (
                        <div
                            key={event.id}
                            className={`
                                relative overflow-hidden
                                bg-gradient-to-r from-${color}-500/10 to-${color}-600/5
                                border border-${color}-500/20
                                rounded-xl p-6
                                backdrop-blur-sm
                                hover:border-${color}-500/40
                                transition-all duration-300
                                group
                            `}
                        >
                            {/* Decorative Side Highlight */}
                            <div className={`absolute top-0 left-0 w-1 h-full bg-${color}-500/50 group-hover:bg-${color}-400 transition-colors`} />

                            <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`
                                            px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                            bg-${color}-500/20 text-${color}-300 border border-${color}-500/20
                                        `}>
                                            {event.status}
                                        </span>
                                        <span className="text-zinc-500 text-xs font-mono flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(event.eventDate).toLocaleDateString('hu-HU')}
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                                        {event.title}
                                    </h2>

                                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                                        <MapPin className="w-4 h-4 text-zinc-600" />
                                        <span>{event.location}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-6 md:border-l md:border-white/10 md:pl-6 md:h-full">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <div className={`p-2 rounded-full bg-${color}-500/10 text-${color}-400`}>
                                            <Users className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg leading-none text-white">{totalRegistrations}</span>
                                            <span className="text-[10px] uppercase text-zinc-500 font-bold">Nevező</span>
                                        </div>
                                    </div>

                                    <Link href={`/secretroom75/events/${event.id}/registrations`}>
                                        <Button size="sm" className={`
                                            bg-${color}-500/20 hover:bg-${color}-500/30 text-${color}-200
                                            border border-${color}-500/30
                                            rounded-lg h-10 px-6 font-bold
                                        `}>
                                            Megtekintés <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredEvents.length === 0 && (
                    <div className="text-center py-12 text-zinc-500 bg-white/5 rounded-xl border border-white/5">
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>Nincs találat a keresési feltételekre.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
