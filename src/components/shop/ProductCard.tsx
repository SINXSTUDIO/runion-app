'use client';

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function ProductCard({ product, locale, shopEnabled }: { product: any, locale: string, shopEnabled?: boolean }) {
    const { addToCart } = useCart();
    const t = useTranslations('ProductCard');
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [isAdded, setIsAdded] = useState(false);

    // Parse sizes
    const sizes = product.sizes ? product.sizes.split(',').map((s: string) => s.trim()) : [];

    // Select first size by default if available
    if (sizes.length > 0 && !selectedSize) {
        setSelectedSize(sizes[0]);
    }

    const handleAddToCart = () => {
        addToCart({
            productId: product.id,
            name: product.name, // Should use localized name if available (product.nameEn??)
            price: Number(product.price),
            quantity: 1,
            size: selectedSize || undefined,
            imageUrl: product.imageUrl || undefined
        });

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    // Localization helper
    const name = locale === 'en' ? (product.nameEn || product.name) : (locale === 'de' ? (product.nameDe || product.name) : product.name);
    // Helper to strip markdown for preview
    const stripMarkdown = (text: string | null | undefined) => {
        if (!text) return '';

        // Remove Size Chart headers (e.g. ### Mérettáblázat, ### Férfi Mérettáblázat)
        let cleanText = text.replace(/###\s*.*?(Mérettáblázat|Size Chart|Größentabelle).*?(\r?\n|$)/gi, '');

        // Remove Markdown tables (lines starting and ending with | or containing multiple |)
        // This regex matches a line that has at least one | and looks like a table row
        cleanText = cleanText.replace(/^\s*\|.*\|.*$/gm, '');

        return cleanText
            .replace(/#{1,6}\s/g, '') // remove remaining headers
            .replace(/(\*\*|__)(.*?)\1/g, '$2') // remove bold
            .replace(/(\*|_)(.*?)\1/g, '$2') // remove italic
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // remove links
            .replace(/`{3}[\s\S]*?`{3}/g, '') // remove code blocks
            .replace(/`(.+?)`/g, '$1') // remove inline code
            .replace(/\|/g, '') // remove stray pipes
            .replace(/-{3,}/g, '') // remove table separators
            .replace(/\n/g, ' ') // replace newlines with space
            .trim();
    };

    const rawDescription = locale === 'en' ? (product.descriptionEn || product.description) : (locale === 'de' ? (product.descriptionDe || product.description) : product.description);
    const description = stripMarkdown(rawDescription);

    // Helper for price formatting (assuming it's available or will be added)
    const formatPrice = (price: number) => {
        return Number(price).toLocaleString('hu-HU') + ' Ft';
    };

    return (
        <div className="group relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-accent/50 transition-all duration-300 flex flex-col h-full">
            {/* Image Area */}
            <Link href={`/boutique/${product.id}`} className="block relative aspect-square overflow-hidden bg-zinc-800">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-700">
                        <span className="text-4xl font-black opacity-20">RUNION</span>
                    </div>
                )}

                {/* Overlay Badge */}
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur px-3 py-1 rounded-full text-white font-mono font-bold border border-white/10">
                    {Number(product.price).toLocaleString('hu-HU')} Ft
                </div>

                {/* Out of stock badge */}
                {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                        <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold transform -rotate-12 border border-white shadow-lg">
                            ELFOGYOTT
                        </span>
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="p-3 md:p-6 flex-1 flex flex-col">
                <Link href={`/boutique/${product.id}`} className="hover:text-accent transition-colors">
                    <h3 className="text-sm md:text-xl font-black uppercase italic text-white mb-1 md:mb-2 leading-tight group-hover:text-accent transition-colors line-clamp-2">
                        {name}
                    </h3>
                </Link>
                <p className="text-gray-400 text-sm mb-6 flex-1 line-clamp-3">
                    {description}
                </p>

                {/* Size Selector */}
                {sizes.length > 0 && (
                    <div className="mb-6">
                        <span className="text-xs uppercase text-gray-500 font-bold mb-2 block">{t('size')}</span>
                        <div className="flex flex-wrap gap-2">
                            {sizes.map((size: string) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`px-3 py-1 text-sm font-bold border rounded transition-all ${selectedSize === size
                                        ? 'bg-white text-black border-white'
                                        : 'bg-transparent text-gray-400 border-zinc-700 hover:border-gray-500'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                {shopEnabled !== false && product.stock > 0 ? (
                    <Button
                        onClick={handleAddToCart}
                        disabled={isAdded}
                        className={`w-full py-4 text-base font-bold uppercase tracking-widest transition-all ${isAdded ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-black'
                            }`}
                    >
                        {isAdded ? (
                            <span className="flex items-center gap-2 justify-center">
                                <Check className="w-5 h-5" /> {t('added')}
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 justify-center">
                                <ShoppingCart className="w-5 h-5" /> {t('addToCart')}
                            </span>
                        )}
                    </Button>
                ) : (
                    <div className="w-full py-4 text-base font-bold uppercase tracking-widest text-center text-zinc-500 border-2 border-zinc-800 rounded-md cursor-not-allowed opacity-75">
                        {product.stock <= 0 ? "Jelenleg nem elérhető" : "Showcase Only"}
                    </div>
                )}
            </div>
        </div>
    );
}
