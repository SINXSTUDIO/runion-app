'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface ProductDetailClientProps {
    product: any; // Type Product
    locale: string;
}

export default function ProductDetailClient({ product, locale }: ProductDetailClientProps) {
    const { addToCart } = useCart();
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    const stockBreakdown = product.stockBreakdown as Record<string, number> | null;
    const hasSizes = stockBreakdown && Object.keys(stockBreakdown).length > 0;

    // Determine stock based on selection
    const currentStock = hasSizes
        ? (selectedSize ? (stockBreakdown[selectedSize] || 0) : 0)
        : product.stock;

    const isOutOfStock = currentStock <= 0;

    const handleAddToCart = () => {
        if (hasSizes && !selectedSize) {
            toast.error(locale === 'hu' ? 'Kérlek válassz méretet!' : (locale === 'de' ? 'Bitte Größe wählen!' : 'Please select a size!'));
            return;
        }

        addToCart({
            productId: product.id,
            name: product.name,
            price: Number(product.price),
            imageUrl: product.imageUrl,
            size: selectedSize || undefined,
            quantity: 1
        });
        toast.success(locale === 'hu' ? 'Kosárhoz adva' : (locale === 'de' ? 'In den Warenkorb gelegt' : 'Added to cart'));
    };

    // Labels
    const labels = {
        addToCart: locale === 'hu' ? 'Kosárba' : (locale === 'de' ? 'In den Warenkorb' : 'Add to Cart'),
        outOfStock: locale === 'hu' ? 'Elfogyott' : (locale === 'de' ? 'Ausverkauft' : 'Out of Stock'),
        sizes: locale === 'hu' ? 'Méretek' : (locale === 'de' ? 'Größen' : 'Sizes'),
        stock: locale === 'hu' ? 'Raktáron' : (locale === 'de' ? 'Auf Lager' : 'In Stock'),
        pieces: locale === 'hu' ? 'db' : (locale === 'de' ? 'Stk.' : 'pcs'),
    };

    return (
        <div className="space-y-6">
            {hasSizes && (
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-zinc-400 uppercase tracking-wider">{labels.sizes}</label>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(stockBreakdown).map(([size, stock]) => {
                            const isAvailable = stock > 0;
                            return (
                                <button
                                    key={size}
                                    onClick={() => isAvailable && setSelectedSize(size)}
                                    disabled={stock <= 0}
                                    className={`
                                        min-w-[3rem] h-10 px-3 rounded border text-sm font-medium transition-all
                                        ${selectedSize === size
                                            ? 'bg-white text-black border-white'
                                            : (isAvailable ? 'bg-zinc-900 text-white border-zinc-700 hover:border-zinc-500' : 'bg-zinc-900/50 text-zinc-600 border-zinc-800 cursor-not-allowed decoration-slice line-through')}
                                    `}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="pt-4 border-t border-white/5">
                <Button
                    size="lg"
                    className="w-full text-lg h-12"
                    onClick={handleAddToCart}
                    disabled={!!(isOutOfStock || (hasSizes && !selectedSize))}
                >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {isOutOfStock ? labels.outOfStock : labels.addToCart}
                </Button>

                {/* Stock info */}
                {!isOutOfStock && (hasSizes ? selectedSize : true) && (
                    <p className="text-center text-xs text-zinc-500 mt-2">
                        {labels.stock}: {currentStock} {labels.pieces}
                    </p>
                )}
            </div>
        </div>
    );
}
