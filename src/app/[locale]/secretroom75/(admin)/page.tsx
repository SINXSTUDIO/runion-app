import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { Download, Users, Calendar, TrendingUp, Plus, Settings, FileText, Logs, Database } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Badge } from '@/components/ui/Badge';
import { getSettings } from '@/actions/settings';
import MaintenanceToggle from '@/components/secretroom75/MaintenanceToggle';
import QuickImportButton from '@/components/secretroom75/QuickImportButton';
import { getTranslations, getLocale } from 'next-intl/server';

export default async function AdminPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Admin.Dashboard' });
    const settings = await getSettings();

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
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tighter mb-2">SECRET ROOM <span className="text-accent">75</span></h1>
                    <p className="text-zinc-500 uppercase tracking-widest text-xs font-bold font-mono">{t('subtitle')}</p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    <MaintenanceToggle initialState={settings?.maintenanceMode ?? false} />
                    <Link href="/secretroom75/logs">
                        <Button variant="outline" className="border-white/5 bg-zinc-900/30 hover:bg-zinc-800/50 hover:text-white backdrop-blur-sm gap-2 rounded-xl h-10 px-4 transition-all">
                            <Logs className="w-4 h-4 text-zinc-400" />
                            {t('systemLogs')}
                        </Button>
                    </Link>
                    <Link href="/secretroom75/settings/backup">
                        <Button variant="outline" className="border-white/5 bg-zinc-900/30 hover:bg-zinc-800/50 hover:text-white backdrop-blur-sm gap-2 rounded-xl h-10 px-4 transition-all">
                            <Database className="w-4 h-4 text-zinc-400" />
                            Biztonsági Mentés
                        </Button>
                    </Link>
                    <Link href="/secretroom75/events/new">
                        <Button className="bg-accent hover:bg-accent-hover text-black font-black uppercase italic tracking-tighter gap-2 rounded-xl h-10 px-5 shadow-[0_0_20px_rgba(0,242,254,0.35)] transition-all">
                            <Plus className="w-4 h-4" />
                            {t('newEvent')}
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AdminStatCard
                    icon={<Users className="text-accent w-5 h-5" />}
                    label={t('totalRunners')}
                    value={totalStats.runners.toString()}
                    trend={t('runnersTrend')}
                />
                <AdminStatCard
                    icon={<Calendar className="text-blue-400 w-5 h-5" />}
                    label={t('activeEvents')}
                    value={totalStats.activeEvents.toString()}
                />
                <AdminStatCard
                    icon={<TrendingUp className="text-emerald-400 w-5 h-5" />}
                    label={t('potentialRevenue')}
                    value={`${totalStats.totalRevenue.toLocaleString(locale === 'hu' ? 'hu-HU' : locale === 'de' ? 'de-DE' : 'en-US')} ${locale === 'hu' ? 'Ft' : 'HUF'}`}
                    trend={t('revenueTrend')}
                />
            </div>

            {/* Events Table Section */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-zinc-950/20">
                    <h2 className="text-xl md:text-2xl font-black italic uppercase flex items-center gap-3 text-white">
                        <FileText className="text-zinc-500 w-6 h-6" />
                        {t('manageEvents')}
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-950/60 text-zinc-400 uppercase text-xs font-black tracking-widest border-b border-white/5">
                            <tr>
                                <th className="px-6 md:px-8 py-5">{t('eventName')}</th>
                                <th className="px-6 md:px-8 py-5">{t('status')}</th>
                                <th className="px-6 md:px-8 py-5">{t('date')}</th>
                                <th className="px-6 md:px-8 py-5 text-center">{t('runners')}</th>
                                <th className="px-6 md:px-8 py-5 text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {events.map(event => (
                                <tr key={event.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 md:px-8 py-6">
                                        <div className="font-bold text-base md:text-lg group-hover:text-accent transition-colors">{event.title}</div>
                                        <div className="text-zinc-500 text-xs font-mono mt-0.5">{event.slug}</div>
                                    </td>
                                    <td className="px-6 md:px-8 py-6">
                                        <Badge variant={event.status === 'PUBLISHED' ? 'accent' : event.status === 'DRAFT' ? 'outline' : 'secondary'}>
                                            {event.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 md:px-8 py-6 text-zinc-400 font-mono italic text-sm">
                                        {event.eventDate.toLocaleDateString(locale === 'hu' ? 'hu-HU' : locale === 'de' ? 'de-DE' : 'en-US')}
                                    </td>
                                    <td className="px-6 md:px-8 py-6 text-center">
                                        <span className="bg-zinc-950/80 text-white font-mono px-3.5 py-1.5 rounded-full text-xs border border-white/5 shadow-inner">
                                            {event.totalRegistrations}
                                        </span>
                                    </td>
                                    <td className="px-6 md:px-8 py-6 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <a href={`/api/secretroom75/export?slug=${event.slug}`} title={t('downloadCsv')}>
                                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-zinc-800 hover:text-white transition-all">
                                                    <Download className="w-4.5 h-4.5 text-zinc-400" />
                                                </Button>
                                            </a>
                                            <QuickImportButton />
                                            <a href={`/${locale}/secretroom75/events/${event.id}/form`} title={t('registrationForm')}>
                                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-zinc-800 hover:text-white transition-all">
                                                    <FileText className="w-4.5 h-4.5 text-accent" />
                                                </Button>
                                            </a>
                                            <Link href={`/secretroom75/events/${event.id}/edit`} title={t('settings')}>
                                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-zinc-800 hover:text-white transition-all">
                                                    <Settings className="w-4.5 h-4.5 text-zinc-400" />
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
    );
}

function AdminStatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend?: string }) {
    return (
        <div className="bg-zinc-900/40 border border-white/5 p-6 md:p-8 rounded-[2rem] relative overflow-hidden group hover:border-accent/35 transition-all duration-300 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_4px_25px_rgba(0,242,254,0.1)]">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-zinc-800/10 rounded-full group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-zinc-950/80 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <span className="text-zinc-500 uppercase text-xs font-black tracking-widest font-mono">{label}</span>
            </div>
            <div className="text-3xl md:text-4xl font-black text-white font-heading tracking-tighter mb-2">{value}</div>
            {trend && <div className="text-zinc-500 text-xs italic font-medium">{trend}</div>}
        </div>
    );
}
