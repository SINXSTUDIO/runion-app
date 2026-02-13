'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth-checks';
import { z } from 'zod';
import { auth } from '@/auth';
import { generateShopOrderEmail } from '@/lib/email';
import { customAlphabet } from 'nanoid';
import { getLocale } from 'next-intl/server';
import { createNotification } from './notifications';
import { generateMembershipOrderEmailHtml, generateMembershipActivationEmailHtml, getMembershipEmailSubject } from '@/templates/emails/membership';
import { generateShopProformaPDF, generateShopInvoicePDF } from '@/lib/pdf-generator';

const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

// --- CRUD Schemas & Actions ---

import { MembershipSchema } from '@/lib/schemas';

// --- CRUD Schemas & Actions ---

export async function ensureDefaultTiers() {
    const tiers = [
        { name: 'Standard', nameEn: 'Standard', nameDe: 'Standard', price: 0, durationMonths: 1200, description: 'Automatikus Standard Tagság' },
        { name: 'Bronz', nameEn: 'Bronze', nameDe: 'Bronze', price: 0, durationMonths: 12, description: 'Bronz Tagság' },
        { name: 'Ezüst', nameEn: 'Silver', nameDe: 'Silber', price: 0, durationMonths: 12, description: 'Ezüst Tagság' },
        { name: 'Arany', nameEn: 'Gold', nameDe: 'Gold', price: 0, durationMonths: 12, description: 'Arany Tagság' }
    ];

    for (const t of tiers) {
        const existing = await prisma.membershipTier.findUnique({ where: { name: t.name } });
        if (!existing) {
            await prisma.membershipTier.create({
                data: {
                    name: t.name,
                    nameEn: t.nameEn,
                    nameDe: t.nameDe,
                    price: t.price,
                    durationMonths: t.durationMonths,
                    description: t.description,
                    discountPercentage: 0,
                    discountAmount: 0
                }
            });
        }
    }
}

export async function getMembershipTiers() {
    // Public access for reading (used in dashboard)
    await ensureDefaultTiers();

    return await prisma.membershipTier.findMany({
        orderBy: { price: 'asc' },
        include: { _count: { select: { users: true } } }
    });
}

export async function createMembershipTier(data: any) {
    await requireAdmin();
    const validated = MembershipSchema.safeParse(data);
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    try {
        await prisma.membershipTier.create({
            data: {
                name: validated.data.name,
                nameEn: validated.data.nameEn,
                nameDe: validated.data.nameDe,
                description: validated.data.description,
                descriptionEn: validated.data.descriptionEn,
                descriptionDe: validated.data.descriptionDe,
                features: validated.data.features,
                featuresEn: validated.data.featuresEn,
                featuresDe: validated.data.featuresDe,
                discountPercentage: validated.data.discountPercentage,
                discountAmount: validated.data.discountAmount,
                price: validated.data.price,
                durationMonths: validated.data.durationMonths
            } as any
        });
        revalidatePath('/secretroom75/memberships');
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Hiba történt a létrehozáskor (lehet, hogy a név már létezik)' };
    }
}

export async function updateMembershipTier(id: string, data: any) {
    await requireAdmin();
    const validated = MembershipSchema.safeParse(data);
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    try {
        await prisma.membershipTier.update({
            where: { id },
            data: {
                name: validated.data.name,
                nameEn: validated.data.nameEn,
                nameDe: validated.data.nameDe,
                description: validated.data.description,
                descriptionEn: validated.data.descriptionEn,
                descriptionDe: validated.data.descriptionDe,
                features: validated.data.features,
                featuresEn: validated.data.featuresEn,
                featuresDe: validated.data.featuresDe,
                discountPercentage: validated.data.discountPercentage,
                discountAmount: validated.data.discountAmount,
                price: validated.data.price,
                durationMonths: validated.data.durationMonths
            } as any
        });
        revalidatePath('/secretroom75/memberships');
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Hiba történt a frissítéskor' };
    }
}

export async function deleteMembershipTier(id: string) {
    await requireAdmin();

    // Check usage
    const usage = await prisma.user.count({ where: { membershipTierId: id } });
    if (usage > 0) {
        return { success: false, error: 'Nem törölhető: felhasználók vannak ehhez a tagsághoz rendelve.' };
    }

    try {
        await prisma.membershipTier.delete({ where: { id } });
        revalidatePath('/secretroom75/memberships');
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Hiba a törléskor' };
    }
}

// --- Purchase & Import Actions ---

const PurchaseMembershipSchema = z.object({
    billingName: z.string().min(2),
    billingZip: z.string().min(4),
    billingCity: z.string().min(2),
    billingAddress: z.string().min(5),
    billingTaxNumber: z.string().optional(),
    sellerId: z.string().optional(),
});

export async function purchaseMembership(tierId: string, billingData: any) {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: 'Bejelentkezés szükséges.' };
    }

    const validated = PurchaseMembershipSchema.safeParse(billingData);
    if (!validated.success) {
        return { success: false, error: 'Hiányos számlázási adatok.' };
    }

    const tier = await prisma.membershipTier.findUnique({ where: { id: tierId } });
    if (!tier) {
        return { success: false, error: 'Érvénytelen tagsági szint.' };
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { success: false, error: 'Felhasználó nem található.' };

    try {
        // 1. Find or Create Hidden Product for Membership
        const productSlug = `membership-${tier.id}`;
        let product = await prisma.product.findUnique({ where: { slug: productSlug } });

        if (!product) {
            product = await prisma.product.create({
                data: {
                    name: `Tagság: ${tier.name}`,
                    slug: productSlug,
                    price: tier.price,
                    active: false, // Hidden from webshop
                    category: 'SERVICE',
                    description: `Automata tagság termék: ${tier.name}`
                }
            });
        } else {
            if (Number(product.price) !== Number(tier.price)) {
                await prisma.product.update({
                    where: { id: product.id },
                    data: { price: tier.price, name: `Tagság: ${tier.name}` }
                });
            }
        }

        // 2. Create Order
        const orderNumber = `MEM-${new Date().getFullYear()}-${nanoid()}`;
        const locale = await getLocale();

        await prisma.user.update({
            where: { id: user.id },
            data: {
                billingName: validated.data.billingName,
                billingZipCode: validated.data.billingZip,
                billingCity: validated.data.billingCity,
                billingAddress: validated.data.billingAddress,
                taxNumber: validated.data.billingTaxNumber
            }
        });

        const grandTotal = Number(tier.price);

        const order = await prisma.order.create({
            data: {
                orderNumber,
                userId: user.id,
                status: 'PENDING',
                paymentMethod: 'BANK_TRANSFER',
                totalAmount: grandTotal,
                billingName: validated.data.billingName,
                billingZip: validated.data.billingZip,
                billingCity: validated.data.billingCity,
                billingAddress: validated.data.billingAddress,
                billingTaxNumber: validated.data.billingTaxNumber,
                shippingName: validated.data.billingName,
                shippingZip: validated.data.billingZip,
                shippingCity: validated.data.billingCity,
                shippingAddress: validated.data.billingAddress,
                shippingPhone: user.phoneNumber || '',
                shippingEmail: user.email,
                items: {
                    create: [{
                        productId: product.id,
                        quantity: 1,
                        price: tier.price,
                        size: 'MEMBERSHIP'
                    }]
                }
            },
            include: { items: true, user: true }
        });

        // 3. Generate Proforma & Email
        const globalSettings = await prisma.globalSettings.findFirst();

        let pdfSettings: any = globalSettings;
        // Check for Admin-configured Membership Seller
        if (globalSettings?.membershipSellerId) {
            const seller = await prisma.seller.findUnique({ where: { id: globalSettings.membershipSellerId } });
            if (seller) {
                pdfSettings = {
                    ...globalSettings, // Fallback for unrelated settings
                    shopBeneficiaryName: seller.name,
                    shopBankName: seller.bankName,
                    shopBankAccountNumber: seller.bankAccountNumber,
                    shopAddress: seller.address,
                    shopTaxNumber: seller.taxNumber,
                    shopEmail: seller.email,
                    shopNote: globalSettings?.shopNote // Keep global note as fallback/default since Seller has no note
                };
            }
        }

        const emailItems = [{
            ...order.items[0],
            productName: product.name,
            productId: product.id,
            quantity: 1,
            price: Number(tier.price),
            size: 'MEMBERSHIP',
            product: {
                name: product.name,
                nameEn: product.nameEn,
                nameDe: product.nameDe
            }
        }] as any;

        const pdfBuffer = await generateShopProformaPDF(order as any, emailItems, pdfSettings as any, locale as any);

        const emailContent = generateShopOrderEmail(order, emailItems, pdfSettings, locale);

        // Determine sender
        const sender = pdfSettings?.shopEmail ? `"${pdfSettings.shopBeneficiaryName || 'RUNION'}" <${pdfSettings.shopEmail}>` : undefined;

        await import('@/lib/email').then(({ sendEmail }) =>
            sendEmail({
                to: user.email,
                subject: getMembershipEmailSubject('ORDER', orderNumber, locale),
                html: emailContent,
                from: sender,
                attachments: [
                    {
                        filename: `dijbekero_${orderNumber}.pdf`,
                        content: Buffer.from(pdfBuffer),
                        contentType: 'application/pdf'
                    }
                ]
            })
        );

        if (pdfSettings?.shopEmail) {
            await import('@/lib/email').then(({ sendEmail }) =>
                sendEmail({
                    to: pdfSettings.shopEmail!,
                    subject: `[Új Tagság Rendelés] ${user.firstName} ${user.lastName}`,
                    html: generateMembershipOrderEmailHtml(user, orderNumber, grandTotal, locale),
                    from: sender
                }));
        }

        revalidatePath('/dashboard');
        return { success: true, orderId: order.id, message: 'Díjbekérő elküldve!' };

    } catch (e) {
        console.error("Membership purchase failed:", e);
        return { success: false, error: 'Szerver hiba történt.' };
    }
}

export async function importMembershipPayments(formData: FormData) {
    await requireAdmin();
    try {
        const file = formData.get('file') as File;
        if (!file) return { success: false, message: 'Nincs fájl.' };

        const text = await file.text();
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) return { success: false, message: 'Üres/hibás CSV.' };

        const header = lines[0].toLowerCase();
        const delim = header.includes(';') ? ';' : ',';
        const headers = header.split(delim).map(h => h.trim().replace(/^"|"$/g, ''));

        const idxOrder = headers.findIndex(h => h.includes('order') || h.includes('rendelés') || h.includes('id'));
        const idxStatus = headers.findIndex(h => h.includes('status') || h.includes('státusz') || h.includes('fizetve'));

        if (idxOrder === -1 || idxStatus === -1) {
            return { success: false, message: 'Hiányzó oszlopok: "Rendelés" és "Státusz" szükséges.' };
        }

        let count = 0;

        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(delim).map(c => c.trim().replace(/^"|"$/g, ''));
            if (row.length < headers.length) continue;

            const orderNum = row[idxOrder];
            const statusRaw = row[idxStatus].toUpperCase();

            if (['PAID', 'FIZETVE', 'YES', 'IGEN'].includes(statusRaw)) {
                const order = await prisma.order.findUnique({
                    where: { orderNumber: orderNum },
                    include: { items: true, user: true }
                });

                if (order && order.status !== 'PAID') {
                    const memItem = order.items.find(it => it.size === 'MEMBERSHIP');
                    if (memItem) {
                        const product = await prisma.product.findUnique({ where: { id: memItem.productId } });
                        if (product && product.slug?.startsWith('membership-')) {
                            const tierId = product.slug.replace('membership-', '');
                            const tier = await prisma.membershipTier.findUnique({ where: { id: tierId } });

                            if (tier) {
                                const now = new Date();
                                const end = new Date(now);
                                end.setMonth(end.getMonth() + tier.durationMonths);

                                await prisma.order.update({
                                    where: { id: order.id },
                                    data: { status: 'PAID' }
                                });

                                const globalSettings = await prisma.globalSettings.findFirst();
                                const locale = 'hu';
                                const emailItems = [{
                                    ...memItem,
                                    productName: product.name,
                                    product: {
                                        name: product.name,
                                        nameEn: product.nameEn,
                                        nameDe: product.nameDe
                                    }
                                }] as any;

                                await prisma.user.update({
                                    where: { id: order.userId },
                                    data: {
                                        membershipTierId: tier.id,
                                        membershipStart: now,
                                        membershipEnd: end
                                    }
                                });

                                try {
                                    const invBuffer = await generateShopInvoicePDF(order as any, emailItems as any, globalSettings as any, locale as any);

                                    await import('@/lib/email').then(({ sendEmail }) =>
                                        sendEmail({
                                            to: order.user.email,
                                            subject: getMembershipEmailSubject('ACTIVATION', order.orderNumber, locale),
                                            html: generateMembershipActivationEmailHtml(order.orderNumber, end, order.user.firstName, locale),
                                            attachments: [{
                                                filename: `szamla_${order.orderNumber}.pdf`,
                                                content: Buffer.from(invBuffer),
                                                contentType: 'application/pdf'
                                            }]
                                        })
                                    );
                                } catch (err) {
                                    console.error("Email error during activation", err);
                                }

                                count++;
                            }
                        }
                    }
                }
            }
        }
        revalidatePath('/secretroom75/memberships');
        return { success: true, message: `${count} tagság sikeresen aktiválva!` };

    } catch (e) {
        console.error("Import failed:", e);
        return { success: false, message: 'Hiba a feldolgozás során.' };
    }
}

export async function cancelMembership() {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: 'Bejelentkezés szükséges.' };

    try {
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                membershipTierId: null,
                membershipStart: null,
                membershipEnd: null,
                membershipExpiresAt: null
            }
        });
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/membership');
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Hiba a törléskor.' };
    }
}

export async function exportMemberships() {
    await requireAdmin();
    const users = await prisma.user.findMany({
        where: { membershipTierId: { not: null } },
        include: { membershipTier: true },
        orderBy: { lastName: 'asc' }
    });

    const header = ['Név', 'Email', 'Tagság', 'Kezdet', 'Lejárat', 'Számlázási Név', 'Cím', 'Adószám'];
    const rows = users.map(u => [
        `${u.lastName} ${u.firstName}`,
        u.email,
        u.membershipTier?.name || '',
        u.membershipStart ? u.membershipStart.toISOString().split('T')[0] : '',
        u.membershipEnd ? u.membershipEnd.toISOString().split('T')[0] : '',
        u.billingName || '',
        `${u.billingZipCode || ''} ${u.billingCity || ''}, ${u.billingAddress || ''}`,
        u.taxNumber || ''
    ]);

    const csvContent = [
        header.join(';'),
        ...rows.map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    return csvContent;
}

export async function markMembershipAsPaid(orderId: string) {
    await requireAdmin();
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true, user: true }
        });

        if (!order || order.status === 'PAID') {
            return { success: false, error: 'Rendelés nem található vagy már fizetve.' };
        }

        const memItem = order.items.find((it: any) => it.size === 'MEMBERSHIP');
        if (!memItem) {
            return { success: false, error: 'Ez nem tagsági rendelés.' };
        }

        const product = await prisma.product.findUnique({ where: { id: memItem.productId } });
        if (!product || !product.slug?.startsWith('membership-')) {
            return { success: false, error: 'Érvénytelen termék.' };
        }

        const tierId = product.slug.replace('membership-', '');
        const tier = await prisma.membershipTier.findUnique({ where: { id: tierId } });

        if (!tier) {
            return { success: false, error: 'Tagsági szint nem található.' };
        }

        const now = new Date();
        const end = new Date(now);
        end.setMonth(end.getMonth() + tier.durationMonths);

        // Update Order
        await prisma.order.update({
            where: { id: order.id },
            data: { status: 'PAID' }
        });

        // Update User
        await prisma.user.update({
            where: { id: order.userId },
            data: {
                membershipTierId: tier.id,
                membershipStart: now,
                membershipEnd: end,
                membershipExpiresAt: end
            }
        });

        // Send Email (Activation)
        try {
            const globalSettings = await prisma.globalSettings.findFirst();
            const locale = 'hu';
            // Prepare items for invoice generation (needs to match shop structure)
            const emailItems = [{
                ...memItem,
                productName: product.name,
                product: {
                    name: product.name,
                    nameEn: product.nameEn,
                    nameDe: product.nameDe
                }
            }] as any;

            // Generate Invoice
            const invBuffer = await generateShopInvoicePDF(order as any, emailItems as any, globalSettings as any, locale as any);

            await import('@/lib/email').then(({ sendEmail }) =>
                sendEmail({
                    to: order.user.email,
                    subject: getMembershipEmailSubject('ACTIVATION', order.orderNumber, locale), // Default 'hu'
                    html: generateMembershipActivationEmailHtml(order.orderNumber, end, order.user.firstName, locale),
                    attachments: [{
                        filename: `szamla_${order.orderNumber}.pdf`,
                        content: Buffer.from(invBuffer),
                        contentType: 'application/pdf'
                    }]
                })
            );

        } catch (emailErr) {
            console.error("Failed to send activation email:", emailErr);
            // Don't fail the whole action just because email failed, but maybe warn?
        }

        revalidatePath('/secretroom75/memberships');
        return { success: true };

    } catch (e) {
        console.error("Mark as paid failed:", e);
        return { success: false, error: 'Szerver hiba.' };
    }
}
