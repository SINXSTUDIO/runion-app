import { describe, it, expect, beforeEach, vi } from 'vitest';

// 1. Mock Prisma and other dependencies BEFORE imports
vi.mock('@/lib/prisma', () => {
    const mockPrismaClient = {
        product: {
            findMany: vi.fn(),
            update: vi.fn(),
        },
        order: {
            create: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        globalSettings: {
            findFirst: vi.fn(),
        },
    };
    return {
        prisma: mockPrismaClient,
        default: mockPrismaClient,
    };
});

vi.mock('@/auth', () => ({
    auth: vi.fn().mockResolvedValue(null), // Default to guest/no session
}));

vi.mock('@/lib/email', () => ({
    sendEmail: vi.fn().mockResolvedValue(true),
    generateShopOrderEmail: vi.fn().mockReturnValue('<p>Shop Order Email</p>'),
}));

vi.mock('@/lib/pdf-generator', () => ({
    generateShopProformaPDF: vi.fn().mockResolvedValue(Buffer.from('pdf-data')),
}));

vi.mock('@/actions/notifications', () => ({
    createNotification: vi.fn().mockResolvedValue(true),
}));

vi.mock('next-intl/server', () => ({
    getLocale: vi.fn().mockResolvedValue('hu'),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

// 2. Import elements AFTER mocks
import { createOrder } from '@/actions/shop';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { sendEmail } from '@/lib/email';

describe('createOrder - Webshop Cart, Stock & Shipping Logic', () => {
    const mockProduct1 = {
        id: 'prod-tshirt',
        name: 'RUNION Technikai Póló',
        nameEn: 'RUNION Technical T-shirt',
        nameDe: null,
        price: 8990,
        stock: 50,
        stockBreakdown: { 'S': 10, 'M': 20, 'L': 20 } as any,
    };

    const mockProduct2 = {
        id: 'prod-bottle',
        name: 'RUNION Kulacs',
        nameEn: 'RUNION Bottle',
        nameDe: null,
        price: 2990,
        stock: 100,
        stockBreakdown: null,
    };

    const mockGlobalSettings = {
        id: 'settings-1',
        shopEmail: 'shop@runion.eu',
        shopShippingCost: 1500,
        shopFreeShippingThreshold: 20000,
    };

    const mockOrderPayload = {
        billingName: 'Teszt Megrendelő',
        billingZip: '1111',
        billingCity: 'Budapest',
        billingAddress: 'Váci út 45.',
        billingTaxNumber: '',
        shippingName: 'Teszt Megrendelő',
        shippingZip: '1111',
        shippingCity: 'Budapest',
        shippingAddress: 'Váci út 45.',
        shippingPhone: '+36307654321',
        shippingEmail: 'customer@example.com',
        note: 'Ajándék csomagolást kérek.',
        items: [
            { productId: 'prod-tshirt', quantity: 2, price: 8990, size: 'M' }
        ],
        paymentMethod: 'BANK_TRANSFER',
        termsAccepted: true,
        privacyAccepted: true,
    };

    beforeEach(() => {
        process.env.EMAIL_HOST = 'smtp.example.com';
        vi.clearAllMocks();

        // Default mock behaviors
        (prisma.product.findMany as any).mockResolvedValue([mockProduct1, mockProduct2]);
        (prisma.globalSettings.findFirst as any).mockResolvedValue(mockGlobalSettings);
        (prisma.user.findUnique as any).mockResolvedValue(null); // Guest is standard

        (prisma.order.create as any).mockImplementation(({ data }: any) => Promise.resolve({
            id: 'order-new-uuid',
            orderNumber: data.orderNumber,
            userId: data.userId,
            status: data.status,
            totalAmount: data.totalAmount,
            billingName: data.billingName,
            shippingName: data.shippingName,
            shippingEmail: data.shippingEmail,
        }));

        (prisma.product.update as any).mockResolvedValue({ id: 'prod-updated' });
        (prisma.user.create as any).mockResolvedValue({ id: 'guest-user-1', email: 'customer@example.com' });
        (prisma.user.update as any).mockImplementation(({ where, data }: any) => Promise.resolve({ id: where.id, ...data }));
        (auth as any).mockResolvedValue(null);
    });

    it('should create order and deduct stock (both global and size breakdown) correctly', async () => {
        const formData = new FormData();
        formData.append('json', JSON.stringify(mockOrderPayload));

        const result = await createOrder(null, formData);

        expect(result.success).toBe(true);
        expect(result.orderId).toBe('order-new-uuid');

        // Verify global stock and size M stock deduction
        // Product 1 M stock was 20, global 50. Order quantity 2.
        // Expect: M stock -> 18, global -> 48
        expect(prisma.product.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'prod-tshirt' },
                data: expect.objectContaining({
                    stock: 48,
                    stockBreakdown: { 'S': 10, 'M': 18, 'L': 20 }
                })
            })
        );
    });

    it('should charge shipping fee if total amount is below free shipping threshold', async () => {
        // Total of 2 t-shirts: 17,980 Ft (below 20,000 threshold)
        const formData = new FormData();
        formData.append('json', JSON.stringify(mockOrderPayload));

        const result = await createOrder(null, formData);

        expect(result.success).toBe(true);
        // Total should be 17980 + 1500 shipping fee = 19480
        expect(prisma.order.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    totalAmount: 19480
                })
            })
        );
    });

    it('should apply free shipping if total amount is above free shipping threshold', async () => {
        // Total of 3 t-shirts: 26,970 Ft (above 20,000 threshold)
        const heavyPayload = {
            ...mockOrderPayload,
            items: [{ productId: 'prod-tshirt', quantity: 3, price: 8990, size: 'M' }]
        };
        const formData = new FormData();
        formData.append('json', JSON.stringify(heavyPayload));

        const result = await createOrder(null, formData);

        expect(result.success).toBe(true);
        // Total should be 26970 + 0 shipping fee = 26970
        expect(prisma.order.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    totalAmount: 26970
                })
            })
        );
    });

    it('should fail if requested size is out of stock', async () => {
        // Only 10 in S, but we order 11
        const overLimitPayload = {
            ...mockOrderPayload,
            items: [{ productId: 'prod-tshirt', quantity: 11, price: 8990, size: 'S' }]
        };
        const formData = new FormData();
        formData.append('json', JSON.stringify(overLimitPayload));

        const result = await createOrder(null, formData);

        expect(result.success).toBe(false);
        expect(result.message).toContain('nincs elegendő készlet');
    });

    it('should prevent guest checkout from modifying existing registered user profiles', async () => {
        const existingRegisteredUser = {
            id: 'registered-user-id',
            email: 'customer@example.com',
            firstName: 'Klára',
            lastName: 'Szabó',
            city: 'Debrecen',
            zipCode: '4000',
            address: 'Piac utca 12.',
            phoneNumber: '+36209999999'
        };

        // Guest checks out with this email (not logged in)
        (prisma.user.findUnique as any).mockResolvedValue(existingRegisteredUser);
        (auth as any).mockResolvedValue(null); // No active session

        const formData = new FormData();
        formData.append('json', JSON.stringify(mockOrderPayload));

        const result = await createOrder(null, formData);

        expect(result.success).toBe(true);

        // Verification: Ensure user profile UPDATE was NOT called, preserving original data
        expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should update user profile details if user is logged in', async () => {
        const loggedInUser = {
            id: 'logged-in-user-id',
            email: 'customer@example.com',
            firstName: 'Klára',
            lastName: 'Szabó',
            city: 'Debrecen',
            zipCode: '4000',
            address: 'Piac utca 12.',
            phoneNumber: '+36209999999'
        };

        (prisma.user.findUnique as any).mockResolvedValue(loggedInUser);
        (auth as any).mockResolvedValue({
            user: { id: 'logged-in-user-id', email: 'customer@example.com' }
        }); // Active session

        const formData = new FormData();
        formData.append('json', JSON.stringify(mockOrderPayload));

        const result = await createOrder(null, formData);

        expect(result.success).toBe(true);

        // Verification: Ensure user profile UPDATE WAS called to save new shipping details
        expect(prisma.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'logged-in-user-id' },
                data: expect.objectContaining({
                    city: 'Budapest',
                    zipCode: '1111',
                    address: 'Váci út 45.',
                    phoneNumber: '+36307654321',
                })
            })
        );
    });
});
