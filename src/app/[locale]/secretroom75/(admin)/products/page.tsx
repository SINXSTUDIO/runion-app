import prisma from '@/lib/prisma';
import { ShoppingBag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/routing';

export default async function AdminProductsPage() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500 container mx-auto px-4 max-w-7xl py-8 text-white">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black italic uppercase flex items-center gap-3">
                    <ShoppingBag className="w-8 h-8 text-accent" />
                    Products
                </h1>
                <Link href="/secretroom75/products/new">
                    <Button className="gap-2 bg-accent text-black hover:bg-white">
                        <Plus className="w-4 h-4" /> Add Product
                    </Button>
                </Link>
            </div>

            <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 uppercase text-xs text-gray-500 font-bold">
                        <tr>
                            <th className="p-4">Image</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Active</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    No products found.
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded object-cover bg-zinc-800" />
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center text-xs text-gray-500">Img</div>
                                        )}
                                    </td>
                                    <td className="p-4 font-bold">{product.name}</td>
                                    <td className="p-4 font-mono text-accent">{Number(product.price).toLocaleString('hu-HU')} Ft</td>
                                    <td className="p-4">
                                        {product.active ? (
                                            <span className="text-green-500 font-bold text-xs uppercase">Active</span>
                                        ) : (
                                            <span className="text-red-500 font-bold text-xs uppercase">Inactive</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link href={`/secretroom75/products/${product.id}`}>
                                            <Button variant="outline" size="sm">Edit</Button>
                                        </Link>
                                    </td>

                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
