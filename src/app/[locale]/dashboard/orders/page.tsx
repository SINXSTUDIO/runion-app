import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { FileText, ShoppingBag } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function DashboardOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await auth();
    const t = await getTranslations('Dashboard.Orders');

    if (!session?.user) redirect(`/${locale}/login`);

    const orders = await prisma.order.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        include: { items: true }
    });

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                <h1 className="text-3xl font-black italic text-white flex items-center gap-3">
                    <ShoppingBag className="w-8 h-8 text-purple-400" />
                    {t('title')}
                </h1>
                <p className="text-zinc-400 mt-2">
                    {t('subtitle')}
                </p>
            </div>

            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                {orders.length === 0 ? (
                    <div className="p-12 text-center text-zinc-500">
                        <p className="mb-4">{t('empty')}</p>
                        <Link href={`/${locale}/boutique`}>
                            <Button variant="outline">{t('goToStore')}</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-zinc-400 text-sm uppercase">
                                <tr>
                                    <th className="p-6">{t('table.orderNumber')}</th>
                                    <th className="p-6">{t('table.date')}</th>
                                    <th className="p-6">{t('table.items')}</th>
                                    <th className="p-6">{t('table.amount')}</th>
                                    <th className="p-6">{t('table.status')}</th>
                                    <th className="p-6 text-right">{t('table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-zinc-300">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-6 font-mono font-bold text-white">{order.orderNumber}</td>
                                        <td className="p-6">
                                            {new Date(order.createdAt).toLocaleDateString(locale)}
                                        </td>
                                        <td className="p-6">
                                            <span className="text-sm">
                                                {t('itemCount', { count: order.items.length })}
                                            </span>
                                        </td>
                                        <td className="p-6 font-bold text-white">
                                            {Number(order.totalAmount).toLocaleString(locale)} Ft
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.status === 'PAID' ? 'bg-green-500/20 text-green-400' :
                                                order.status === 'SHIPPED' ? 'bg-blue-500/20 text-blue-400' :
                                                    order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {/* Use raw status as fallback if key missing, or ensure all keys exist */}
                                                {t.has(`status.${order.status.toLowerCase()}`)
                                                    ? t(`status.${order.status.toLowerCase()}`)
                                                    : order.status}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <Link href={`/invoices/${order.id}`} target="_blank">
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    <FileText className="w-4 h-4" /> {t('invoice')}
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
