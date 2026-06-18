import { describe, it, expect, beforeEach, vi } from 'vitest';

// 1. Mock Prisma and other dependencies BEFORE imports
vi.mock('@/lib/prisma', () => {
    const mockPrismaClient = {
        distance: {
            findUnique: vi.fn(),
        },
        registration: {
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
        },
    };
    return {
        prisma: mockPrismaClient,
        default: mockPrismaClient,
    };
});

vi.mock('@/lib/auth-checks', () => ({
    requireUser: vi.fn(),
}));

vi.mock('@/lib/mutex', () => ({
    registrationMutex: {
        acquire: vi.fn().mockResolvedValue(() => {}), // release function
    },
}));

vi.mock('@/lib/rate-limit', () => ({
    checkRateLimit: vi.fn().mockResolvedValue({ success: true }),
    registrationRateLimit: {},
}));

vi.mock('@/lib/email', () => ({
    sendEmail: vi.fn().mockResolvedValue(true),
    REG_EMAIL_TRANSLATIONS: {
        hu: { subject: 'Visszaigazolás', preview: 'Előnézet', free: 'Ingyenes' },
        en: { subject: 'Confirmation', preview: 'Preview', free: 'Free' },
    },
    generateRegistrationEmailHtml: vi.fn().mockReturnValue('<p>Email</p>'),
    generateNotificationEmailHtml: vi.fn().mockReturnValue('<p>Admin Email</p>'),
}));

vi.mock('@/lib/pdf-generator', () => ({
    generateProformaPDF: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
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
import { submitRegistration } from '@/actions/registration';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth-checks';
import { sendEmail } from '@/lib/email';
import { generateProformaPDF } from '@/lib/pdf-generator';

describe('submitRegistration - Pricing & Currency Logic', () => {
    const mockUser = {
        id: 'user-1',
        email: 'runner@example.com',
        firstName: 'Gábor',
        lastName: 'Kovács',
        membershipTier: null,
        zipCode: '1111',
        city: 'Budapest',
        address: 'Fő utca 1.',
    };

    const mockSellerHuf = {
        id: 'seller-huf',
        name: 'RUNION HU Kft',
        bank: 'OTP Bank',
        account: '11700000-11111111-22222222',
        taxNumber: '12345678-2-42',
    };

    const mockSellerEur = {
        id: 'seller-eur',
        name: 'RUNION EU SRL',
        bank: 'Revolut',
        iban: 'HU99REVO1234567890',
        swift: 'REVOHU2X',
        taxNumber: 'EU123456789',
    };

    const mockEvent = {
        id: 'event-1',
        title: 'Runion Balaton 2026',
        slug: 'runion-balaton-2026',
        eventDate: new Date('2026-08-20T10:00:00Z'),
        seller: mockSellerHuf,
        sellerEuro: mockSellerEur,
        notificationEmail: 'organizer@runion.eu',
    };

    const mockDistance = {
        id: 'dist-21k',
        eventId: 'event-1',
        name: '21K Félmaraton',
        price: 15000,
        priceEur: 45,
        capacityLimit: 500,
        _count: { registrations: 120 },
        priceTiers: [],
        event: mockEvent,
    };

    beforeEach(() => {
        process.env.EMAIL_HOST = 'smtp.example.com';
        vi.clearAllMocks();
        // Setup defaults
        (requireUser as any).mockResolvedValue(mockUser);
        (prisma.user.findUnique as any).mockResolvedValue(mockUser);
        (prisma.distance.findUnique as any).mockResolvedValue(mockDistance);
        (prisma.registration.findFirst as any).mockResolvedValue(null); // No double reg

        (prisma.registration.create as any).mockImplementation(({ data }: any) => Promise.resolve({
            id: 'reg-new-uuid',
            userId: data.userId,
            distanceId: data.distanceId,
            registrationStatus: data.registrationStatus,
            formData: data.formData,
            extras: data.extras,
            crewSize: data.crewSize,
            finalPrice: data.finalPrice,
            distance: mockDistance,
            user: mockUser,
            createdAt: new Date(),
        }));

        (prisma.registration.update as any).mockImplementation(({ data }: any) => Promise.resolve({
            id: 'reg-new-uuid',
            ...data,
            distance: mockDistance,
            user: mockUser,
        }));
    });

    it('should create registration and send email/PDF with HUF settings for standard user', async () => {
        const formData = { firstName: 'Gábor', lastName: 'Kovács', phone: '06301234567' };
        const billingData = {
            billingName: 'Kovács Gábor',
            billingZip: '8000',
            billingCity: 'Székesfehérvár',
            billingAddress: 'Fő utca 12.',
            billingTaxNumber: '',
        };

        const result = await submitRegistration(
            'event-1',
            'user-1',
            'dist-21k',
            formData,
            billingData,
            [],
            undefined,
            true,
            true,
            true
        );

        expect(result.success).toBe(true);
        expect(result.registrationId).toBe('reg-new-uuid');

        // Check if price was standard
        expect(prisma.registration.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    finalPrice: 15000,
                }),
            })
        );

        // Verify PDF was generated using Hungarian Seller
        expect(generateProformaPDF).toHaveBeenCalledWith(
            expect.any(Object),
            expect.any(Object),
            expect.any(Object),
            mockSellerHuf, // HUF seller
            'hu'
        );

        // Verify email was sent
        expect(sendEmail).toHaveBeenCalled();
    });

    it('should apply percentage membership discount correctly', async () => {
        const vipUser = {
            ...mockUser,
            membershipTier: {
                name: 'Gold Runner',
                discountPercentage: 20, // 20% discount
                discountAmount: 0,
            },
        };
        (prisma.user.findUnique as any).mockResolvedValue(vipUser);

        const result = await submitRegistration(
            'event-1',
            'user-1',
            'dist-21k',
            { phone: '06301234567' },
            null,
            [],
            undefined,
            true,
            true,
            true
        );

        expect(result.success).toBe(true);
        // 15000 * 0.8 = 12000
        expect(prisma.registration.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    finalPrice: 12000,
                }),
            })
        );
    });

    it('should apply fixed-amount membership discount correctly', async () => {
        const vipUser = {
            ...mockUser,
            membershipTier: {
                name: 'Gold Runner',
                discountPercentage: 0,
                discountAmount: 3000, // 3000 Ft discount
            },
        };
        (prisma.user.findUnique as any).mockResolvedValue(vipUser);

        const result = await submitRegistration(
            'event-1',
            'user-1',
            'dist-21k',
            { phone: '06301234567' },
            null,
            [],
            undefined,
            true,
            true,
            true
        );

        expect(result.success).toBe(true);
        // 15000 - 3000 = 12000
        expect(prisma.registration.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    finalPrice: 12000,
                }),
            })
        );
    });

    it('should prevent double registration for the same distance', async () => {
        // Mock existing registration
        (prisma.registration.findFirst as any).mockResolvedValue({ id: 'existing-reg' });

        const result = await submitRegistration(
            'event-1',
            'user-1',
            'dist-21k',
            { phone: '06301234567' },
            null,
            [],
            undefined,
            true,
            true,
            true
        );

        expect(result.success).toBe(false);
        expect(result.error).toBe('Már neveztél erre a távra!');
    });

    it('should handle crew pricing (EUR based sávos árazás) and split beneficiary (sellerEuro) correctly', async () => {
        // Enable crewPricing on the distance
        const crewDistance = {
            ...mockDistance,
            crewPricing: {
                '3': 35, // 3-person team: 35 EUR / person
                '5': 30, // 5-person team: 30 EUR / person
            },
        };
        (prisma.distance.findUnique as any).mockResolvedValue(crewDistance);

        // Standard HUF price is 15000, but isCrewPricing is active
        const result = await submitRegistration(
            'event-1',
            'user-1',
            'dist-21k',
            { phone: '06301234567' },
            null,
            [],
            3, // crew size
            true,
            true,
            true
        );

        expect(result.success).toBe(true);

        // Check if finalPrice was calculated based on crewPricing (35 EUR)
        expect(prisma.registration.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    finalPrice: 35,
                    crewSize: 3,
                }),
            })
        );

        // Verify PDF was generated using Euro Seller (split beneficiary logic)
        expect(generateProformaPDF).toHaveBeenCalledWith(
            expect.any(Object),
            expect.any(Object),
            expect.any(Object),
            mockSellerEur, // Must use mockSellerEur instead of mockSellerHuf
            'hu'
        );
    });

    it('should validate relaxed international billing info (foreign zip & VAT)', async () => {
        const formData = { firstName: 'John', lastName: 'Doe', phone: '0049176123456' };
        const billingData = {
            billingName: 'John Doe Ltd.',
            billingZip: 'D-80331', // Foreign zip (alphanumeric, contains dash)
            billingCity: 'München',
            billingAddress: 'Marienplatz 1.',
            billingTaxNumber: 'DE123456789', // Foreign VAT number (letters + digits)
        };

        const result = await submitRegistration(
            'event-1',
            'user-1',
            'dist-21k',
            formData,
            billingData,
            [],
            undefined,
            true,
            true,
            true
        );

        expect(result.success).toBe(true);
        expect(prisma.registration.create).toHaveBeenCalled();
    });

    it('should fail if legal consents are not accepted', async () => {
        const formData = { firstName: 'Gábor', lastName: 'Kovács', phone: '06301234567' };
        const billingData = {
            billingName: 'Kovács Gábor',
            billingZip: '8000',
            billingCity: 'Székesfehérvár',
            billingAddress: 'Fő utca 12.',
            billingTaxNumber: '',
        };

        const result = await submitRegistration(
            'event-1',
            'user-1',
            'dist-21k',
            formData,
            billingData,
            [],
            undefined,
            false, // termsAccepted
            true,  // privacyAccepted
            true   // liabilityAccepted
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain('el kell fogadnod az ÁSZF-et');
    });

    it('should fail if billingData is missing and user has no address in profile', async () => {
        // Mock user without any address or billing address
        const userNoAddress = {
            id: 'user-1',
            email: 'runner@example.com',
            firstName: 'Gábor',
            lastName: 'Kovács',
            membershipTier: null,
            zipCode: null,
            city: null,
            address: null,
            billingZipCode: null,
            billingCity: null,
            billingAddress: null,
        };
        (prisma.user.findUnique as any).mockResolvedValue(userNoAddress);

        const result = await submitRegistration(
            'event-1',
            'user-1',
            'dist-21k',
            { phone: '06301234567' },
            null, // No explicit billingData
            [],
            undefined,
            true,
            true,
            true
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain('Számlázási adatok megadása kötelező');
    });
});
