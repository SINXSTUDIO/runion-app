'use client';

import { useState, useEffect } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { toast } from 'sonner';
import { FormField } from '@/lib/types/form';
import DynamicFormRenderer from './DynamicFormRenderer';
import { Button } from '@/components/ui/Button';
import { ArrowRight, ArrowLeft, CheckCircle, CreditCard, User, MapPin, Package } from 'lucide-react';
import { submitRegistration } from '@/actions/registration';
import { useSearchParams } from 'next/navigation';
import { detectGenderByName } from '@/lib/utils/name-gender';

import { useTranslations, useLocale } from 'next-intl';

interface WizardProps {
    event: any;
    user: any;
    formConfig: FormField[];
}

export default function RegistrationWizard({ event, user, formConfig }: WizardProps) {
    const t = useTranslations('Registration');
    const locale = useLocale();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState(1);
    const [selectedDistance, setSelectedDistance] = useState<string>(searchParams.get('distanceId') || '');
    const [selectedExtras, setSelectedExtras] = useState<any[]>([]);
    const [crewSize, setCrewSize] = useState<number>(1); // Crew size for dynamic pricing

    // Auto-advance removed to enforce strict step order
    // User must always see Step 1 to confirm distance and crew size if applicable

    // Smart mapping helper
    const getInitialFormData = () => {
        const initialData: Record<string, any> = {};

        formConfig.forEach(field => {
            const label = field.label.toLowerCase();

            // Email
            if (field.type === 'email' || label.includes('email')) {
                initialData[field.id] = user.email || '';
                return;
            }

            // Phone - EXCLUDE emergency contacts
            if ((label.includes('telefon') || label.includes('phone') || label.includes('mobil')) && !label.includes('baleset') && !label.includes('emergency') && !label.includes('értesítendő')) {
                initialData[field.id] = user.phoneNumber || '';
                return;
            }

            // Date of Birth
            if (field.type === 'date' || label.includes('szület') || label.includes('birth')) {
                initialData[field.id] = user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '';
                return;
            }

            // Gender
            if (label.includes('nem') || label.includes('gender')) {
                let genderValue = user.gender || '';

                // If gender is missing, try to detect from name
                if (!genderValue && (user.firstName || user.name)) {
                    const detected = detectGenderByName(user.firstName || user.name);
                    if (detected) genderValue = detected;
                }

                // If the form has options, try to map the user's gender string (or detected) to one of the options
                const options = (field.options && field.options.length > 0) ? field.options : ['Férfi', 'Nő'];
                if (options.length > 0 && genderValue) {
                    const lowerUserGender = genderValue.toLowerCase();
                    const maleKeywords = ['férfi', 'ferfi', 'male', 'man', 'fiú'];
                    const femaleKeywords = ['nő', 'no', 'female', 'woman', 'lány'];

                    let targetKeywords: string[] = [];
                    if (maleKeywords.includes(lowerUserGender)) targetKeywords = maleKeywords;
                    else if (femaleKeywords.includes(lowerUserGender)) targetKeywords = femaleKeywords;

                    if (targetKeywords.length > 0) {
                        const match = options.find(opt =>
                            targetKeywords.some(k => opt.toLowerCase().includes(k))
                        );
                        if (match) genderValue = match;
                    }
                }

                initialData[field.id] = genderValue;
                return;
            }

            // Name fields
            if (label.includes('vezeték') || label.includes('last name') || label.includes('család')) {
                initialData[field.id] = user.lastName || '';
                return;
            }
            if (label.includes('kereszt') || label.includes('first name') || label.includes('utónév')) {
                initialData[field.id] = user.firstName || '';
                return;
            }
            if ((label.includes('név') || label.includes('neve') || label.includes('name')) && !label.includes('any') && !label.includes('megjegyzés') && !label.includes('csapat') && !label.includes('pár') && !label.includes('partner')) {

                // Emergency contact field map
                if (label.includes('baleset') || label.includes('értesítendő') || label.includes('emergency')) {
                    const parts = [];
                    // Ensure we don't auto-fill user's own name as emergency contact
                    const userName = user.name || `${user.lastName} ${user.firstName}`;

                    if (user.emergencyContactName && user.emergencyContactName !== userName) {
                        parts.push(user.emergencyContactName);
                    }
                    if (user.emergencyContactPhone) parts.push(user.emergencyContactPhone);

                    initialData[field.id] = parts.join(', ');
                    return;
                }

                // If specific First/Last fields exist, this might be a full name field
                if (user.lastName && user.firstName) {
                    initialData[field.id] = `${user.lastName} ${user.firstName}`;
                } else {
                    initialData[field.id] = user.name || '';
                }
                return;
            }

            // Address fields
            if (label.includes('irányító') || label.includes('zip') || label.includes('post')) {
                initialData[field.id] = user.zipCode || '';
                return;
            }
            if (label.includes('város') || label.includes('city') || label.includes('helység') || label.includes('település')) {
                initialData[field.id] = user.city || '';
                return;
            }
            if (label.includes('cím') || label.includes('address') || label.includes('utca')) {
                initialData[field.id] = user.address || '';
                return;
            }
            if (label.includes('klub') || label.includes('club') || label.includes('egyesület')) {
                initialData[field.id] = user.clubName || '';
                return;
            }

            // T-shirt Size / Póló Méret
            if (label.includes('póló') || label.includes('tshirt') || label.includes('t-shirt') || label.includes('méret')) {
                initialData[field.id] = user.tshirtSize || '';
                return;
            }

            // Explicit fallbacks for standard aliases if ID matches (unlikely but good for safety)
            if (field.id === 'email') initialData[field.id] = user.email;
            if (field.id === 'firstName') initialData[field.id] = user.firstName;
            if (field.id === 'lastName') initialData[field.id] = user.lastName;

            // Pre-fill profile extensions
            if (field.id === 'isVegetarian' || label.includes('vega') || label.includes('hús') || label.includes('vegetáriánus')) {
                initialData[field.id] = user.isVegetarian || false;
                return;
            }

            if (field.id === 'fiveTrialsId' || label.includes('ötpróba') || label.includes('five trials') || label.includes('5próba')) {
                initialData[field.id] = user.fiveTrialsId || '';
                return;
            }

            if (field.id === 'teamName' || label.includes('csapat') || label.includes('team')) {
                // If it's a team MEMBER list field (textarea/text), pre-fill from user profile
                if ((label.includes('tagok') || label.includes('members') || label.includes('névsor')) && user.teamMembers && user.teamMembers.length > 0) {
                    initialData[field.id] = user.teamMembers.join(', ');
                    return;
                }

                // If it's just "Club/Team Name"
                initialData[field.id] = user.teamName || '';
                return;
            }
        });

        return initialData;
    };

    const [formData, setFormData] = useState<Record<string, any>>(getInitialFormData());
    const [billingData, setBillingData] = useState({
        name: user.billingName || user.name || `${user.lastName || ''} ${user.firstName || ''}`.trim(),
        zip: user.billingZipCode || user.zipCode || '',
        city: user.billingCity || user.city || '',
        address: user.billingAddress || user.address || '',
        taxNumber: user.taxNumber || ''
    });

    const [liabilityAccepted, setLiabilityAccepted] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);

    // Honeypot field for bot detection
    const [honeypot, setHoneypot] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [exchangeRate, setExchangeRate] = useState<number | null>(null);

    useEffect(() => {
        // Fetch EUR to HUF rate
        fetch('https://api.exchangerate-api.com/v4/latest/EUR')
            .then(res => res.json())
            .then(data => {
                if (data.rates && data.rates.HUF) {
                    setExchangeRate(data.rates.HUF);
                }
            })
            .catch(err => console.error('Failed to fetch exchange rate', err));
    }, []);

    const formatPrice = (priceHuf: number | string, priceEur: number | string | undefined | null) => {
        const huf = Number(priceHuf);
        const eur = priceEur ? Number(priceEur) : 0;

        if (huf > 0 && eur > 0) {
            return `${huf.toLocaleString()} Ft / ${eur} €`;
        }
        if (huf === 0 && eur > 0) {
            if (exchangeRate) {
                const calculatedHuf = Math.ceil((eur * exchangeRate) / 100) * 100;
                return `~${calculatedHuf.toLocaleString()} Ft (${eur} €)`;
            }
            return `${eur} €`;
        }
        return `${huf.toLocaleString()} Ft`;
    };
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [validationError, setValidationError] = useState<string | null>(null);

    // Clear error when changing steps or values
    useEffect(() => {
        setValidationError(null);
    }, [step, selectedDistance, formData]);

    const steps = [
        { id: 1, title: t('steps.distance'), icon: MapPin },
        { id: 2, title: t('steps.extras'), icon: Package },
        { id: 3, title: t('steps.data'), icon: User },
        { id: 4, title: t('steps.billing'), icon: CreditCard },
        { id: 5, title: t('steps.summary'), icon: CheckCircle },
    ];

    const handleFormChange = (id: string, value: any) => {
        setFormData(prev => {
            const newData = { ...prev, [id]: value };

            // Auto-detect gender logic
            const field = formConfig.find(f => f.id === id);
            if (field && typeof value === 'string') {
                const label = field.label.toLowerCase();
                // Check if it's a first name field (by ID or label)
                if (field.id === 'firstName' || label.includes('kereszt') || label.includes('first') || label.includes('utónév')) {
                    const detected = detectGenderByName(value);
                    if (detected) {
                        const genderField = formConfig.find(f =>
                            f.id === 'gender' ||
                            f.label.toLowerCase() === 'nem' ||
                            f.label.toLowerCase() === 'neme' ||
                            f.label.toLowerCase().includes('gender')
                        );
                        if (genderField) {
                            // Map 'MALE'/'FEMALE' to field options if possible
                            let mappedValue: string = detected;
                            if (genderField.options && genderField.options.length > 0) {
                                // Try to match options based on detected gender
                                const lowerDetected = detected.toLowerCase();
                                const maleKeywords = ['férfi', 'ferfi', 'male', 'man', 'fiú'];
                                const femaleKeywords = ['nő', 'no', 'female', 'woman', 'lány'];

                                const targetKeywords = lowerDetected === 'male' ? maleKeywords : femaleKeywords;

                                const match = genderField.options.find(opt =>
                                    targetKeywords.some(k => opt.toLowerCase().includes(k))
                                );
                                if (match) mappedValue = match;
                            }
                            newData[genderField.id] = mappedValue;
                        }
                    }
                }
            }
            return newData;
        });
        if (errors[id]) setErrors(prev => ({ ...prev, [id]: '' }));
    };

    const nextStep = () => {
        // Validation
        if (step === 1 && !selectedDistance) {
            setValidationError(t('errors.selectDistance'));
            toast.error(t('errors.selectDistance'));
            return;
        }
        if (step === 3) {
            // Validate dynamic form
            const newErrors: Record<string, string> = {};
            let hasError = false;
            formConfig.forEach(field => {
                if (field.required && !formData[field.id]) {
                    newErrors[field.id] = t('personal.required').replace(' *', '');
                    hasError = true;
                }
            });
            setErrors(newErrors);
            if (hasError) return;
        }
        if (step === 4) {
            if (!billingData.name || !billingData.zip || !billingData.city || !billingData.address) {
                toast.error(t('errors.missingBilling'));
                return;
            }
        }
        setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        // Silent honeypot check - if filled, it's a bot
        if (honeypot) {
            // Silently fail for bots
            setSubmitting(true);
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast.success(t('actions.processing'));
            return;
        }

        if (!liabilityAccepted || !privacyAccepted) {
            toast.error(t('errors.acceptTerms'));
            return;
        }

        setSubmitting(true);

        // Map billing data to server schema expectations
        const mappedBilling = {
            billingName: billingData.name,
            billingZip: billingData.zip,
            billingCity: billingData.city,
            billingAddress: billingData.address,
            billingTaxNumber: billingData.taxNumber.replace(/\s/g, '')
        };

        const result = await submitRegistration(event.id, user.id, selectedDistance, formData, mappedBilling, selectedExtras, crewSize);
        if (result.success) {
            router.push(`/races/${event.slug}/register/success?regId=${result.registrationId}`);
        } else {
            toast.error('Hiba történt: ' + result.error);
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Steps Progress */}
            <div className="flex justify-between mb-12 relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-800 -z-10" />
                {steps.map((s) => {
                    const isActive = s.id === step;
                    const isCompleted = s.id < step;
                    return (
                        <div key={s.id} className="flex flex-col items-center bg-black px-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${isActive || isCompleted ? 'border-accent bg-accent/10 text-accent' : 'border-zinc-700 bg-zinc-900 text-zinc-500'}`}>
                                <s.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-xs mt-2 font-bold uppercase ${isActive ? 'text-white' : 'text-zinc-500'}`}>{s.title}</span>
                        </div>
                    );
                })}
            </div>

            {/* Content */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm min-h-[400px]">
                {step === 1 && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold font-heading uppercase mb-6 text-white">{t('distance.title')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {event.distances.map((dist: any) => (
                                <div
                                    key={dist.id}
                                    onClick={() => setSelectedDistance(dist.id)}
                                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${selectedDistance === dist.id ? 'border-accent bg-accent/10 shadow-[0_0_20px_rgba(0,242,254,0.1)]' : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500'}`}
                                >
                                    <h3 className="text-xl font-bold text-white mb-2">{dist.name}</h3>
                                    <div className="flex flex-col">
                                        {(() => {
                                            const discountPercent = Number(user?.membershipTier?.discountPercentage || 0);
                                            const discountAmt = Number(user?.membershipTier?.discountAmount || 0);
                                            const hasDiscount = discountPercent > 0 || discountAmt > 0;

                                            // Format basic price
                                            const originalPriceDisplay = formatPrice(dist.price, dist.priceEur);

                                            if (hasDiscount) {
                                                let discountedHuf = Number(dist.price);
                                                let discountLabel = '';

                                                if (discountAmt > 0) {
                                                    discountedHuf = Math.max(0, discountedHuf - discountAmt);
                                                    discountLabel = `-${discountAmt.toLocaleString()} Ft`;
                                                } else {
                                                    discountedHuf = Math.floor(discountedHuf * (1 - discountPercent / 100));
                                                    discountLabel = `-${discountPercent}%`;
                                                }

                                                return (
                                                    <>
                                                        <span className="text-zinc-500 line-through text-sm">
                                                            {originalPriceDisplay}
                                                        </span>
                                                        <span className="text-accent font-mono text-lg">
                                                            {discountedHuf.toLocaleString()} Ft
                                                            <span className="text-xs ml-2 text-accent/80 font-bold">
                                                                ({user.membershipTier.name} {discountLabel})
                                                            </span>
                                                        </span>
                                                    </>
                                                );
                                            }
                                            return <span className="text-accent font-mono text-lg">{originalPriceDisplay}</span>;
                                        })()}
                                    </div>
                                    <div className="text-sm text-zinc-400 mt-2">
                                        {t('distance.spots', { count: dist.capacityLimit - (dist._count?.registrations || 0) })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Crew Size Selector */}
                        {selectedDistance && event.distances.find((d: any) => d.id === selectedDistance)?.crewPricing && (
                            <div className="mt-6 bg-accent/5 border border-accent/30 rounded-xl p-6">
                                <label className="block text-sm font-bold text-white mb-3">
                                    👥 Crew Létszám (Segítők)
                                </label>
                                <select
                                    value={crewSize}
                                    onChange={(e) => setCrewSize(Number(e.target.value))}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:border-accent focus:outline-none font-mono"
                                >
                                    {Object.keys(event.distances.find((d: any) => d.id === selectedDistance)?.crewPricing || {}).map((size: string) => (
                                        <option key={size} value={size}>
                                            {size} fő - {event.distances.find((d: any) => d.id === selectedDistance)?.crewPricing[size]} EUR
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-zinc-400 mt-2">
                                    💡 Az ár automatikusan változik a kiválasztott crew létszám alapján.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold font-heading uppercase mb-2 text-white">{t('extras.title')}</h2>
                        <p className="text-zinc-500 mb-6">{t('extras.subtitle')}</p>

                        {(event.extras as any[] || []).length === 0 ? (
                            <div className="bg-zinc-800/50 p-6 rounded-xl text-center text-zinc-400 italic">
                                {t('extras.empty')}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {(event.extras as any[]).map((extra) => {
                                    const isSelected = selectedExtras.some(e => e.id === extra.id);

                                    // Language-aware name
                                    const extraName = locale === 'en' ? (extra.nameEn || extra.name)
                                        : locale === 'de' ? (extra.nameDe || extra.name)
                                            : extra.name;

                                    return (
                                        <div
                                            key={extra.id}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id));
                                                } else {
                                                    setSelectedExtras([...selectedExtras, extra]);
                                                }
                                            }}
                                            className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-accent bg-accent/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}
                                        >
                                            {/* Selection Indicator (Checkbox style) */}
                                            <div className={`mt-1 w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-accent border-accent text-black' : 'border-zinc-600 bg-transparent'}`}>
                                                {isSelected && <CheckCircle className="w-4 h-4" />}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-white whitespace-pre-wrap leading-relaxed">{extraName}</h3>
                                                <p className="text-xs text-zinc-500 mt-1">{t('extras.oneTime')}</p>
                                            </div>

                                            <div className="text-right flex-shrink-0">
                                                <span className="text-lg font-bold text-white block">
                                                    {formatPrice(extra.price, extra.priceEur)}
                                                </span>
                                                <span className={`text-xs font-bold uppercase mt-1 block ${isSelected ? 'text-accent' : 'text-zinc-600'}`}>
                                                    {isSelected ? 'Kiválasztva' : 'Nincs kiválasztva'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold font-heading uppercase mb-2 text-white">{t('personal.title')}</h2>
                        <p className="text-zinc-500 mb-6">{t('personal.subtitle')}</p>
                        <DynamicFormRenderer
                            fields={formConfig}
                            values={formData}
                            onChange={handleFormChange}
                            errors={errors}
                            userGender={user?.gender}
                        />
                        <div className="text-right text-sm text-zinc-500 mt-4">
                            {t('personal.required')}
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold font-heading uppercase mb-6 text-white">{t('billing.title')}</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="text-sm text-zinc-400">{t('billing.name')}</label>
                                <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent" value={billingData.name} onChange={e => setBillingData({ ...billingData, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-zinc-400">{t('billing.zip')}</label>
                                    <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent" value={billingData.zip} onChange={e => setBillingData({ ...billingData, zip: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-sm text-zinc-400">{t('billing.city')}</label>
                                    <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent" value={billingData.city} onChange={e => setBillingData({ ...billingData, city: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-zinc-400">{t('billing.address')}</label>
                                <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent" value={billingData.address} onChange={e => setBillingData({ ...billingData, address: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm text-zinc-400">{t('billing.taxNumber')}</label>
                                <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent" value={billingData.taxNumber} onChange={e => setBillingData({ ...billingData, taxNumber: e.target.value })} />
                            </div>
                            <div className="text-right text-sm text-zinc-500 mt-4">
                                {t('personal.required')}
                            </div>
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="space-y-6 text-center">
                        <h2 className="text-2xl font-bold font-heading uppercase mb-4 text-white">{t('summary.title')}</h2>
                        <div className="bg-zinc-800 p-6 rounded-xl text-left max-w-md mx-auto mb-6">
                            <p className="flex justify-between py-2 border-b border-zinc-700">
                                <span className="text-zinc-400">{t('summary.distanceLabel')}</span>
                                <span className="text-white font-bold">
                                    {event.distances.find((d: any) => d.id === selectedDistance)?.name}
                                </span>
                            </p>
                            <p className="flex justify-between py-2 border-b border-zinc-700">
                                <span className="text-zinc-400">{t('summary.priceLabel')}</span>
                                <span className="text-white font-bold">
                                    {(() => {
                                        const d = event.distances.find((d: any) => d.id === selectedDistance);
                                        // If crew pricing, show crew-based price
                                        if (d?.crewPricing) {
                                            const crewPrice = d.crewPricing[crewSize.toString()];
                                            return `${crewPrice} EUR`;
                                        }
                                        return formatPrice(d?.price || 0, d?.priceEur);
                                    })()}
                                </span>
                            </p>

                            {/* Membership Discount Row */}
                            {(() => {
                                const d = event.distances.find((d: any) => d.id === selectedDistance);
                                const discountPercent = Number(user?.membershipTier?.discountPercentage || 0);
                                const discountAmt = Number(user?.membershipTier?.discountAmount || 0);

                                if ((discountPercent > 0 || discountAmt > 0) && !d?.crewPricing) {
                                    const baseHuf = Number(d?.price || 0);
                                    let discountValue = 0;
                                    let discountText = '';

                                    if (discountAmt > 0) {
                                        discountValue = Math.min(baseHuf, discountAmt);
                                        discountText = `-${discountAmt.toLocaleString()} Ft`;
                                    } else {
                                        discountValue = Math.floor(baseHuf * (discountPercent / 100));
                                        discountText = `-${discountPercent}%`;
                                    }

                                    if (discountValue > 0) {
                                        return (
                                            <p className="flex justify-between py-2 border-b border-zinc-700 text-accent">
                                                <span>{user.membershipTier.name} kedvezmény ({discountText})</span>
                                                <span className="font-bold">-{discountValue.toLocaleString()} Ft</span>
                                            </p>
                                        );
                                    }
                                }
                                return null;
                            })()}

                            {selectedExtras.map(extra => {
                                const extraName = locale === 'en' ? (extra.nameEn || extra.name) : locale === 'de' ? (extra.nameDe || extra.name) : extra.name;
                                return (
                                    <p key={extra.id} className="flex justify-between py-2 border-b border-zinc-700 italic">
                                        <span className="text-zinc-400">+ {extraName}:</span>
                                        <span className="text-white font-bold">{formatPrice(extra.price, extra.priceEur)}</span>
                                    </p>
                                );
                            })}

                            <p className="flex justify-between py-4 border-t border-zinc-600 mt-2">
                                <span className="text-white font-bold text-lg uppercase">{t('summary.totalLabel')}</span>
                                <span className="text-accent font-black text-2xl">
                                    {(() => {
                                        const d = event.distances.find((d: any) => d.id === selectedDistance);

                                        // Base price calculation - check for crew pricing
                                        let baseHuf = Number(d?.price || 0);
                                        let baseEur = Number(d?.priceEur || 0);

                                        if (d?.crewPricing) {
                                            // If crew pricing is used, override with crew-based price
                                            baseHuf = 0; // No HUF for crew pricing
                                            baseEur = Number(d.crewPricing[crewSize.toString()] || 0);
                                        } else {
                                            // Apply Membership Discount
                                            const discountPercent = Number(user?.membershipTier?.discountPercentage || 0);
                                            const discountAmt = Number(user?.membershipTier?.discountAmount || 0);

                                            if (discountAmt > 0) {
                                                baseHuf = Math.max(0, baseHuf - discountAmt);
                                            } else if (discountPercent > 0) {
                                                baseHuf = Math.floor(baseHuf * (1 - discountPercent / 100));
                                            }
                                        }

                                        // Sum extras
                                        const extrasHuf = selectedExtras.reduce((sum, e) => sum + Number(e.price || 0), 0);
                                        const extrasEur = selectedExtras.reduce((sum, e) => sum + Number(e.priceEur || 0), 0);

                                        const totalHuf = baseHuf + extrasHuf;
                                        const totalEur = baseEur + extrasEur;

                                        // Total display logic
                                        // If Total HUF > 0 and Total EUR > 0: Show both
                                        if (totalHuf > 0 && totalEur > 0) {
                                            return `${totalHuf.toLocaleString()} Ft / ${totalEur} €`;
                                        }
                                        // If Total HUF == 0 and Total EUR > 0 (foreign event):
                                        if (totalHuf === 0 && totalEur > 0) {
                                            if (exchangeRate) {
                                                const computedHuf = Math.ceil((totalEur * exchangeRate) / 100) * 100;
                                                return `~${computedHuf.toLocaleString()} Ft (${totalEur} €)`;
                                            }
                                            return `${totalEur} €`;
                                        }

                                        return `${totalHuf.toLocaleString()} Ft`;
                                    })()}
                                </span>
                            </p>
                            <p className="flex justify-between py-2"><span className="text-zinc-400">{t('summary.paymentMethod')}</span> <span className="text-white font-bold">{t('summary.bankTransfer')}</span></p>
                        </div>

                        {/* Consents */}
                        <div className="max-w-md mx-auto text-left space-y-3 mb-6">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${liabilityAccepted ? 'bg-accent border-accent text-black' : 'border-zinc-600 bg-transparent'}`}>
                                    {liabilityAccepted && <CheckCircle className="w-3.5 h-3.5" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={liabilityAccepted} onChange={e => setLiabilityAccepted(e.target.checked)} />
                                <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                                    {t('summary.liability')} <span className="text-accent">*</span>
                                </span>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${privacyAccepted ? 'bg-accent border-accent text-black' : 'border-zinc-600 bg-transparent'}`}>
                                    {privacyAccepted && <CheckCircle className="w-3.5 h-3.5" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={privacyAccepted} onChange={e => setPrivacyAccepted(e.target.checked)} />
                                <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                                    {t.rich('summary.terms', {
                                        link1: (chunks) => <a href={`/${locale}/privacy`} target="_blank" className="text-accent underline hover:text-accent-hover">{chunks}</a>,
                                        link2: (chunks) => <a href={`/${locale}/terms`} target="_blank" className="text-accent underline hover:text-accent-hover">{chunks}</a>
                                    })} <span className="text-accent">*</span>
                                </span>
                            </label>
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl text-yellow-300 text-sm text-left">
                            {t('summary.warning')}
                        </div>
                    </div>
                )}
            </div>

            {/* Honeypot - Anti-spam field (hidden from users, visible to bots) */}
            <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0 }} aria-hidden="true">
                <label htmlFor="website_field">Website</label>
                <input
                    type="text"
                    id="website_field"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    autoComplete="off"
                    tabIndex={-1}
                />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 mt-8">
                {validationError && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-center font-bold animate-pulse">
                        ⚠️ {validationError}
                    </div>
                )}
                <div className="flex justify-between">
                    <Button variant="outline" onClick={prevStep} disabled={step === 1 || submitting} className="text-zinc-400 border-zinc-700 hover:text-white">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('actions.back')}
                    </Button>

                    {step < 5 ? (
                        <Button onClick={nextStep} className="bg-accent text-black hover:bg-accent/80 font-bold px-8">
                            {t('actions.next')}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={submitting} className="bg-accent text-black hover:bg-accent/80 font-bold px-8 animate-pulse hover:animate-none">
                            {submitting ? t('actions.processing') : t('actions.finish')}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
