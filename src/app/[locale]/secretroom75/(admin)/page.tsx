import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { Download, Users, Calendar, TrendingUp, Plus, Settings, FileText, Logs } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Badge } from '@/components/ui/Badge';
import { getSettings } from '@/actions/settings';
import MaintenanceToggle from '@/components/secretroom75/MaintenanceToggle';

export default async function AdminPage() {
    const settings = await getSettings();
    const headersList = await import('next/headers').then(mod => mod.headers());
    // Wait, getSettings handles it. Page doesn't need headers.

    const eventsData = await prisma.event.findMany({
        orderBy: { eventDate: 'desc' },
        include: {
            distances: {
                include: {
                    _count: {
                        select: { registrations: true }
                    }
                }
            }
        }
    });

    const events = eventsData.map(event => ({
        ...event,
        totalRegistrations: event.distances.reduce((acc, dist) => acc + dist._count.registrations, 0),
        totalPotentialRevenue: event.distances.reduce((acc, dist) => acc + (Number(dist.price) * dist._count.registrations), 0)
    }));

    const totalStats = {
        runners: events.reduce((acc, event) => acc + event.totalRegistrations, 0),
        activeEvents: events.filter(e => e.status === 'PUBLISHED').length,
        totalRevenue: events.reduce((acc, event) => acc + event.totalPotentialRevenue, 0)
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-5xl font-black font-heading tracking-tighter mb-2">SECRET ROOM <span className="text-accent">75</span></h1>
                        <p className="text-zinc-500 uppercase tracking-widest text-sm font-bold">Adminisztrációs Vezérlőpult</p>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                        <MaintenanceToggle initialState={settings?.maintenanceMode ?? false} />
                        <Link href="/hu/secretroom75/logs">
                            <Button variant="outline" className="border-zinc-800 hover:bg-zinc-900 gap-2">
                                <Logs className="w-4 h-4" />
                                Rendszer Naplók
                            </Button>
                        </Link>
                        <Link href="/hu/secretroom75/events/new">
                            <Button className="bg-accent hover:bg-accent-hover text-black font-bold gap-2 shadow-[0_0_20px_rgba(0,242,254,0.3)]">
                                <Plus className="w-5 h-5" />
                                Új Verseny
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <AdminStatCard
                        icon={<Users className="text-accent" />}
                        label="Összes Nevező"
                        value={totalStats.runners.toString()}
                        trend="+12% az elmúlt hónapban"
                    />
                    <AdminStatCard
                        icon={<Calendar className="text-blue-500" />}
                        label="Aktív Versenyek"
                        value={totalStats.activeEvents.toString()}
                    />
                    <AdminStatCard
                        icon={<TrendingUp className="text-emerald-500" />}
                        label="Várható Bevétel"
                        value={`${totalStats.totalRevenue.toLocaleString()} Ft`}
                        trend="Fizetett + Függőben lévő"
                    />
                </div>

                {/* Events Table Section */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] overflow-hidden backdrop-blur-sm">
                    <div className="p-8 border-b border-zinc-800 flex justify-between items-center">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <FileText className="text-zinc-500" />
                            Versenyek Kezelése
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-950/50 text-zinc-500 uppercase text-xs font-black tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Esemény Megnevezése</th>
                                    <th className="px-8 py-5">Állapot</th>
                                    <th className="px-8 py-5">Dátum</th>
                                    <th className="px-8 py-5 text-center">Nevezők</th>
                                    <th className="px-8 py-5 text-right">Műveletek</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {events.map(event => (
                                    <tr key={event.id} className="hover:bg-zinc-800/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-lg group-hover:text-accent transition-colors">{event.title}</div>
                                            <div className="text-zinc-500 text-xs font-mono">{event.slug}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Badge variant={event.status === 'PUBLISHED' ? 'accent' : event.status === 'DRAFT' ? 'outline' : 'secondary'}>
                                                {event.status}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6 text-zinc-400 font-mono italic">
                                            {event.eventDate.toLocaleDateString('hu-HU')}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="bg-zinc-800 text-white font-black px-4 py-2 rounded-full text-sm border border-zinc-700">
                                                {event.totalRegistrations}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <a href={`/api/secretroom75/export?slug=${event.slug}`} title="CSV Letöltés">
                                                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full hover:bg-zinc-800">
                                                        <Download className="w-5 h-5 text-zinc-400" />
                                                    </Button>
                                                </a>
                                                <a href={`/hu/secretroom75/events/${event.id}/form`} title="Nevezési Űrlap">
                                                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full hover:bg-zinc-800">
                                                        <FileText className="w-5 h-5 text-accent" />
                                                    </Button>
                                                </a>
                                                <Link href={`/secretroom75/events/${event.id}/edit`} title="Beállítások">
                                                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full hover:bg-zinc-800">
                                                        <Settings className="w-5 h-5 text-zinc-400" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AdminStatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend?: string }) {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2rem] relative overflow-hidden group hover:border-zinc-700 transition-all">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-zinc-800/10 rounded-full group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-zinc-800 rounded-2xl border border-zinc-700 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <span className="text-zinc-500 uppercase text-xs font-black tracking-widest">{label}</span>
            </div>
            <div className="text-4xl font-black text-white font-heading tracking-tighter mb-2">{value}</div>
            {trend && <div className="text-zinc-500 text-xs italic">{trend}</div>}
        </div>
    );
}
