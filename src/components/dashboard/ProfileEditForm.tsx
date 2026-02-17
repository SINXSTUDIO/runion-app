'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateUserProfile } from '@/actions/user-dashboard';
import { Edit2, X, AlertCircle, Save, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useTranslations } from 'next-intl';
import { detectGenderByName } from '@/lib/utils/name-gender';
import { useEffect } from 'react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

// Schema will be re-defined inside component or we use generic messages if possible,
// but for correct translation of error messages, the schema needs access to `t`, or strictly use constants.
// For simplicity, we can define the schema shape outside, but refine messages inside, or just define it inside.
// Defining inside allow usage of `t`.

interface ProfileEditFormProps {
    user: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string | null;
        phoneNumber: string | null;
        birthDate: Date | string | null;
        clubName: string | null;
        tshirtSize: string | null;
        city: string | null;
        zipCode: string | null;
        address: string | null;
        emergencyContactName: string | null;
        emergencyContactPhone: string | null;
        image: string | null;
        gender: string | null;
        createdAt: Date | string;
        isVegetarian?: boolean | null;
        fiveTrialsId?: string | null;
        teamName: string | null;
        teamMembers: any; // Prisma Json type
        billingName: string | null;
        taxNumber: string | null;
        billingZipCode: string | null;
        billingCity: string | null;
        billingAddress: string | null;
    };
}

export default function ProfileEditForm({ user }: ProfileEditFormProps) {
    const t = useTranslations('Profile');
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Define schema inside component to use translations
    const profileSchema = z.object({
        firstName: z.string().min(1, t('edit.error')), // Fallback error or specific
        lastName: z.string().min(1, t('edit.error')),
        phoneNumber: z.string().optional().nullable(),
        birthDate: z.string().optional().nullable(),
        gender: z.string().optional().nullable(),
        clubName: z.string().optional().nullable(),
        tshirtSize: z.string().optional().nullable(),
        city: z.string().optional().nullable(),
        zipCode: z.string().optional().nullable(),
        street: z.string().optional().nullable(), // Maps to 'address'
        emergencyContactName: z.string().optional().nullable(),
        emergencyContactPhone: z.string().optional().nullable(),
        image: z.string().optional().nullable(),
        isVegetarian: z.boolean().optional(),
        fiveTrialsId: z.string().optional().nullable(),
        teamName: z.string().optional().nullable(),
        teamMembers: z.array(z.string()).optional(),
        billingName: z.string().optional().nullable(),
        taxNumber: z.string().optional().nullable(),
        billingZipCode: z.string().optional().nullable(),
        billingCity: z.string().optional().nullable(),
        billingAddress: z.string().optional().nullable(),
    });

    type ProfileFormData = z.infer<typeof profileSchema>;

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phoneNumber: user.phoneNumber || '',
            birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
            gender: user.gender || '',
            clubName: user.clubName || '',
            tshirtSize: user.tshirtSize || '',
            city: user.city || '',
            zipCode: user.zipCode || '',
            street: user.address || '',
            emergencyContactName: user.emergencyContactName || '',
            emergencyContactPhone: user.emergencyContactPhone || '',
            image: user.image || '',
            isVegetarian: user.isVegetarian || false,
            fiveTrialsId: user.fiveTrialsId || '',
            teamName: user.teamName || '',
            teamMembers: (user.teamMembers as string[]) || [],
            billingName: user.billingName || '',
            taxNumber: user.taxNumber || '',
            billingZipCode: user.billingZipCode || '',
            billingCity: user.billingCity || '',
            billingAddress: user.billingAddress || '',
        }
    });

    const currentImage = watch('image');
    const firstName = watch('firstName');
    const gender = watch('gender');

    useEffect(() => {
        if (firstName && !gender && isOpen) { // Only auto-set if gender is empty AND modal is open
            const detected = detectGenderByName(firstName);
            if (detected) {
                setValue('gender', detected, { shouldDirty: true, shouldValidate: true });
            }
        }
    }, [firstName, gender, isOpen, setValue]);

    const onSubmit = (data: ProfileFormData) => {
        setError(null);
        startTransition(async () => {
            const result = await updateUserProfile(data); // Note: server action validation might return errors too
            if (result.success) {
                setIsOpen(false);
                router.refresh();
            } else {
                setError(result.error || t('edit.error'));
            }
        });
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                variant="primary"
                className="font-bold gap-2"
            >
                <Edit2 className="w-4 h-4" />
                {t('edit.button')}
            </Button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-zinc-900 z-10">
                    <h2 className="text-2xl font-black italic text-white">{t('edit.title')}</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Image Upload */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white border-l-4 border-blue-500 pl-3">{t('edit.image')}</h3>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <ImageUpload
                                    value={currentImage || ''}
                                    onChange={(url) => setValue('image', url, { shouldDirty: true })}
                                    label={t('edit.imageLabel')}
                                    description={t('edit.imageDesc')}
                                    preset="avatar"
                                />
                            </div>
                        </div>

                        {/* Personal Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white border-l-4 border-accent pl-3">{t('edit.personal')}</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">{t('fields.lastName')}</label>
                                    <Input {...register('lastName')} placeholder={t('fields.lastName')} className="bg-white/5 border-white/10 text-white" />
                                    {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">{t('fields.firstName')}</label>
                                    <Input {...register('firstName')} placeholder={t('fields.firstName')} className="bg-white/5 border-white/10 text-white" />
                                    {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">{t('fields.birthDate')}</label>
                                    <Input type="date" {...register('birthDate')} className="bg-white/5 border-white/10 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">{t('fields.phone')}</label>
                                    <Input {...register('phoneNumber')} placeholder="+36 30 123 4567" className="bg-white/5 border-white/10 text-white" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">{t('fields.gender')}</label>
                                <select
                                    {...register('gender')}
                                    className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                                >
                                    <option value="" className="bg-zinc-900">{t('fields.genderPlaceholder')}</option>
                                    <option value="MALE" className="bg-zinc-900">{t('fields.genderMale')}</option>
                                    <option value="FEMALE" className="bg-zinc-900">{t('fields.genderFemale')}</option>
                                </select>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white border-l-4 border-emerald-500 pl-3">{t('edit.address')}</h3>
                            <div className="grid grid-cols-[1fr_2fr] gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">{t('fields.zip')}</label>
                                    <Input {...register('zipCode')} placeholder="1234" className="bg-white/5 border-white/10 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">{t('fields.city')}</label>
                                    <Input {...register('city')} placeholder={t('fields.city')} className="bg-white/5 border-white/10 text-white" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">{t('fields.street')}</label>
                                <Input {...register('street')} placeholder={t('fields.street')} className="bg-white/5 border-white/10 text-white" />
                            </div>
                        </div>

                        {/* Club & Sizes */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white border-l-4 border-purple-500 pl-3">{t('edit.other')}</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium text-zinc-400">{t('fields.club')}</label>
                                        <InfoTooltip text="Add meg az egyesületed nevét, ha tagja vagy valaminek." />
                                    </div>
                                    <Input {...register('clubName')} placeholder={t('fields.club')} className="bg-white/5 border-white/10 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">{t('fields.tshirt')}</label>
                                    <select
                                        {...register('tshirtSize')}
                                        className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                                    >
                                        <option value="" className="bg-zinc-900">Válassz méretet</option>
                                        <option value="Female / Női XXS" className="bg-zinc-900">Female / Női XXS</option>
                                        <option value="Female / Női XS" className="bg-zinc-900">Female / Női XS</option>
                                        <option value="Female / Női S" className="bg-zinc-900">Female / Női S</option>
                                        <option value="Female / Női M" className="bg-zinc-900">Female / Női M</option>
                                        <option value="Female / Női L" className="bg-zinc-900">Female / Női L</option>
                                        <option value="Female / Női XL" className="bg-zinc-900">Female / Női XL</option>
                                        <option value="Male / Férfi XS" className="bg-zinc-900">Male / Férfi XS</option>
                                        <option value="Male / Férfi S" className="bg-zinc-900">Male / Férfi S</option>
                                        <option value="Male / Férfi M" className="bg-zinc-900">Male / Férfi M</option>
                                        <option value="Male / Férfi L" className="bg-zinc-900">Male / Férfi L</option>
                                        <option value="Male / Férfi XL" className="bg-zinc-900">Male / Férfi XL</option>
                                        <option value="Male / Férfi XXL" className="bg-zinc-900">Male / Férfi XXL</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white border-l-4 border-red-500 pl-3">{t('edit.emergency')}</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">{t('fields.contactName')}</label>
                                    <Input {...register('emergencyContactName')} placeholder={t('fields.contactName')} className="bg-white/5 border-white/10 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">{t('fields.contactPhone')}</label>
                                    <Input {...register('emergencyContactPhone')} placeholder={t('fields.contactPhone')} className="bg-white/5 border-white/10 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Extra Info (Vegetarian, Five Trials) */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white border-l-4 border-yellow-500 pl-3">{t('edit.extras')}</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                                    <input
                                        type="checkbox"
                                        {...register('isVegetarian')}
                                        className="w-5 h-5 rounded border-zinc-600 bg-zinc-700 text-accent focus:ring-accent"
                                        id="isVegetarian"
                                    />
                                    <label htmlFor="isVegetarian" className="text-sm font-medium text-white cursor-pointer select-none">
                                        {t('fields.isVegetarian')}
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium text-zinc-400">{t('fields.fiveTrialsId')}</label>
                                        <InfoTooltip text="Ha regisztrált ötpróbázó vagy, itt add meg azonosítódat (p. 12345), hogy pontokat gyűjthess!" />
                                    </div>
                                    <Input {...register('fiveTrialsId')} placeholder={t('fields.fiveTrialsIdPlaceholder')} className="bg-white/5 border-white/10 text-white" />
                                    <p className="text-xs text-zinc-500">{t('fields.fiveTrialsIdDesc')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Team Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white border-l-4 border-cyan-500 pl-3">{t('edit.team')}</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">{t('fields.teamName')}</label>
                                    <Input {...register('teamName')} placeholder={t('fields.teamNamePlaceholder')} className="bg-white/5 border-white/10 text-white" />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm font-medium text-zinc-400">{t('fields.teamMembers')}</label>
                                            <InfoTooltip text="Itt előre megadhatod a csapattársaidat. Nevezéskor ezek a nevek automatikusan kitöltődnek, nem kell újra beírni őket." />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const currentMembers = watch('teamMembers') || [];
                                                // @ts-ignore - RHF array handling is tricky with basic register, simple append here
                                                setValue('teamMembers', [...currentMembers, '']);
                                            }}
                                            className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded hover:bg-cyan-500/20 transition-colors"
                                        >
                                            + {t('edit.addMember')}
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {(watch('teamMembers') || []).map((member, index) => (
                                            <div key={index} className="flex gap-2">
                                                <Input
                                                    {...register(`teamMembers.${index}`)}
                                                    placeholder={`${t('fields.teamMember')} ${index + 1}`}
                                                    className="bg-white/5 border-white/10 text-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const current = watch('teamMembers') || [];
                                                        setValue('teamMembers', current.filter((_, i) => i !== index));
                                                    }}
                                                    className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                        {(watch('teamMembers') || []).length === 0 && (
                                            <p className="text-sm text-zinc-500 italic">{t('fields.noTeamMembers')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Billing Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white border-l-4 border-emerald-500 pl-3">{t('edit.billing')}</h3>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setValue('billingName', `${watch('lastName')} ${watch('firstName')}`);
                                        setValue('billingZipCode', watch('zipCode'));
                                        setValue('billingCity', watch('city'));
                                        setValue('billingAddress', watch('street'));
                                    }}
                                    className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded hover:bg-emerald-500/20 transition-colors flex items-center gap-2"
                                >
                                    <Edit2 className="w-3 h-3" />
                                    {t('edit.copyAddress')}
                                </button>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-zinc-400">{t('fields.billingName')}</label>
                                    <InfoTooltip text="Kérjük, pontosan add meg a számlázási nevet és címet. A számla automatikusan erre a névre állítódik ki." />
                                </div>
                                <Input {...register('billingName')} placeholder={t('fields.billingNamePlaceholder')} className="bg-white/5 border-white/10 text-white" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">{t('fields.taxNumber')}</label>
                                <Input {...register('taxNumber')} placeholder={t('fields.taxNumberPlaceholder')} className="bg-white/5 border-white/10 text-white" />
                            </div>

                            <div className="grid grid-cols-[1fr_2fr] gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">{t('fields.zip')}</label>
                                    <Input {...register('billingZipCode')} placeholder="1234" className="bg-white/5 border-white/10 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">{t('fields.city')}</label>
                                    <Input {...register('billingCity')} placeholder={t('fields.city')} className="bg-white/5 border-white/10 text-white" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">{t('fields.street')}</label>
                                <Input {...register('billingAddress')} placeholder={t('fields.street')} className="bg-white/5 border-white/10 text-white" />
                            </div>
                        </div>

                        {/* Registration Date (Read Only) */}
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-indigo-400" />
                            <div>
                                <p className="text-xs text-indigo-300 font-medium uppercase tracking-wider">{t('fields.registrationDate')}</p>
                                <p className="text-white font-bold font-mono">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('hu-HU') : 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Footer / Actions */}
                        <div className="pt-6 border-t border-white/10 flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                disabled={isPending}
                            >
                                {t('edit.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                className="bg-accent hover:bg-accent/80 text-white font-bold"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {t('edit.saving')}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Save className="w-4 h-4" />
                                        {t('edit.save')}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
