import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import CheckoutForm from '@/components/shop/CheckoutForm';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

export default async function CheckoutPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    // Check Authentication
    const session = await auth();

    // We want to encourage login but not force it? 
    // Plan: If not logged in, user can fill form.
    // If logged in, pre-fill form.

    let defaultValues = {
        name: '',
        email: '',
        city: '',
        zipCode: '',
        address: '',
        phone: '',
        taxNumber: '',
        billingName: '',
        billingZip: '',
        billingCity: '',
        billingAddress: '',
    };

    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });
        if (user) {
            defaultValues = {
                name: `${user.lastName} ${user.firstName}`.trim() || user.firstName || '',
                email: user.email || '',
                city: user.city || '',
                zipCode: user.zipCode || '',
                address: user.address || '',
                phone: user.phoneNumber || '',
                // Billing Mapping
                billingName: user.billingName || '',
                taxNumber: user.taxNumber || '',
                billingZip: user.billingZipCode || '',
                billingCity: user.billingCity || '',
                billingAddress: user.billingAddress || '',
            };
        }
    }

    const { locale } = await params;
    const t = await getTranslations('CheckoutPage');
    const settings = await prisma.globalSettings.findFirst();

    return (
        <div className="min-h-screen pt-24 pb-16 bg-black text-white">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header Section */}
                <div className="mb-12 relative overflow-hidden">
                    <div className="absolute top-1/2 left-0 w-12 h-px bg-accent/50 hidden md:block"></div>
                    <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter md:pl-16">
                        Pénztár <span className="text-accent underline decoration-4 underline-offset-8">Checkout</span>
                    </h1>
                </div>

                <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                    <CheckoutForm defaultValues={defaultValues} locale={locale} settings={settings} />
                </div>
            </div>
        </div>
    );
}
