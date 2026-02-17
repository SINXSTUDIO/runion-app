import RegistrationWizard from '@/components/registration/RegistrationWizard';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth'; // Adjust import path for Auth
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { serializeData } from '@/lib/utils/serialization';
import { getTranslations } from 'next-intl/server';

export default async function RegisterPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { slug, locale } = await params;
    const session = await auth();

    // Check Auth
    if (!session?.user) {
        redirect(`/${locale}/login?callbackUrl=/${locale}/races/${slug}/register`);
    }

    // Fetch Full User Data for prefilling
    const fullUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            // name: true, // Removed to avoid TS error, derived from first/last
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            birthDate: true,
            gender: true,
            clubName: true,
            city: true,
            zipCode: true,
            address: true,
            image: true,
            emergencyContactPhone: true,
            membershipTier: true,
            tshirtSize: true,
            isVegetarian: true,
            fiveTrialsId: true,
            teamName: true,
            billingName: true,
            taxNumber: true,
            billingZipCode: true,
            billingCity: true,
            billingAddress: true,
            teamMembers: true // Added for pre-filling team members
        }
    });

    // Fetch Event
    const rawEvent = await prisma.event.findUnique({
        where: { slug },
        include: {
            distances: {
                include: { _count: { select: { registrations: true } } }
            },
            seller: true,
            sellerEuro: true // Added for split beneficiary
        }
    });

    if (!rawEvent) notFound();
    const event = serializeData(rawEvent);

    // Fetch translations
    const t = await getTranslations('Registration');

    // Parse Form Config
    const formConfig = (event.formConfig as any)?.fields || [];

    return (
        <div className="min-h-screen bg-black text-white pt-28 pb-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-black font-heading uppercase mb-4">
                        <span className="text-accent">{t('pageTitle', { eventName: (event as any).name })}</span>
                    </h1>
                    <p className="text-zinc-500">{t('fillDetails')}</p>
                </div>

                <RegistrationWizard
                    event={event}
                    user={fullUser ? serializeData(fullUser) : session.user}
                    formConfig={formConfig}
                />
            </div>
        </div>
    );
}
