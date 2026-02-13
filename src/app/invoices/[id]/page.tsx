
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import PrintButton from '@/components/ui/PrintButton';

interface InvoicePageProps {
    params: Promise<{ id: string }>;
}

export default async function InvoicePage(props: InvoicePageProps) {
    const params = await props.params;
    const { id } = params;

    let registration = await prisma.registration.findUnique({
        where: { id },
        include: {
            user: true,
            distance: {
                include: {
                    event: true
                }
            },
        },
    });

    // If no registration, check for Order
    let order: any = null;
    if (!registration) {
        order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
    }

    if (!registration && !order) notFound();

    const isPaid = registration ? registration.paymentStatus === 'PAID' : (order?.status === 'PAID');
    const docTitle = isPaid ? 'Számla / Nyugta' : 'Díjbekérő';
    const paymentMethodLabel = 'Átutalás';
    const globalSettings = await prisma.globalSettings.findFirst();

    // Determine Data Source
    let userDetails, items, totalAmount, docNumber, issuerDetails;

    const date = format(new Date(), 'yyyy. MMMM d.', { locale: hu });
    // For paid items, due date is not really needed, or is same as invoice date
    const dueDateLabel = isPaid ? 'Fizetés Ídéje' : 'Fizetési Határidő';
    const dueDate = isPaid ? date : format(new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), 'yyyy. MMMM d.', { locale: hu });

    if (registration) {
        const { user, distance } = registration;
        userDetails = {
            name: `${user.firstName} ${user.lastName}`,
            city: user.city,
            zip: user.zipCode,
            address: user.address,
            phone: user.phoneNumber
        };
        items = [{
            name: `${distance.event.title} - Nevezési díj`,
            desc: distance.name,
            price: Number(distance.price)
        }];
        totalAmount = Number(distance.price);
        docNumber = `${isPaid ? 'NY' : 'DB'} -${id.substring(0, 8).toUpperCase()} `;

        issuerDetails = (
            <div>
                <h3 className="font-bold uppercase text-xs text-gray-400 mb-2">Kiállító (Szolgáltató)</h3>
                <p className="font-bold">Runion Szervezőiroda</p>
                <p>1234 Budapest, Futó utca 1.</p>
                <p>Adószám: 12345678-1-42</p>
                <p>Bank: 11700000-00000000</p>
                <p>Email: hello@runion.eu</p>
            </div>
        );
    } else if (order) {
        userDetails = {
            name: order.billingName || order.shippingName,
            city: order.billingCity || order.shippingCity,
            zip: order.billingZip || order.shippingZip,
            address: order.billingAddress || order.shippingAddress,
            phone: order.shippingPhone, // Usually phone is in shipping
            taxNumber: order.billingTaxNumber
        };

        // Calculate items
        items = order.items.map((item: any) => ({
            name: item.product.name,
            desc: item.size ? `Méret: ${item.size}` : '',
            price: Number(item.price) * item.quantity // Line total
        }));

        // Check if shipping needed
        const itemsTotal = items.reduce((sum: number, i: any) => sum + i.price, 0);
        const orderTotal = Number(order.totalAmount);
        if (orderTotal > itemsTotal) {
            items.push({
                name: 'Szállítási költség',
                desc: 'Házhozszállítás',
                price: orderTotal - itemsTotal
            });
        }

        totalAmount = orderTotal;
        docNumber = `${order.orderNumber}`;

        const shopName = globalSettings?.shopBeneficiaryName || 'Runion Webshop';
        const shopAddress = globalSettings?.shopAddress || '1234 Budapest, Shop utca 1.'; // Fallback if not set
        const shopTax = globalSettings?.shopTaxNumber || '87654321-2-11';
        const shopBank = globalSettings?.shopBankName || 'OTP Bank';
        const shopAccount = globalSettings?.shopBankAccountNumber || '11700000-00000000';
        const shopEmail = globalSettings?.shopEmail || 'shop@runion.eu';

        issuerDetails = (
            <div>
                <h3 className="font-bold uppercase text-xs text-gray-400 mb-2">Kiállító (Szolgáltató)</h3>
                <p className="font-bold">{shopName}</p>
                <p>{shopAddress}</p>
                <p>Adószám: {shopTax}</p>
                <p>Bank: {shopBank}</p>
                <p>{shopAccount}</p>
                <p>Email: {shopEmail}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-black p-8 md:p-16 font-sans print:p-0 print:m-0 print:bg-white print:text-black">
            <div className="max-w-3xl mx-auto border border-gray-200 p-8 shadow-2xl print:shadow-none print:border-none print:w-full print:max-w-none">
                {/* Header */}
                <div className="flex justify-between items-start mb-12 border-b-4 border-black pb-8">
                    <div>
                        <div className="text-4xl font-black italic tracking-tighter mb-2">
                            RUN<span className="text-cyan-600">ION</span>
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
                            {order ? 'Webshop Order' : 'Event Management'}
                        </p>
                    </div>
                    <div className="text-right">
                        <h1 className="text-3xl font-bold uppercase mb-2">{docTitle}</h1>
                        <p className="text-gray-600 font-mono">#{docNumber}</p>
                        {isPaid && <p className="text-green-600 font-bold uppercase text-sm mt-1">Pénzügyileg Rendezve</p>}
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    {issuerDetails}
                    <div>
                        <h3 className="font-bold uppercase text-xs text-gray-400 mb-2">Vevő (Megrendelő)</h3>
                        <p className="font-bold">{userDetails?.name}</p>
                        <p>{userDetails?.zip} {userDetails?.city}</p>
                        <p>{userDetails?.address}</p>
                        <p>{userDetails?.phone}</p>
                        {userDetails?.taxNumber && <p>Adószám: {userDetails.taxNumber}</p>}
                    </div>
                </div>

                {/* Dates & Method */}
                <div className="grid grid-cols-3 gap-8 mb-12 bg-gray-50 p-4 rounded print:bg-transparent print:p-0 print:border-y print:border-gray-200">
                    <div>
                        <span className="block text-xs uppercase text-gray-400 font-bold">Kiállítás Dátuma</span>
                        <span className="font-mono font-bold">{date}</span>
                    </div>
                    <div>
                        <span className="block text-xs uppercase text-gray-400 font-bold">{dueDateLabel}</span>
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
                            <th className="text-right py-2 font-black uppercase text-sm">Ár</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items?.map((item: any, idx: number) => (
                            <tr key={idx} className="border-b border-gray-200">
                                <td className="py-4">
                                    <span className="block font-bold">{item.name}</span>
                                    <span className="block text-sm text-gray-500">{item.desc}</span>
                                </td>
                                <td className="py-4 text-right font-mono font-bold">
                                    {item.price.toLocaleString('hu-HU')} Ft
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td className="pt-4 text-right font-black uppercase text-xl">
                                {isPaid ? 'Fizetve:' : 'Fizetendő Összesen:'}
                            </td>
                            <td className="pt-4 text-right font-black text-xl text-cyan-600">
                                {totalAmount?.toLocaleString('hu-HU')} Ft
                            </td>
                        </tr>
                    </tfoot>
                </table>

                {/* Footer / Notes */}
                <div className="text-sm text-gray-500 border-t border-gray-200 pt-8">
                    {isPaid ? (
                        <p className="mb-2 font-bold text-green-600">Sikeres Fizetés.</p>
                    ) : (
                        <p className="mb-2"><span className="font-bold">Megjegyzés:</span> A közlemény rovatban kérjük tüntesse fel a hivatkozási számot: <span className="font-mono font-bold text-black">{docNumber}</span></p>
                    )}
                    {order?.note && (
                        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
                            <p className="text-xs font-bold uppercase text-gray-400 mb-1">Vevői Megjegyzés:</p>
                            <p className="italic text-black">{order.note}</p>
                        </div>
                    )}
                    <p>Köszönjük a {order ? 'rendelést' : 'nevezést'}! {order ? 'Hamarosan küldjük a csomagot.' : 'Találkozunk a versenyen.'}</p>
                </div>

                <PrintButton />
            </div>
        </div>
    );
}
