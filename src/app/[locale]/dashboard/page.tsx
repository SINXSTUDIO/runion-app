import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getUserRegistrations } from '@/actions/dashboard';
import RegistrationList from '@/components/dashboard/RegistrationList';
import LogoutButton from '@/components/dashboard/LogoutButton';
import { User, Settings } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await auth();
    const t = await getTranslations('Dashboard.Home');

    if (!session?.user) {
        redirect(`/${locale}/login`);
    }

    const registrations = await getUserRegistrations();

    return (
        <div className="min-h-screen bg-black text-white pt-28 pb-20">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 border-b border-zinc-800 pb-8">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black font-heading uppercase mb-2">
                            {t.rich('hello', {
                                name: (session.user as any).firstName || session.user.name?.split(' ')[0],
                                accent: (chunks) => <span className="text-accent">{chunks}</span>
                            })}
                        </h1>
                        <p className="text-zinc-500">{t('subtitle')}</p>
                    </div>
                    <div className="flex gap-4">
                        {session.user.role === 'ADMIN' && (
                            <a href={`/${locale}/secretroom75`} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
                                <Settings className="w-4 h-4" />
                                {t('admin')}
                            </a>
                        )}
                        <LogoutButton />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Registrations */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold font-heading uppercase flex items-center gap-3">
                            <User className="text-accent" />
                            {t('myRegistrations')}
                        </h2>
                        <RegistrationList registrations={registrations || []} />
                    </div>

                    {/* Sidebar: Stats or Profile */}
                    <div className="space-y-6">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                            <h3 className="text-xl font-bold font-heading uppercase mb-4 text-white">{t('stats')}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/50 p-4 rounded-xl border border-zinc-800 text-center">
                                    <div className="text-3xl font-black text-white mb-1">{registrations?.length || 0}</div>
                                    <div className="text-xs text-zinc-500 uppercase font-bold">{t('races')}</div>
                                </div>
                                <div className="bg-black/50 p-4 rounded-xl border border-zinc-800 text-center">
                                    <div className="text-3xl font-black text-accent mb-1">0</div>
                                    <div className="text-xs text-zinc-500 uppercase font-bold">{t('kmRun')}</div>
                                    {/* This would need calculation based on Distance names or stored distance value */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
