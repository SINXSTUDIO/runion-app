
import { getTranslations } from 'next-intl/server';
import TransferForm from '@/components/registration/TransferForm'; // We'll create this component
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/auth';

import { getSettings } from '@/actions/settings';
import prisma from '@/lib/prisma';

export default async function TransferPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Transfer' });

    // Fetch Global Settings
    const settings = await getSettings() as any;
    const cancellationEnabled = settings?.cancellationEnabled ?? false;

    // Default values if not set in DB
    const infoText = locale === 'hu' ? (settings?.transferInfoHu || 'Versenynevezés átírása a nevezést követő 30. napig ingyenes, ezt követően a verseny előtti 15. napig 2000 Ft/alkalom. Verseny előtti két hétben a nevezést nincs módunk átírni! Megértésüket köszönjük!')
        : locale === 'en' ? (settings?.transferInfoEn || 'Transfer of registration is free until the 30th day after registration, afterwards 2000 HUF/occasion until 15 days before the race. We cannot transfer registrations in the two weeks before the race! Thank you for your understanding!')
            : (settings?.transferInfoDe || 'Die Ummeldung ist bis zum 30. Tag nach der Anmeldung kostenlos, danach 2000 HUF/Anlass bis 15 Tage vor dem Rennen. In den zwei Wochen vor dem Rennen können wir keine Anmeldungen mehr übertragen! Vielen Dank für Ihr Verständnis!');

    const beneficiary = settings?.transferBeneficiary || 'KAHU Természet- és Állatvédő Ifjúsági-, és Sportegyesület';
    const bankName = settings?.transferBankName || 'KAHU Egyesület';
    const bankAccountNumber = settings?.transferBankAccountNumber || '11748038-24826190-00000000';
    const note = settings?.transferNote || 'NVZS2024 – ADOMÁNY ÁLLATELEDEL VÁSÁRLÁSÁRA';
    const contactEmail = settings?.transferEmail || 'versenyiroda.runion@gmail.com';

    // Fetch User Data for Prefill
    const session = await auth();
    let userData = null;

    if (session?.user?.id) {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                birthDate: true,
                address: true,
                city: true,
                zipCode: true,
            }
        });

        if (user) {
            userData = {
                name: `${user.lastName || ''} ${user.firstName || ''}`.trim(),
                email: user.email,
                phone: user.phoneNumber,
                birthDate: user.birthDate,
                address: user.address,
                city: user.city,
                zipCode: user.zipCode,
            };
        }
    }

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 animate-in fade-in duration-700">
            <div className="container mx-auto px-4 max-w-5xl py-8 space-y-8">

                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('backToHome')}
                    </Link>
                </div>

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                        {t('title')}
                    </h1>
                    <p className="text-zinc-500 text-lg">{t('subtitle')}</p>
                </div>

                {/* Tájékoztató Box 1 */}
                <div className="border border-zinc-800 rounded-2xl p-6 md:p-8 bg-zinc-900/30 backdrop-blur-sm mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
                    <h2 className="text-xl font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="text-accent">ℹ️</span> {t('infoHeading')}
                    </h2>
                    <div className="space-y-4 text-zinc-300 leading-relaxed text-sm md:text-base font-medium whitespace-pre-line">
                        {infoText}
                    </div>
                    <p className="text-accent font-mono mt-4">{contactEmail}</p>
                </div>

                {/* Tájékoztató Box 2 (Bank) */}
                <div className="border border-emerald-900/30 rounded-2xl p-6 md:p-8 bg-emerald-950/10 backdrop-blur-sm mb-12 text-center">
                    <h3 className="text-emerald-500 font-bold uppercase mb-4 tracking-widest text-sm">{t('dearAthletes')}</h3>
                    <div className="space-y-4 text-zinc-400 text-sm italic">
                        <p>
                            {t('beneficiaryTextPrefix')} <span className="text-emerald-400 font-bold">{beneficiary}</span> {t('beneficiaryTextSuffix')}
                        </p>
                        <div className="border-t border-emerald-900/50 pt-4 mt-4">
                            <p>{t('referenceText')}</p>
                            <span className="text-white font-bold block mt-2 p-2 bg-emerald-900/20 rounded border border-emerald-500/20 inline-block">
                                {note}
                            </span>
                        </div>
                        <div className="text-xs mt-4">
                            <p>{t('thankYou')}</p>
                            <p>runion.eu</p>
                            <div className="mt-4">
                                <p className="font-bold">{beneficiary}</p>
                                <p className="font-mono text-emerald-400">{bankAccountNumber}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* The Form */}
                <TransferForm cancellationEnabled={cancellationEnabled} initialData={userData || undefined} />

            </div>
        </div>
    );
}
