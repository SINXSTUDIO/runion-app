import prisma from '@/lib/prisma';
import { Package } from 'lucide-react';
import OrderActions from '@/components/secretroom75/OrderActions';
import OrdersToolbar from '@/components/secretroom75/OrdersToolbar';
import { getTranslations } from 'next-intl/server';

export default async function AdminOrdersPage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Admin.Orders' });

    // Fetch all orders
    const rawOrders = await (prisma as any).order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: true, items: true }
    });

    // Serialize Decimals to Numbers for client component compatibility
    const orders = rawOrders.map((order: any) => ({
        ...order,
        totalAmount: Number(order.totalAmount),
        items: order.items.map((item: any) => ({
            ...item,
            price: Number(item.price)
        }))
    }));

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500 container mx-auto px-4 max-w-7xl py-8 text-white">
            <h1 className="text-3xl font-black italic uppercase mb-8 flex items-center gap-3">
                <Package className="w-8 h-8 text-accent" />
                {t('title')}
            </h1>

            <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/5">
                    <OrdersToolbar />
                </div>
                <table className="w-full text-left">
                    <thead className="bg-white/5 uppercase text-xs text-gray-500 font-bold">
                        <tr>
                            <th className="p-4">{t('table.orderNum')}</th>
                            <th className="p-4">{t('table.date')}</th>
                            <th className="p-4">{t('table.customer')}</th>
                            <th className="p-4">{t('table.items')}</th>
                            <th className="p-4">{t('table.total')}</th>
                            <th className="p-4">{t('table.status')}</th>
                            <th className="p-4">{t('table.payment')}</th>
                            <th className="p-4">{t('table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="p-8 text-center text-gray-500">
                                    {t('noOrders')}
                                </td>
                            </tr>
                        ) : (
                            orders.map((order: any) => (
                                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-mono text-accent">{order.orderNumber}</td>
                                    <td className="p-4 text-sm text-gray-400">
                                        {new Date(order.createdAt).toLocaleDateString(locale === 'hu' ? 'hu-HU' : locale === 'de' ? 'de-DE' : 'en-US')}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold">{order.shippingName}</div>
                                        <div className="text-xs text-gray-500">{order.shippingEmail}</div>
                                    </td>
                                    <td className="p-4 text-sm">
                                        {t('itemsCount', { count: order.items.length })}
                                    </td>
                                    <td className="p-4 font-bold">
                                        {order.totalAmount.toLocaleString(locale === 'hu' ? 'hu-HU' : locale === 'de' ? 'de-DE' : 'en-US')} {locale === 'hu' ? 'Ft' : 'HUF'}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.status === 'PAID' ? 'bg-green-500/20 text-green-400' :
                                            order.status === 'SHIPPED' ? 'bg-blue-500/20 text-blue-400' :
                                                order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">
                                        {order.paymentMethod}
                                    </td>
                                    <td className="p-4">
                                        <OrderActions order={order} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
