'use client';

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function CartDrawer() {
    const { isOpen, closeCart, items, removeFromCart, total, updateQuantity } = useCart();
    const t = useTranslations('CartDrawer');

    // Prevent hydration issues by not rendering until mounted? 
    // Wait, the main logic handles isOpen state. CSS transition is better than unmounting.
    // However, simpler to just mount and translate.

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={closeCart}
            />

            {/* Slider Drawer */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-zinc-900 border-l border-zinc-800 z-[51] transform transition-transform duration-300 shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                        <h2 className="text-xl font-black uppercase italic text-white flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-accent" />
                            {t('title')}
                        </h2>
                        <button onClick={closeCart} className="text-gray-400 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Items */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {items.length === 0 ? (
                            <div className="text-center text-gray-500 py-10">
                                <p>{t('empty')}</p>
                                <Button onClick={closeCart} className="mt-4" variant="outline">{t('continue')}</Button>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div key={`${item.productId}-${item.size}`} className="flex gap-4 bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                                    {/* Image placeholder */}
                                    <div className="w-20 h-20 bg-zinc-700 rounded-md flex-shrink-0 overflow-hidden">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs text-center p-1">No Image</div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-white leading-tight">{item.name}</h3>
                                                {item.size && <span className="text-xs text-accent font-mono uppercase bg-accent/10 px-1 rounded mt-1 inline-block">{t('size')}: {item.size}</span>}
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.productId, item.size)}
                                                className="text-gray-500 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-end mt-4">
                                            <div className="flex items-center gap-2 bg-zinc-900 rounded border border-zinc-700 p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size)}
                                                    className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"
                                                >
                                                    -
                                                </button>
                                                <span className="w-6 text-center font-mono text-sm">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size)}
                                                    className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="font-bold text-accent font-mono">
                                                {(item.price * item.quantity).toLocaleString('hu-HU')} Ft
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="p-6 border-t border-zinc-800 bg-zinc-900">
                            <div className="flex justify-between items-center mb-4 text-lg font-bold">
                                <span className="text-gray-400 uppercase text-sm">{t('total')}</span>
                                <span className="font-mono text-white text-xl">{total.toLocaleString('hu-HU')} Ft</span>
                            </div>
                            <Link href="/boutique/checkout" onClick={closeCart}>
                                <Button className="w-full py-6 text-lg font-black uppercase tracking-widest bg-accent text-black hover:bg-white transition-all">
                                    {t('checkout')}
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
