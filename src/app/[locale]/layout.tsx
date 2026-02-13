import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Inter, Montserrat } from "next/font/google";
import Navbar from '@/components/Navbar';
// ...

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/shop/CartDrawer';
import { Toaster } from 'sonner';
import "../globals.css";
import ScrollToTop from '@/components/ui/ScrollToTop';

// Maintenance Imports
import { getSettings } from '@/actions/settings';
import { auth } from '@/auth';
import ComingSoon from '@/components/maintenance/ComingSoon';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const montserrat = Montserrat({
    variable: "--font-montserrat",
    subsets: ["latin"],
    weight: "900",
});

export const metadata = {
    title: "Runion - A futó közösség",
    description: "Nevezz a kedvenc versenyeidre egyszerűen.",
};

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    // Ensure that the incoming `locale` is valid
    const { locale } = await params;
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    // Enable static rendering
    setRequestLocale(locale);

    // Providing all messages to the client
    const messages = await getMessages();

    // ---------------------------------------------------------
    // Maintenance Mode Check
    // ---------------------------------------------------------    // Maintenance Mode Check
    const settings = await getSettings();

    if (settings?.maintenanceMode) {
        // 1. Check if exempt URL (Admin or Auth)
        const headersList = await headers();
        const pathname = headersList.get('x-pathname') || "";
        const isExempt = pathname.includes('/secretroom75') || pathname.includes('/api/auth');

        if (!isExempt) {
            // 2. Check if logged-in Admin
            const session = await auth();
            const isAdmin = session?.user?.role === 'ADMIN';

            if (!isAdmin) {
                // RENDER COMING SOON PAGE (Full Replacement)
                return (
                    <html lang={locale} suppressHydrationWarning>
                        <body className={`${inter.variable} ${montserrat.variable} antialiased bg-black text-white`}>
                            <NextIntlClientProvider messages={messages} locale={locale}>
                                <ComingSoon />
                            </NextIntlClientProvider>
                        </body>
                    </html>
                );
            }
        }
    }
    // ---------------------------------------------------------

    const session = await auth();
    let freshUser = session?.user;

    // Fetch fresh user data from DB to ensure Navbar (image, name) is always up to date
    if (session?.user?.email) {
        const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                image: true,
                firstName: true,
                lastName: true,
            }
        });

        if (dbUser) {
            freshUser = {
                ...session.user,
                image: dbUser.image || session.user.image,
                name: `${dbUser.lastName} ${dbUser.firstName}`,
            };
        }
    }

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className={`${inter.variable} ${montserrat.variable} antialiased flex flex-col min-h-screen bg-primary text-secondary`}>
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <CartProvider>
                        <Navbar user={freshUser} />
                        {/* <div className="bg-red-900 text-white p-2">NAVBAR DISABLED</div> */}
                        <main className="flex-grow">
                            {children}
                        </main>
                        <Footer />
                        <CookieConsent />
                        <CartDrawer />
                        <Toaster
                            richColors
                            closeButton
                            position="top-center"
                            theme="dark"
                            toastOptions={{
                                style: {
                                    background: '#18181b', // zinc-900
                                    border: '1px solid #22d3ee', // accent (cyan-400 equivalent for now, or use var(--color-accent))
                                    color: 'white',
                                },
                                classNames: {
                                    toast: 'bg-zinc-900 border-accent text-white font-sans',
                                    title: 'text-accent font-bold uppercase',
                                    description: 'text-zinc-400',
                                    actionButton: 'bg-accent text-black font-bold',
                                    cancelButton: 'bg-zinc-800 text-white',
                                    error: 'border-red-500 !bg-zinc-900 !text-red-500',
                                    success: 'border-green-500 !bg-zinc-900 !text-green-500',
                                    warning: 'border-yellow-500 !bg-zinc-900 !text-yellow-500',
                                    info: 'border-blue-500 !bg-zinc-900 !text-blue-500',
                                },
                            }}
                        />
                        <ScrollToTop />
                    </CartProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
