import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getUserRegistrations } from '@/actions/user-dashboard';
import RegistrationList from '@/components/dashboard/RegistrationList';
import { Trophy } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function RegistrationsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('Dashboard.Registrations');
    const session = await auth();

    if (!session?.user) {
        redirect(`/${locale}/login`);
    }

    const registrations = await getUserRegistrations(session.user.id);

    // Calculate financial stats
    const paidAmount = registrations
        .filter((r: any) => r.paymentStatus === 'PAID')
        .reduce((sum: number, r: any) => sum + Number(r.finalPrice || r.distance?.price || 0), 0);

    const unpaidAmount = registrations
        .filter((r: any) => r.paymentStatus !== 'PAID' && r.paymentStatus !== 'REFUNDED')
        .reduce((sum: number, r: any) => sum + Number(r.finalPrice || r.distance?.price || 0), 0);

    return (
        <div className="min-h-screen bg-black text-white pt-20 pb-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 border-b border-zinc-800 pb-8">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black font-heading uppercase mb-2 flex items-center gap-3">
                            <Trophy className="w-8 h-8 md:w-12 md:h-12 text-accent" />
                            {t('title')}
                        </h1>
                        <p className="text-zinc-500">
                            {t('total')} <span className="text-white font-bold">{registrations.length}</span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Registrations List */}
                    <div className="lg:col-span-2 space-y-6">
                        <RegistrationList registrations={registrations || []} />
                    </div>

                    {/* Sidebar: Financial Stats */}
                    <div className="space-y-6">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                            <h3 className="text-xl font-bold font-heading uppercase mb-4 text-white">{t('balanceTitle')}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/50 p-4 rounded-xl border border-zinc-800 text-center">
                                    <div className="text-lg md:text-xl font-black text-green-400 mb-1">
                                        {paidAmount.toLocaleString('hu-HU')} Ft
                                    </div>
                                    <div className="text-xs text-zinc-500 uppercase font-bold">{t('paid')}</div>
                                </div>
                                <div className="bg-black/50 p-4 rounded-xl border border-zinc-800 text-center">
                                    <div className="text-lg md:text-xl font-black text-red-400 mb-1">
                                        {unpaidAmount.toLocaleString('hu-HU')} Ft
                                    </div>
                                    <div className="text-xs text-zinc-500 uppercase font-bold">{t('unpaid')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
