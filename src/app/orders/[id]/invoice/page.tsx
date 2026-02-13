import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import PrintButton from '@/components/ui/PrintButton';

interface OrderInvoicePageProps {
    params: Promise<{ id: string }>;
}

export default async function OrderInvoicePage(props: OrderInvoicePageProps) {
    const params = await props.params;
    const { id } = params;

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            user: true,
            items: {
                include: {
                    product: true
                }
            }
        },
    });

    if (!order) notFound();

    const isPaid = order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'COMPLETED';
    const docTitle = isPaid ? 'Számla / Nyugta' : 'Díjbekérő';
    const paymentMethodLabel = 'Banki Átutalás'; // We enforce this for now

    // Order number is used as Doc Number
    const docNumber = order.orderNumber;

    const date = format(order.createdAt, 'yyyy. MMMM d.', { locale: hu });
    const dueDate = isPaid ? date : format(new Date(order.createdAt.getTime() + 8 * 24 * 60 * 60 * 1000), 'yyyy. MMMM d.', { locale: hu });

    // Billing info (or fallback to User address if fields are empty - though schema makes them required in Order)
    const billingName = order.billingName || `${order.user.lastName} ${order.user.firstName}`;
    const billingZip = order.billingZip || order.user.zipCode;
    const billingCity = order.billingCity || order.user.city;
    const billingAddress = order.billingAddress || order.user.address;

    return (
        <div className="min-h-screen bg-white text-black p-8 md:p-16 font-sans print:p-0 print:m-0 print:bg-white print:text-black">
            <div className="max-w-3xl mx-auto border border-gray-200 p-8 shadow-2xl print:shadow-none print:border-none print:w-full print:max-w-none">
                {/* Header */}
                <div className="flex justify-between items-start mb-12 border-b-4 border-black pb-8">
                    <div>
                        <div className="text-4xl font-black italic tracking-tighter mb-2">
                            RUN<span className="text-cyan-600">ION</span>
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Official Store</p>
                    </div>
                    <div className="text-right">
                        <h1 className="text-3xl font-bold uppercase mb-2">{docTitle}</h1>
                        <p className="text-gray-600 font-mono">#{docNumber}</p>
                        {isPaid && <p className="text-green-600 font-bold uppercase text-sm mt-1">Pénzügyileg Rendezve</p>}
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <h3 className="font-bold uppercase text-xs text-gray-400 mb-2">Kiállító (Szolgáltató)</h3>
                        <p className="font-bold">Runion Szervezőiroda</p>
                        <p>1234 Budapest, Futó utca 1.</p>
                        <p>Adószám: 12345678-1-42</p>
                        <p>Bank: 11700000-00000000</p>
                        <p>Email: hello@runion.eu</p>
                    </div>
                    <div>
                        <h3 className="font-bold uppercase text-xs text-gray-400 mb-2">Vevő</h3>
                        <p className="font-bold">{billingName}</p>
                        <p>{billingZip} {billingCity}</p>
                        <p>{billingAddress}</p>
                        {order.billingTaxNumber && <p>Adószám: {order.billingTaxNumber}</p>}
                    </div>
                </div>

                {/* Dates & Method */}
                <div className="grid grid-cols-3 gap-8 mb-12 bg-gray-50 p-4 rounded print:bg-transparent print:p-0 print:border-y print:border-gray-200">
                    <div>
                        <span className="block text-xs uppercase text-gray-400 font-bold">Kiállítás Dátuma</span>
                        <span className="font-mono font-bold">{date}</span>
                    </div>
                    <div>
                        <span className="block text-xs uppercase text-gray-400 font-bold">Fizetési Határidő</span>
                        <span className="font-mono font-bold text-black">{dueDate}</span>
                    </div>
                    <div>
                        <span className="block text-xs uppercase text-gray-400 font-bold">Fizetési Mód</span>
                        <span className="font-mono font-bold">{paymentMethodLabel}</span>
                    </div>
                </div>

                {/* Items */}
                <table className="w-full mb-12">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="text-left py-2 font-black uppercase text-sm">Megnevezés</th>
                            <th className="text-center py-2 font-black uppercase text-sm">Mennyiség</th>
                            <th className="text-right py-2 font-black uppercase text-sm">Egységár</th>
                            <th className="text-right py-2 font-black uppercase text-sm">Összesen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item) => (
                            <tr key={item.id} className="border-b border-gray-200">
                                <td className="py-4">
                                    <span className="block font-bold">{item.product.name}</span>
                                    {item.size && <span className="text-xs text-gray-500 uppercase">Méret: {item.size}</span>}
                                </td>
                                <td className="py-4 text-center font-mono">
                                    {item.quantity} db
                                </td>
                                <td className="py-4 text-right font-mono text-sm text-gray-600">
                                    {Number(item.price).toLocaleString('hu-HU')} Ft
                                </td>
                                <td className="py-4 text-right font-mono font-bold">
                                    {Number(Number(item.price) * item.quantity).toLocaleString('hu-HU')} Ft
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={3} className="pt-4 text-right font-black uppercase text-xl">
                                {isPaid ? 'Fizetve:' : 'Fizetendő Összesen:'}
                            </td>
                            <td className="pt-4 text-right font-black text-xl text-cyan-600">
                                {Number(order.totalAmount).toLocaleString('hu-HU')} Ft
                            </td>
                        </tr>
                    </tfoot>
                </table>

                {/* Footer / Notes */}
                <div className="text-sm text-gray-500 border-t border-gray-200 pt-8">
                    {!isPaid && (
                        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded">
                            <p className="mb-2"><span className="font-bold text-black">Utalási Információk:</span></p>
                            <p>Kedvezményezett: <span className="font-bold text-black">Runion Szervezőiroda</span></p>
                            <p>Számlaszám: <span className="font-bold text-black font-mono">11700000-00000000</span></p>
                            <p>Közlemény: <span className="font-bold text-black font-mono">{docNumber}</span></p>
                            <p className="mt-2 text-xs italic text-red-500">Fontos: Kérjük a közlemény rovatban pontosan tüntesse fel a bizonylatszámot!</p>
                        </div>
                    )}
                    <p>Köszönjük a rendelést! A termékek szállításáról emailben tájékoztatjuk.</p>
                </div>

                <PrintButton />
            </div>
        </div>
    );
}
