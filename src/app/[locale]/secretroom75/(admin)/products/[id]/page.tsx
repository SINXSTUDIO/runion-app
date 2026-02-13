import prisma from '@/lib/prisma';
import ProductForm from '@/components/shop/ProductForm';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await prisma.product.findUnique({
        where: { id }
    });

    if (!product) notFound();

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-white mb-6">Termék Szerkesztése</h1>
            <ProductForm mode="edit" product={product} />
        </div>
    );
}
