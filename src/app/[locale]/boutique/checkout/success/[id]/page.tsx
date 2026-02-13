
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { CheckCircle2, Landmark, Mail, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { getTranslations } from 'next-intl/server';

export default async function OrderSuccessPage({
    params
}: {
    params: Promise<{ id: string; locale: string }>;
}) {
    const { id } = await params;
    const t = await getTranslations('SuccessPage');

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        }
    });

    if (!order) {
        notFound();
    }

    return (
        <div className="min-h-screen pt-32 pb-20 bg-black text-white">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-accent/10 rounded-full mb-8 relative">
                        <div className="absolute inset-0 bg-accent rounded-full blur-2xl opacity-20 animate-pulse"></div>
                        <CheckCircle2 className="w-12 h-12 text-accent relative z-10" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">
                        {t.rich('thanks', {
                            span: (chunks) => <span className="text-accent underline decoration-4 underline-offset-8">{chunks}</span>
                        })}
                    </h1>
                    <p className="text-zinc-400 text-lg uppercase font-mono tracking-widest">
                        {t('orderNumber')}: <span className="text-white">{order.orderNumber}</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Next Steps Card */}
                    <div className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -mr-16 -mt-16"></div>

                        <h2 className="text-2xl font-black uppercase italic italic text-white mb-8 border-b border-white/5 pb-4 flex items-center gap-3">
                            <Landmark className="text-accent w-6 h-6" />
                            {t('paymentInfo')}
                        </h2>

                        <div className="space-y-8">
                            <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6">
                                <p className="text-sm text-zinc-400 uppercase font-mono mb-4 italic">{t('transferDesc')}</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{t('beneficiary')}</p>
                                        <p className="font-bold text-white uppercase italic">Balatonfüredi Atlétikai Club</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{t('accountNumber')}</p>
                                        <p className="font-mono text-accent text-lg">11748069-25512412</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{t('amount')}</p>
                                        <p className="font-black text-2xl text-white italic">{Number(order.totalAmount).toLocaleString('hu-HU')} Ft</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest underline decoration-accent">{t('reference')} ({t('important')})</p>
                                        <p className="font-mono text-white bg-white/10 px-3 py-1 rounded inline-block">{order.orderNumber}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 bg-zinc-800/50 rounded-2xl border border-white/5 items-start">
                                <Mail className="text-accent w-5 h-5 mt-1 shrink-0" />
                                <div className="text-sm text-zinc-400 leading-relaxed uppercase font-mono text-[11px]">
                                    {t('emailSent', { email: order.shippingEmail })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Details Mini Summary */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-8">
                        <h3 className="text-lg font-black uppercase italic mb-6">{t('orderedProducts')}</h3>
                        <div className="space-y-4">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-bold text-white text-sm uppercase">{item.product.name}</p>
                                        <p className="text-[10px] text-zinc-500 font-mono italic">{item.size ? `${item.size} | ` : ''} {item.quantity} DB</p>
                                    </div>
                                    <p className="font-mono text-sm text-accent">{(Number(item.price) * item.quantity).toLocaleString('hu-HU')} FT</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <Link href="/boutique">
                            <Button variant="ghost" className="w-full sm:w-auto py-6 px-10 border-white/10 hover:bg-white/5 uppercase font-bold italic tracking-widest">
                                <ShoppingBag className="w-5 h-5 mr-3" />
                                {t('backToBoutique')}
                            </Button>
                        </Link>
                        <Link href="/">
                            <Button className="w-full sm:w-auto py-6 px-10 bg-white text-black hover:bg-zinc-200 uppercase font-bold italic tracking-widest shadow-xl">
                                {t('home')}
                                <ArrowRight className="w-5 h-5 ml-3" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
