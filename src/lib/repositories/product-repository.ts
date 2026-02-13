import { BaseRepository } from './base/base-repository';
import { Product, Prisma } from '@prisma/client';

export class ProductRepository extends BaseRepository<
    Product,
    Prisma.ProductCreateInput,
    Prisma.ProductUpdateInput,
    Prisma.ProductWhereUniqueInput
> {
    protected modelName = 'Product' as Prisma.ModelName;

    /**
     * Get active products
     */
    async getActiveProducts() {
        return this.findMany({
            where: { active: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get product by slug
     */
    async getBySlug(slug: string) {
        return this.findUnique({ slug });
    }

    /**
     * Decrease stock
     */
    async decreaseStock(id: string, quantity: number) {
        const product = await this.findById(id);
        if (!product || product.stock === null) {
            throw new Error('Product not found or stock not tracked');
        }

        return this.update(
            { id },
            { stock: product.stock - quantity }
        );
    }
}
