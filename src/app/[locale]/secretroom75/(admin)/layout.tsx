import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminLayoutClient from '@/components/secretroom75/AdminLayoutClient';

export default async function AdminLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const session = await auth();
    const { locale } = await params;

    if (!session?.user) {
        redirect(`/${locale}/secretroom75/login`);
    }

    const role = (session.user as any).role;
    if (role !== 'ADMIN' && role !== 'STAFF') {
        redirect(`/${locale}/login`);
    }

    return (
        <AdminLayoutClient>
            {children}
        </AdminLayoutClient>
    );
}
