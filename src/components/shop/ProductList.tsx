'use client';

import ProductCard from './ProductCard';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ProductList({ products, locale, shopEnabled }: { products: any[], locale: string, shopEnabled?: boolean }) {
    const t = useTranslations('ProductList');
    // Basic search filtering
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-accent to-primary rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900 text-white pl-12 pr-4 py-4 rounded-lg border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-accent placeholder:text-gray-600 font-medium"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} locale={locale} shopEnabled={shopEnabled} />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-gray-500 text-xl font-bold uppercase">{t('noResults')}</p>
                </div>
            )}
        </div>
    );
}
