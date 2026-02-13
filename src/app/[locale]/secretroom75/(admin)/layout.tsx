import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import SecretHeader from '@/components/secretroom75/SecretHeader';
import AdminSidebar from '@/components/secretroom75/AdminSidebar';

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
        <div className="secret-layout min-h-screen bg-black flex">
            <AdminSidebar />
            {/* <div className="w-64 bg-red-900/20 text-white p-4">SIDEBAR DISABLED</div> */}
            <div className="flex-1 flex flex-col min-w-0">
                <SecretHeader />
                {/* <div className="p-4 bg-red-900/50 text-white">SecretHeader DISABLED</div> */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
