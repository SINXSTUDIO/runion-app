import ProductForm from '@/components/shop/ProductForm';

export default function NewProductPage() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-white mb-6">Új Termék</h1>
            <ProductForm mode="create" />
        </div>
    );
}
