import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma module BEFORE imports
vi.mock('@/lib/prisma', () => {
    const mockProduct = {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
    };

    return {
        prisma: { product: mockProduct },
        default: { product: mockProduct },
    };
});

// Import AFTER mock
import { ProductRepository } from '@/lib/repositories/product-repository';
import { prisma } from '@/lib/prisma';
import { createMockProduct } from '../../setup/factories';

describe('ProductRepository', () => {
    let productRepository: ProductRepository;

    beforeEach(() => {
        productRepository = new ProductRepository();
        vi.clearAllMocks();
    });

    describe('getActiveProducts', () => {
        it('should return only active products ordered by creation date', async () => {
            const activeProducts = [
                createMockProduct({ active: true, name: 'Product A', stock: 10 }),
                createMockProduct({ active: true, name: 'Product B', stock: 5 }),
            ];
            (prisma.product.findMany as any).mockResolvedValue(activeProducts);

            const result = await productRepository.getActiveProducts();

            expect(result).toHaveLength(2);
            expect(result).toEqual(activeProducts);
            expect(prisma.product.findMany).toHaveBeenCalled();
            const callArgs = (prisma.product.findMany as any).mock.calls[0][0];
            expect(callArgs.where.active).toBe(true);
            expect(callArgs.orderBy.createdAt).toBe('desc');
        });

        it('should return empty array when no active products', async () => {
            (prisma.product.findMany as any).mockResolvedValue([]);

            const result = await productRepository.getActiveProducts();

            expect(result).toHaveLength(0);
        });
    });

    describe('getBySlug', () => {
        it('should return product by slug', async () => {
            const mockProduct = createMockProduct({ slug: 'test-product' });
            (prisma.product.findUnique as any).mockResolvedValue(mockProduct);

            const result = await productRepository.getBySlug('test-product');

            expect(result).toEqual(mockProduct);
            expect(prisma.product.findUnique).toHaveBeenCalledWith({
                where: { slug: 'test-product' },
            });
        });

        it('should return null when product not found', async () => {
            (prisma.product.findUnique as any).mockResolvedValue(null);

            const result = await productRepository.getBySlug('non-existent');

            expect(result).toBeNull();
        });
    });

    describe('decreaseStock', () => {
        it('should decrease product stock', async () => {
            const productId = 'test-product-id';
            const product = createMockProduct({ id: productId, stock: 10 });
            const updatedProduct = createMockProduct({ id: productId, stock: 5 });

            (prisma.product.findUnique as any).mockResolvedValue(product);
            (prisma.product.update as any).mockResolvedValue(updatedProduct);

            const result = await productRepository.decreaseStock(productId, 5);

            expect(result.stock).toBe(5);
            expect(prisma.product.findUnique).toHaveBeenCalled();
            expect(prisma.product.update).toHaveBeenCalledWith({
                where: { id: productId },
                data: { stock: 5 },
            });
        });

        it('should throw error when product not found', async () => {
            (prisma.product.findUnique as any).mockResolvedValue(null);

            await expect(
                productRepository.decreaseStock('non-existent', 5)
            ).rejects.toThrow('Product not found or stock not tracked');
        });

        it('should throw error when stock is null', async () => {
            const product = createMockProduct({ id: 'test-id', stock: null });
            (prisma.product.findUnique as any).mockResolvedValue(product);

            await expect(
                productRepository.decreaseStock('test-id', 5)
            ).rejects.toThrow('Product not found or stock not tracked');
        });
    });

    describe('Base CRUD operations', () => {
        describe('create', () => {
            it('should create new product', async () => {
                const newProduct = createMockProduct({ name: 'New Product' });
                (prisma.product.create as any).mockResolvedValue(newProduct);

                const productData = {
                    name: 'New Product',
                    slug: 'new-product',
                    description: 'Test description',
                    price: 5000,
                    active: true,
                    stock: 10,
                    images: ['image1.jpg'],
                };

                const result = await productRepository.create(productData as any);

                expect(result).toEqual(newProduct);
                expect(prisma.product.create).toHaveBeenCalledWith({
                    data: productData,
                });
            });
        });

        describe('update', () => {
            it('should update product', async () => {
                const productId = 'test-product-id';
                const updatedProduct = createMockProduct({
                    id: productId,
                    price: 6000
                });
                (prisma.product.update as any).mockResolvedValue(updatedProduct);

                const result = await productRepository.update(
                    { id: productId },
                    { price: 6000 } as any
                );

                expect(result.price).toBe(6000);
                expect(prisma.product.update).toHaveBeenCalledWith({
                    where: { id: productId },
                    data: { price: 6000 },
                });
            });
        });

        describe('delete', () => {
            it('should delete product', async () => {
                const productId = 'test-product-id';
                const deletedProduct = createMockProduct({ id: productId });
                (prisma.product.delete as any).mockResolvedValue(deletedProduct);

                const result = await productRepository.delete({ id: productId });

                expect(result).toEqual(deletedProduct);
                expect(prisma.product.delete).toHaveBeenCalledWith({
                    where: { id: productId },
                });
            });
        });

        describe('findById', () => {
            it('should find product by id', async () => {
                const productId = 'test-product-id';
                const mockProduct = createMockProduct({ id: productId });
                (prisma.product.findUnique as any).mockResolvedValue(mockProduct);

                const result = await productRepository.findById(productId);

                expect(result).toEqual(mockProduct);
                expect(prisma.product.findUnique).toHaveBeenCalledWith({
                    where: { id: productId },
                    include: undefined,
                });
            });
        });

        describe('count', () => {
            it('should count all products', async () => {
                (prisma.product.count as any).mockResolvedValue(10);

                const result = await productRepository.count();

                expect(result).toBe(10);
                expect(prisma.product.count).toHaveBeenCalledWith({
                    where: undefined,
                });
            });
        });
    });
});
