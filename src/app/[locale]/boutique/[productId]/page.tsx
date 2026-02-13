import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import ProductDetailClient from '@/components/shop/ProductDetailClient';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ProductPageProps {
    params: Promise<{
        locale: string;
        productId: string;
    }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { productId, locale } = await params;

    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product || !product.active) {
        notFound();
    }

    const t = {
        back: locale === 'hu' ? 'Vissza a butikba' : (locale === 'de' ? 'Zurück zum Shop' : 'Back to Boutique'),
        price: locale === 'hu' ? 'Ár' : (locale === 'de' ? 'Preis' : 'Price'),
    };

    // Localization
    const name = locale === 'en' ? (product.nameEn || product.name) : (locale === 'de' ? (product.nameDe || product.name) : product.name);
    const description = locale === 'en' ? (product.descriptionEn || product.description) : (locale === 'de' ? (product.descriptionDe || product.description) : product.description);

    return (
        <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <Link href="/boutique">
                        <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-accent">
                            <ArrowLeft className="w-4 h-4" />
                            {t.back}
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    {/* Image Section */}
                    <div className="relative aspect-square bg-zinc-900 rounded-2xl overflow-hidden border border-white/5">
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-zinc-700 bg-zinc-900">
                                <span className="text-6xl font-black opacity-20">RUNION</span>
                            </div>
                        )}
                        {/* Sold out overlay if totally out of stock */}
                        {product.stock <= 0 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                <span className="bg-red-500 text-white px-6 py-2 rounded-full font-bold transform -rotate-12 border-2 border-white shadow-xl">
                                    SOLD OUT
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col h-full">
                        <div className="mb-8">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-4 text-white">
                                {name}
                            </h1>
                            <div className="text-2xl md:text-3xl font-bold text-accent mb-6">
                                {Number(product.price).toLocaleString('hu-HU')} Ft
                            </div>

                            {/* Description with Size Chart handling (newlines) */}
                            <div className="prose prose-invert prose-zinc max-w-none mb-8 text-zinc-300 leading-relaxed overflow-x-auto">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        table: ({ node, ...props }) => <div className="overflow-x-auto my-6 rounded-lg border border-zinc-700"><table className="w-full text-sm text-left text-gray-300" {...props} /></div>,
                                        thead: ({ node, ...props }) => <thead className="text-xs uppercase bg-zinc-800 text-gray-200" {...props} />,
                                        tbody: ({ node, ...props }) => <tbody className="divide-y divide-zinc-700 bg-zinc-900/50" {...props} />,
                                        tr: ({ node, ...props }) => <tr className="hover:bg-zinc-800/50 transition-colors" {...props} />,
                                        th: ({ node, ...props }) => <th className="px-6 py-4 font-bold tracking-wider" {...props} />,
                                        td: ({ node, ...props }) => <td className="px-6 py-4 whitespace-nowrap" {...props} />,
                                        a: ({ node, ...props }) => <a className="text-accent hover:underline" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-4 space-y-1" {...props} />,
                                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-4 space-y-1" {...props} />
                                    }}
                                >
                                    {description || ''}
                                </ReactMarkdown>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <ProductDetailClient
                                product={{
                                    ...product,
                                    price: Number(product.price)
                                }}
                                locale={locale}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
