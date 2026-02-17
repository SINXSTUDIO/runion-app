import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { User, Mail, Phone, MapPin, Calendar, Shield, MessageSquarePlus } from 'lucide-react';
import Image from 'next/image';
import ProfileEditForm from '@/components/dashboard/ProfileEditForm';
import LogoutButton from '@/components/dashboard/LogoutButton';
import DeleteAccountButton from '@/components/dashboard/DeleteAccountButton';
import { getTranslations, getLocale } from 'next-intl/server';
import prisma from '@/lib/prisma';
import { FeedbackModal } from '@/components/dashboard/FeedbackModal';

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await auth();
    const t = await getTranslations('Profile');

    if (!session?.user) {
        redirect(`/${locale}/login`);
    }

    const { email: sessionEmail, id: sessionId } = session.user as any;

    const user = await prisma.user.findUnique({
        where: sessionId ? { id: sessionId } : { email: sessionEmail }
    });

    if (!user) {
        redirect(`/${locale}/login`);
    }

    // Destructure for easier access and to avoid possibly null errors
    const {
        lastName,
        firstName,
        email,
        role,
        birthDate,
        createdAt,
        image,
        phoneNumber,
        city,
        zipCode,
        clubName,
        tshirtSize
    } = user;

    const roleName = role === 'ADMIN'
        ? t('roles.admin')
        : role === 'STAFF'
            ? t('roles.staff')
            : t('roles.runner');

    const formattedBirthDate = birthDate
        ? new Date(birthDate).toLocaleDateString(locale)
        : 'N/A';

    const formattedRegistrationDate = createdAt
        ? new Date(createdAt).toLocaleDateString(locale)
        : 'N/A';

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black italic text-white mb-2 flex items-center gap-3">
                        <User className="w-8 h-8 text-accent" />
                        {t('title')}
                    </h1>
                    <p className="text-zinc-400">{t('subtitle')}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                    <LogoutButton />

                    <ProfileEditForm user={{
                        ...user,
                        firstName: user.firstName || null,
                        lastName: user.lastName || null,
                        email: user.email || null,
                        phoneNumber: user.phoneNumber || null,
                        clubName: user.clubName || null,
                        tshirtSize: user.tshirtSize || null,
                        createdAt: user.createdAt.toISOString(),
                        birthDate: user.birthDate ? user.birthDate.toISOString() : null
                    }} />
                </div>
            </div>

            {/* Profile Card */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm relative flex flex-col items-center md:items-stretch">

                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-8 w-full">
                    {/* Avatar & Feedback Button Container */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            {image ? (
                                <Image
                                    src={image}
                                    alt={`${lastName} ${firstName}`}
                                    width={100}
                                    height={100}
                                    className="rounded-full border-4 border-accent shadow-2xl shadow-accent/20 object-cover md:w-[120px] md:h-[120px]"
                                />

                            ) : (
                                <div className="w-24 h-24 md:w-30 md:h-30 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-3xl md:text-4xl font-black border-4 border-accent shadow-2xl shadow-accent/20">
                                    {lastName?.[0]?.toUpperCase() || 'F'}
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2 p-1.5 md:p-2 bg-green-500 border-4 border-zinc-900 rounded-full">
                                <Shield className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            </div>
                        </div>

                        {/* Feedback Button - Mobile: Below Avatar, Desktop: Top Right (via absolute) */}
                        <div className="md:absolute md:top-6 md:right-6 md:z-10">
                            <FeedbackModal>
                                <button className="flex items-center gap-2 px-6 py-2 md:px-4 md:py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all text-white font-bold backdrop-blur-md shadow-lg group text-sm md:text-base">
                                    <MessageSquarePlus className="w-4 h-4 md:w-5 md:h-5 text-accent group-hover:scale-110 transition-transform" />
                                    <span>Visszajelzés</span>
                                </button>
                            </FeedbackModal>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl md:text-3xl font-black text-white mb-2">{`${lastName} ${firstName}`}</h2>
                        <p className="text-zinc-400 mb-4 text-sm md:text-base break-all">{email}</p>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            <span className="px-3 py-1 bg-accent/20 text-accent border border-accent/30 rounded-full text-xs md:text-sm font-bold">
                                {roleName}
                            </span>
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs md:text-sm font-bold">
                                {t('status.active')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 overflow-hidden">
                        <div className="flex items-center gap-3">
                            <div className="p-2 md:p-3 bg-blue-500/10 rounded-xl shrink-0">
                                <Mail className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] md:text-xs text-zinc-500 font-medium">{t('fields.email')}</p>
                                <p className="text-white font-bold text-sm md:text-base truncate">{email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 overflow-hidden">
                        <div className="flex items-center gap-3">
                            <div className="p-2 md:p-3 bg-emerald-500/10 rounded-xl shrink-0">
                                <Phone className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] md:text-xs text-zinc-500 font-medium">{t('fields.phone')}</p>
                                <p className="text-white font-bold text-sm md:text-base truncate">{phoneNumber || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 overflow-hidden">
                        <div className="flex items-center gap-3">
                            <div className="p-2 md:p-3 bg-purple-500/10 rounded-xl shrink-0">
                                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] md:text-xs text-zinc-500 font-medium">{t('fields.birthDate')}</p>
                                <p className="text-white font-bold text-sm md:text-base truncate">
                                    {formattedBirthDate}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 overflow-hidden">
                        <div className="flex items-center gap-3">
                            <div className="p-2 md:p-3 bg-amber-500/10 rounded-xl shrink-0">
                                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] md:text-xs text-zinc-500 font-medium">{t('fields.zip')} / {t('fields.city')}</p>
                                <p className="text-white font-bold text-sm md:text-base truncate">
                                    {city && zipCode
                                        ? `${zipCode} ${city}`
                                        : 'N/A'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-4">{t('edit.other')}</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-zinc-500 mb-1">{t('fields.club')}</p>
                        <p className="text-white font-medium">{clubName || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-zinc-500 mb-1">{t('fields.tshirt')}</p>
                        <p className="text-white font-medium">{tshirtSize || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-zinc-500 mb-1">{t('fields.registrationDate')}</p>
                        <p className="text-white font-medium">
                            {formattedRegistrationDate}
                        </p>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <DeleteAccountButton />
        </div >
    );
}
