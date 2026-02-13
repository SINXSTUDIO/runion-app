import prisma from '@/lib/prisma';
import { Package } from 'lucide-react';
import OrderActions from '@/components/secretroom75/OrderActions';
import OrdersToolbar from '@/components/secretroom75/OrdersToolbar';

export default async function AdminOrdersPage() {
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
                Orders
            </h1>

            <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/5">
                    <OrdersToolbar />
                </div>
                <table className="w-full text-left">
                    <thead className="bg-white/5 uppercase text-xs text-gray-500 font-bold">
                        <tr>
                            <th className="p-4">Order #</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Items</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Payment</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {orders.map((order: any) => (
                            <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-mono text-accent">{order.orderNumber}</td>
                                <td className="p-4 text-sm text-gray-400">
                                    {new Date(order.createdAt).toLocaleDateString('hu-HU')}
                                </td>
                                <td className="p-4">
                                    <div className="font-bold">{order.shippingName}</div>
                                    <div className="text-xs text-gray-500">{order.shippingEmail}</div>
                                </td>
                                <td className="p-4 text-sm">
                                    {order.items.length} items
                                </td>
                                <td className="p-4 font-bold">
                                    {order.totalAmount.toLocaleString('hu-HU')} Ft
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
