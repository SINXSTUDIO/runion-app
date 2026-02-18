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
    let paidHuf = 0;
    let paidEur = 0;
    let unpaidHuf = 0;
    let unpaidEur = 0;

    registrations.forEach((reg: any) => {
        const distance = reg.distance || {};
        const isCrewPricing = !!(reg.crewSize && distance.crewPricing);

        let basePriceHuf = 0;
        let basePriceEur = 0;

        const finalPrice = reg.finalPrice !== undefined && reg.finalPrice !== null
            ? Number(reg.finalPrice)
            : Number(distance.price || 0);

        if (isCrewPricing) {
            basePriceHuf = 0;
            basePriceEur = finalPrice;
        } else {
            basePriceHuf = finalPrice;
            basePriceEur = Number(distance.priceEur || 0);
        }

        const extras = Array.isArray(reg.extras) ? reg.extras : [];
        const extrasTotalHuf = extras.reduce((sum: number, e: any) => sum + Number(e.price || 0), 0);
        const extrasTotalEur = extras.reduce((sum: number, e: any) => sum + Number(e.priceEur || 0), 0);

        const totalHuf = basePriceHuf + extrasTotalHuf;
        const totalEur = basePriceEur + extrasTotalEur;

        // Determine currency mode for this registration
        // If it's Crew, or (HUF is 0 and EUR > 0), we treat it as EUR-only for summation?
        // Actually, we can just sum up HUF and EUR components separately across all registrations.
        // If a registration is mixed (HUF base + EUR extra?), we add to respective totals.

        // HOWEVER, for "isEurOnly" logic:
        // If a registration is deemed "EUR Only" (e.g. crew), then pure HUF parts shouldn't exist ideally.
        // But the simplistic summation is safest:

        if (reg.paymentStatus === 'PAID') {
            paidHuf += totalHuf;
            paidEur += totalEur;
        } else if (reg.paymentStatus !== 'REFUNDED') {
            unpaidHuf += totalHuf;
            unpaidEur += totalEur;
        }
    });

    const formatMoney = (huf: number, eur: number) => {
        if (huf === 0 && eur === 0) return `0 Ft`;
        if (huf === 0) return `${eur} €`;
        if (eur === 0) return `${huf.toLocaleString('hu-HU')} Ft`;
        return `${huf.toLocaleString('hu-HU')} Ft + ${eur} €`;
    };

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
                                        {formatMoney(paidHuf, paidEur)}
                                    </div>
                                    <div className="text-xs text-zinc-500 uppercase font-bold">{t('paid')}</div>
                                </div>
                                <div className="bg-black/50 p-4 rounded-xl border border-zinc-800 text-center">
                                    <div className="text-lg md:text-xl font-black text-red-400 mb-1">
                                        {formatMoney(unpaidHuf, unpaidEur)}
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
