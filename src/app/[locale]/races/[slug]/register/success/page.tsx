import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/routing';
import CopyButton from '@/components/ui/CopyButton';

export default async function RegistrationSuccessPage({ params, searchParams }: { params: Promise<{ slug: string, locale: string }>, searchParams: Promise<{ regId: string }> }) {
    const { slug, locale } = await params;
    const { regId } = await searchParams;
    const t = await getTranslations({ locale, namespace: 'RegistrationSuccess' });

    if (!regId) notFound();

    const registration = await prisma.registration.findUnique({
        where: { id: regId },
        include: {
            distance: {
                include: {
                    event: {
                        select: {
                            title: true,
                            slug: true,
                            seller: {
                                select: {
                                    name: true,
                                    nameEuro: true,
                                    bankName: true,
                                    bankAccountNumber: true,
                                    bankAccountNumberEuro: true,
                                    ibanEuro: true
                                }
                            },
                            sellerEuro: {
                                select: {
                                    name: true,
                                    nameEuro: true,
                                    bankName: true,
                                    bankAccountNumber: true, // Typically not used for EUR but maybe?
                                    bankAccountNumberEuro: true,
                                    ibanEuro: true
                                }
                            }
                        }
                    }
                }
            },
            user: { select: { firstName: true, lastName: true, email: true } }
        }
    });

    if (!registration) notFound();

    // Use event from distance
    const event = registration.distance.event;
    const seller = event.seller;

    if (!seller) {
        return (
            <div className="min-h-screen bg-black text-white pt-28 pb-20">
                <div className="container mx-auto px-4 max-w-2xl text-center">
                    <div className="bg-red-500/10 border border-red-500/50 p-8 rounded-2xl">
                        <h1 className="text-2xl font-bold text-red-500 mb-4">Adathiba</h1>
                        <p className="text-zinc-400">
                            Az eseményhez nem tartozik kedvezményezett (szervező banki adatai).
                            Kérjük, vedd fel a kapcsolatot az adminisztrátorral!
                        </p>
                        <p className="text-xs text-zinc-600 mt-4 font-mono">Reg ID: {regId}</p>
                    </div>
                </div>
            </div>
        );
    }

    const beneficiaryName = seller.name || 'Ismeretlen szervező';
    const bankName = seller.bankName || 'Nincs megadva';
    const bankAccountNumber = seller.bankAccountNumber || 'Nincs megadva';

    // Calculate Total Price including extras
    const extras = (registration as any).extras as any[] || [];
    const extrasTotal = extras.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    // Use stored finalPrice (which includes discounts) or fallback to distance price
    const basePrice = registration.finalPrice !== null ? Number(registration.finalPrice) : Number(registration.distance.price);
    const totalPrice = basePrice + extrasTotal;

    // Split Beneficiary Logic
    const euroSeller = (event as any).sellerEuro;

    // Logic to detect if we should treat this as a EUR payment
    // 1. If crewSize is present, it's a crew event -> EUR
    // 2. If distance has priceEur and price is 0 (or very low), valid for EUR-only events
    // 1. If crewSize is present AND distance has crewPricing, it's a crew event -> EUR
    // 2. If distance has priceEur and price is 0 (or very low), valid for EUR-only events
    const hasCrewPricing = (registration.distance as any).crewPricing && Object.keys((registration.distance as any).crewPricing || {}).length > 0;
    const isCrewEvent = registration.crewSize && registration.crewSize > 0 && hasCrewPricing;
    const isEurPayment = isCrewEvent || (totalPrice === 0 && (registration.distance as any).priceEur > 0);

    const bankAccountNumberEuro = euroSeller?.bankAccountNumberEuro || seller.bankAccountNumberEuro;
    const ibanEuro = euroSeller?.ibanEuro || seller.ibanEuro;
    const euroBeneficiaryName = euroSeller?.nameEuro || euroSeller?.name || seller.nameEuro || seller.name;
    const euroBankName = euroSeller?.bankName || seller.bankName;

    return (
        <div className="min-h-screen bg-black text-white pt-28 pb-20">
            <div className="container mx-auto px-4 max-w-2xl text-center">
                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10" />
                </div>

                <h1 className="text-3xl md:text-4xl font-black font-heading uppercase mb-4 text-white">
                    {t('title')}
                </h1>
                <p className="text-zinc-400 text-lg mb-8">
                    {t('subtitle', { event: event.title })}
                </p>

                <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 text-left space-y-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-blue-600" />

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white mb-4">{t('transferInfo')}</h3>

                        {/* Belföldi utalás (HUF) - MINDIG megjelenik, ha van seller */}
                        {seller && (
                            <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-800">
                                <h4 className="text-sm font-bold text-zinc-300 uppercase mb-3">Belföldi fizetés esetén (HUF)</h4>
                                <div className="space-y-2">
                                    <div className="flex flex-col md:flex-row justify-between items-center border-b border-zinc-700/50 pb-2">
                                        <span className="text-zinc-400">Kedvezményezett:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white text-right">{seller.name}</span>
                                            <CopyButton text={seller.name} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row justify-between items-center border-b border-zinc-700/50 pb-2">
                                        <span className="text-zinc-400">Bank:</span>
                                        <span className="font-medium text-zinc-200 text-right">{seller.bankName}</span>
                                    </div>
                                    <div className="flex flex-col md:flex-row justify-between items-center">
                                        <span className="text-zinc-400">Számlaszám:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-accent text-lg font-bold text-right tracking-wider">{seller.bankAccountNumber}</span>
                                            <CopyButton text={seller.bankAccountNumber || ''} className="text-accent" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Külföldi / EUR utalás - MINDIG megjelenik, ha van Euro Seller VAGY Euro IBAN */}
                        {(euroSeller || seller.ibanEuro) && (
                            <div className="p-4 bg-blue-900/10 rounded-xl border border-blue-900/30 mt-4">
                                <h4 className="text-sm font-bold text-blue-300 uppercase mb-3">Külföldi fizetés esetén / For International Payments (EUR)</h4>
                                <div className="space-y-2">
                                    <p className="text-xs text-blue-400/80 italic mb-2">Please pay the entry fee to the following account number:</p>
                                    <div className="flex flex-col md:flex-row justify-between items-center border-b border-blue-800/20 pb-2">
                                        <span className="text-zinc-400">Beneficiary Name:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white text-right">{euroBeneficiaryName}</span>
                                            <CopyButton text={euroBeneficiaryName} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row justify-between items-center border-b border-blue-800/20 pb-2">
                                        <span className="text-zinc-400">Bank:</span>
                                        <span className="font-medium text-zinc-200 text-right">{euroBankName}</span>
                                    </div>
                                    {bankAccountNumberEuro && (
                                        <div className="flex flex-col md:flex-row justify-between items-center border-b border-blue-800/20 pb-2">
                                            <span className="text-zinc-400">Account Number:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-blue-300 text-right">{bankAccountNumberEuro}</span>
                                                <CopyButton text={bankAccountNumberEuro} className="text-blue-300" />
                                            </div>
                                        </div>
                                    )}
                                    {ibanEuro && (
                                        <div className="flex flex-col md:flex-row justify-between items-center">
                                            <span className="text-zinc-400">IBAN:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-accent text-lg font-bold text-right tracking-wider">{ibanEuro}</span>
                                                <CopyButton text={ibanEuro} className="text-accent" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Összegző és Közlemény */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div>
                                <label className="text-xs text-zinc-500 uppercase font-bold">{t('amount')}</label>
                                <p className="text-2xl font-bold text-white">
                                    {/* Currency Logic: If Crew Pricing OR EUR Price exists and HUF 0, assume EUR */}
                                    {isEurPayment
                                        ? `${totalPrice} €`
                                        : `${totalPrice.toLocaleString()} Ft`
                                    }
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 uppercase font-bold text-yellow-500">{t('reference')}</label>
                                <div className="flex items-center gap-2">
                                    <p className="text-xl font-mono font-bold text-yellow-400 select-all border border-yellow-500/30 bg-yellow-500/10 rounded px-2 py-1 inline-block">
                                        PRO-{registration.id.substring(0, 8).toUpperCase()}
                                    </p>
                                    <CopyButton text={`PRO-${registration.id.substring(0, 8).toUpperCase()}`} className="text-yellow-500 hover:text-yellow-300" />
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">
                                    Kérjük, a közleménybe <b>csak</b> ezt a kódot írd!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-4">
                    <p className="text-zinc-500 text-sm">
                        {t('emailNotice', { email: registration.user.email })}
                    </p>

                    <Link href={`/dashboard`}>
                        <Button className="bg-white text-black hover:bg-zinc-200 font-bold px-8 rounded-full h-12">
                            {t('dashboardCta')}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
