'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Calendar, MapPin, ChevronRight, CreditCard, CheckCircle, Clock } from 'lucide-react';
import { BANK_DETAILS } from '@/lib/constants';
import { useTranslations } from 'next-intl';

interface RegistrationDistance {
    id: string;
    name: string;
    price: number | string;
    priceEur?: number | string | null;
    crewPricing?: any;
}

interface RegistrationEvent {
    id: string;
    title: string;
    slug: string;
    eventDate: string | Date;
    location: string;
}

interface DashboardRegistration {
    id: string;
    registrationStatus: string;
    paymentStatus?: string; // Add paymentStatus
    createdAt: string | Date;
    distance: RegistrationDistance;
    event: RegistrationEvent;
    finalPrice?: number | string | null;
    crewSize?: number | null;
    extras?: any;
}

function calculateRegistrationPrice(reg: DashboardRegistration) {
    const isCrewPricing = !!(reg.crewSize && reg.distance.crewPricing);

    let basePriceHuf = 0;
    let basePriceEur = 0;

    // finalPrice is stored in DB. If crew, it's EUR. If regular, it's HUF.
    // If not present (legacy), fallback to distance.price
    const finalPrice = reg.finalPrice !== undefined && reg.finalPrice !== null
        ? Number(reg.finalPrice)
        : Number(reg.distance.price);

    if (isCrewPricing) {
        basePriceHuf = 0;
        basePriceEur = finalPrice;
    } else {
        basePriceHuf = finalPrice;
        basePriceEur = Number(reg.distance.priceEur || 0);
    }

    const extras = Array.isArray(reg.extras) ? reg.extras : [];
    const extrasTotalHuf = extras.reduce((sum: number, e: any) => sum + Number(e.price || 0), 0);
    const extrasTotalEur = extras.reduce((sum: number, e: any) => sum + Number(e.priceEur || 0), 0);

    const totalHuf = basePriceHuf + extrasTotalHuf;
    const totalEur = basePriceEur + extrasTotalEur;

    // Logic: If Crew OR (HUF is 0 and EUR > 0), show EUR
    const isEurOnly = isCrewPricing || (totalHuf === 0 && totalEur > 0);

    let displayString = `${totalHuf.toLocaleString()} Ft`;
    if (isEurOnly) {
        displayString = `${totalEur} €`;
    } else if (totalHuf > 0 && totalEur > 0) {
        displayString = `${totalHuf.toLocaleString()} Ft / ${totalEur} €`;
    }

    return {
        totalHuf,
        totalEur,
        isEurOnly,
        displayString
    };
}

// Payment Modal Component
function PaymentModal({ isOpen, onClose, registration }: { isOpen: boolean; onClose: () => void; registration: DashboardRegistration | null }) {
    const t = useTranslations('Dashboard.Registrations');
    if (!isOpen || !registration) return null;

    const priceDetails = calculateRegistrationPrice(registration);
    const { displayString, isEurOnly } = priceDetails;

    // Determine Bank Details based on Currency logic
    // We don't have the full Event/Seller object here with sellerEuro fields unfortunately unless we fetch it.
    // However, the user said "A siker oldal tökéletes". The success page had the logic.
    // Here we might be missing `sellerEuro` data in `DashboardRegistration`.
    // BUT the modal just shows static text from `BANK_DETAILS` constant in the current code!
    // src/lib/constants.ts might handle only HUF.
    // I need to check constants. If the user wants successful PDF logic, I should show the correct bank details here too.

    // User complaint: "bankszámla szám nem jó... szerintem ez beégetett!" (in PDF context).
    // Now user says "siker oldal tökéletes, de a pdf nem".
    // Wait, user says "ami nem jó a felhasználói fiókben nem írja ki a nevezés értékét".
    // User didn't explicitly complain about bank details in dashboard, but if I show EUR price, I should show EUR bank.

    // For now, I will fix the PRICE first as requested.
    // And I will try to update the bank details if possible, but constants are... constant.
    // If constants doesn't have EUR, I might need to harcode or fetch.

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">✕</button>
                <h3 className="text-xl font-bold font-heading mb-4 text-white uppercase">{t('paymentInfo')}</h3>
                <div className="space-y-4">
                    <p className="text-sm text-zinc-400">{t('paymentInstruction')}</p>
                    <div className="bg-black/50 p-4 rounded-lg border border-zinc-800">
                        <div className="flex justify-between mb-2">
                            <span className="text-zinc-500">{t('beneficiary')}:</span>
                            <span className="text-white font-medium">{BANK_DETAILS.BENEFICIARY}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-zinc-500">{t('bank')}:</span>
                            <span className="text-white font-medium">{BANK_DETAILS.BANK_NAME}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-zinc-500">{t('account')}:</span>
                            <span className="text-accent font-mono">{BANK_DETAILS.ACCOUNT_NUMBER}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-zinc-700">
                            <span className="text-zinc-500">{t('amount')}:</span>
                            <span className="text-xl font-bold text-white">{displayString}</span>
                        </div>
                        <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 p-2 rounded text-center">
                            <span className="text-xs text-yellow-500 block uppercase font-bold">{t('reference')}</span>
                            <span className="text-yellow-400 font-mono font-bold select-all">#{registration.id.substring(0, 8).toUpperCase()}</span>
                        </div>
                    </div>
                    {/* Warning about EUR if applicable? Or just simple close */}
                    <Button onClick={onClose} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold">{t('close')}</Button>
                </div>
            </div>
        </div>
    );
}

export default function RegistrationList({ registrations }: { registrations: DashboardRegistration[] }) {
    const t = useTranslations('Dashboard.Registrations');
    const [selectedReg, setSelectedReg] = useState<DashboardRegistration | null>(null);

    return (
        <div className="space-y-4">
            {registrations.length === 0 && (
                <div className="text-center py-12 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-zinc-800">
                    <p>{t('emptyTitle')}</p>
                </div>
            )}

            {registrations.map(reg => {
                const { displayString } = calculateRegistrationPrice(reg);
                return (
                    <div key={reg.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all group">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge variant={reg.registrationStatus === 'CONFIRMED' ? 'accent' : 'outline'} className={reg.registrationStatus === 'PENDING' ? 'text-yellow-500 border-yellow-500/50' : ''}>
                                        {reg.registrationStatus === 'PENDING' ? t('status.pending') : reg.registrationStatus === 'CONFIRMED' ? t('status.confirmed') : reg.registrationStatus}
                                    </Badge>
                                    <span className="text-zinc-500 text-sm flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(reg.event.eventDate).toLocaleDateString('hu-HU')}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-accent transition-colors">{reg.event.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-zinc-400">
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {reg.event.location}</span>
                                    <span className="font-bold text-white px-2 py-0.5 bg-zinc-800 rounded">{reg.distance.name}</span>
                                    <span className="font-bold text-accent">{displayString}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {reg.registrationStatus === 'PENDING' && (
                                    <Button size="sm" onClick={() => setSelectedReg(reg)} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        {t('transferBtn')}
                                    </Button>
                                )}
                                {reg.registrationStatus === 'CONFIRMED' && (
                                    <div className="flex items-center gap-2 text-green-500 font-bold text-sm bg-green-500/10 px-3 py-2 rounded-full">
                                        <CheckCircle className="w-4 h-4" />
                                        {t('confirmed')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}

            <PaymentModal isOpen={!!selectedReg} onClose={() => setSelectedReg(null)} registration={selectedReg} />
        </div>
    );
}
