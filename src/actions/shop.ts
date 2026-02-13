'use server';

import prisma from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { customAlphabet } from 'nanoid';
import { generateShopOrderEmail } from '@/lib/email';
import { logError } from '@/lib/logger';
import { getLocale } from 'next-intl/server';

const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

const OrderSchema = z.object({
    // Billing
    billingName: z.string().min(2),
    billingZip: z.string().min(4),
    billingCity: z.string().min(2),
    billingAddress: z.string().min(5),
    billingTaxNumber: z.string().optional(),

    // Shipping
    shippingName: z.string().min(2),
    shippingZip: z.string().min(4),
    shippingCity: z.string().min(2),
    shippingAddress: z.string().min(5),
    shippingPhone: z.string().min(6),
    shippingEmail: z.string().email(),

    note: z.string().optional(),

    // Cart Items
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().min(1),
        price: z.number(), // We should verify price on backend ideally, but for MVP we trust/recheck
        size: z.string().optional()
    })).min(1),

    // Payment
    paymentMethod: z.enum(['BANK_TRANSFER', 'CARD']).default('BANK_TRANSFER'),
});

export async function createOrder(prevState: any, formData: FormData) {
    // We expect formData to contain a JSON string for 'cart' or we accept a raw object if called directly?
    // Actions receive FormData. Complex objects (arrays) are hard in FormData.
    // We will decode the JSON string 'orderData' if passed, or construct from fields.
    // Let's assume the client sends a JSON stringified body in a hidden field 'orderData' 
    // OR we use the `bind` method to pass arguments?
    // Standard FormData approach:

    // Get current locale
    const locale = await getLocale();

    const rawData = Object.fromEntries(formData.entries());
    let parsedData;

    try {
        // If we use a hidden input with JSON
        if (typeof rawData.json === 'string') {
            parsedData = JSON.parse(rawData.json);
        } else {
            // Fallback (not really supported for complex arrays)
            return { message: 'Invalid data format', success: false };
        }
    } catch (e) {
        return { message: 'JSON Parse Error', success: false };
    }

    const validatedFields = OrderSchema.safeParse(parsedData);

    if (!validatedFields.success) {
        return {
            message: 'Hibás adatok. Kérlek ellenőrizd a mezőket.',
            errors: validatedFields.error.flatten().fieldErrors,
            success: false
        };
    }

    const data = validatedFields.data;

    try {
        // 1. Verify Prices & Stock (Optional for MVP but recommended)
        // We will just fetch products to get current price to ensure security
        const productIds = data.items.map(i => i.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } }
        });

        let totalAmount = 0;
        const finalItems = [];

        for (const item of data.items) {
            const product = products.find(p => p.id === item.productId);
            if (!product) continue;

            const price = Number(product.price);
            totalAmount += price * item.quantity;

            finalItems.push({
                productId: product.id,
                quantity: item.quantity,
                price: price,
                size: item.size
            });
        }

        if (finalItems.length === 0) {
            return { message: 'Nincs érvényes termék a kosárban.', success: false };
        }

        // 2. Upsert User
        // Split Shipping Name for First/Last
        const nameParts = data.shippingName.trim().split(' ');
        const lastName = nameParts[0];
        const firstName = nameParts.slice(1).join(' ');

        const user = await prisma.user.upsert({
            where: { email: data.shippingEmail },
            update: {
                firstName: firstName || data.shippingName,
                lastName: lastName || '',
                city: data.shippingCity,
                zipCode: data.shippingZip,
                address: data.shippingAddress,
                phoneNumber: data.shippingPhone,
            },
            create: {
                email: data.shippingEmail,
                firstName: firstName || data.shippingName,
                lastName: lastName || '',
                city: data.shippingCity,
                zipCode: data.shippingZip,
                address: data.shippingAddress,
                phoneNumber: data.shippingPhone,
                role: 'USER',
            }
        });

        // 3. Prepare Order Data
        const orderNumber = `ORD-${new Date().getFullYear()}-${nanoid()}`;

        // Extract boolean flags for legal acceptance
        // const { items, ...orderDetails } = orderData; // items might conflict if destructured before
        const orderDetails = parsedData as any;
        const termsAccepted = orderDetails?.termsAccepted === true || orderDetails?.termsAccepted === 'true';
        const privacyAccepted = orderDetails?.privacyAccepted === true || orderDetails?.privacyAccepted === 'true';

        // Calculate Shipping Cost Server-Side
        const globalSettings = await prisma.globalSettings.findFirst();
        const shippingCost = globalSettings?.shopShippingCost || 0;
        const freeThreshold = globalSettings?.shopFreeShippingThreshold || 20000;
        const finalShippingCost = Number(totalAmount) >= freeThreshold ? 0 : shippingCost;
        const grandTotal = Number(totalAmount) + finalShippingCost;

        const order = await prisma.order.create({
            data: {
                orderNumber,
                userId: user.id,
                status: 'PENDING',
                paymentMethod: 'BANK_TRANSFER', // Enforce transfer for now
                totalAmount: grandTotal,

                // Addresses
                billingName: data.billingName,
                billingZip: data.billingZip,
                billingCity: data.billingCity,
                billingAddress: data.billingAddress,
                billingTaxNumber: data.billingTaxNumber,

                shippingName: data.shippingName,
                shippingZip: data.shippingZip,
                shippingCity: data.shippingCity,
                shippingAddress: data.shippingAddress,
                shippingPhone: data.shippingPhone,
                shippingEmail: data.shippingEmail,

                note: data.note,

                // Legal Acceptance
                termsAccepted,
                privacyAccepted,

                items: {
                    create: finalItems.map(i => ({
                        productId: i.productId,
                        quantity: i.quantity,
                        price: i.price,
                        size: i.size
                    }))
                }
            }
        });

        // Decrement Stock
        for (const item of finalItems) {
            await prisma.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } }
            });
        }

        const emailItems = finalItems.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                ...item,
                productName: product ? product.name : 'Ismeretlen termék',
                product: {
                    name: product?.name || 'Ismeretlen termék',
                    nameEn: product?.nameEn,
                    nameDe: product?.nameDe
                }
            };
        });

        // 4. Send Confirmation Email
        const emailContent = generateShopOrderEmail(order as any, emailItems as any, globalSettings as any, locale as any);

        // Generate Proforma PDF
        const { generateShopProformaPDF } = await import('@/lib/pdf-generator');
        const pdfBuffer = await generateShopProformaPDF(order as any, emailItems as any, globalSettings as any, locale as any);

        const emailSubjectBase = {
            hu: 'Rendelés Visszaigazolás',
            en: 'Order Confirmation',
            de: 'Bestellbestätigung'
        };
        const currentSubject = emailSubjectBase[locale as keyof typeof emailSubjectBase] || emailSubjectBase.hu;

        await import('@/lib/email').then(({ sendEmail }) =>
            sendEmail({
                to: data.shippingEmail,
                subject: `${currentSubject} - ${orderNumber}`,
                html: emailContent,
                from: globalSettings?.shopEmail ? `"RUNION.EU" <${globalSettings.shopEmail}>` : undefined,
                attachments: [
                    {
                        filename: `dijbekero_${orderNumber}.pdf`,
                        content: Buffer.from(pdfBuffer),
                        contentType: 'application/pdf'
                    }
                ]
            })
        );

        // I should fix the Subject translation:
        // Let's adjust the code content to include subject translation map locally or using the one from email.ts if possible?
        // email.ts has `EMAIL_TRANSLATIONS`. I can export it? 
        // Or just duplicate the subject line logic briefly.
        // Actually, I'll modify the WriteToFile content to include Subject translation.

        // 5. Send Notification to Organizer
        if (globalSettings?.shopEmail) {
            await import('@/lib/email').then(({ sendEmail }) =>
                sendEmail({
                    to: globalSettings.shopEmail!,
                    subject: `[Új Rendelés] #${orderNumber} - ${data.shippingName}`,
                    html: `
                        <p>Új rendelés érkezett a webshopból!</p>
                        <p><strong>Megrendelő:</strong> ${data.shippingName}</p>
                        <p><strong>Rendelés száma:</strong> ${orderNumber}</p>
                        <p><strong>Végösszeg:</strong> ${Number(grandTotal).toLocaleString('hu-HU')} Ft</p>
                        <hr>
                        ${emailContent}
                    `,
                    from: globalSettings.shopEmail ? `"RUNION.EU" <${globalSettings.shopEmail}>` : undefined
                }));
        }

        // System Notification
        try {
            const { createNotification } = await import('@/actions/notifications');
            await createNotification(
                user.id,
                'Rendelés rögzítve',
                `Rendelésed (#${orderNumber}) sikeresen rögzítettük.`,
                'success',
                '/dashboard'
            );
        } catch (e) {
            console.error('Failed to create notification', e);
        }

        revalidatePath('/boutique');
        return {
            message: 'Sikeres rendelés!',
            success: true,
            orderId: order.id,
            totalAmount
        };

    } catch (error) {
        await logError(error, 'Create Order');
        return { message: 'Szerver hiba történt.', success: false };
    }
}
