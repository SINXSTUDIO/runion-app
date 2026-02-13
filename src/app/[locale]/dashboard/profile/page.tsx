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
                <div className="flex gap-4">
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
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative">
                <div className="absolute top-6 right-6 z-10">
                    <FeedbackModal>
                        <button className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all text-white font-bold backdrop-blur-md shadow-lg group">
                            <MessageSquarePlus className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                            <span>Visszajelzés</span>
                        </button>
                    </FeedbackModal>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                    {/* Avatar */}
                    <div className="relative">
                        {image ? (
                            <Image
                                src={image}
                                alt={`${lastName} ${firstName}`}
                                width={120}
                                height={120}
                                className="rounded-full border-4 border-accent shadow-2xl shadow-accent/20"
                            />
                        ) : (
                            <div className="w-30 h-30 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-4xl font-black border-4 border-accent shadow-2xl shadow-accent/20">
                                {lastName?.[0]?.toUpperCase() || 'F'}
                            </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 p-2 bg-green-500 border-4 border-zinc-900 rounded-full">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl font-black text-white mb-2">{`${lastName} ${firstName}`}</h2>
                        <p className="text-zinc-400 mb-4">{email}</p>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            <span className="px-3 py-1 bg-accent/20 text-accent border border-accent/30 rounded-full text-sm font-bold">
                                {roleName}
                            </span>
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-sm font-bold">
                                {t('status.active')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl">
                                <Mail className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 font-medium">{t('fields.email')}</p>
                                <p className="text-white font-bold">{email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-emerald-500/10 rounded-xl">
                                <Phone className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 font-medium">{t('fields.phone')}</p>
                                <p className="text-white font-bold">{phoneNumber || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-purple-500/10 rounded-xl">
                                <Calendar className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 font-medium">{t('fields.birthDate')}</p>
                                <p className="text-white font-bold">
                                    {formattedBirthDate}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-amber-500/10 rounded-xl">
                                <MapPin className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 font-medium">{t('fields.zip')} / {t('fields.city')}</p>
                                <p className="text-white font-bold">
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
