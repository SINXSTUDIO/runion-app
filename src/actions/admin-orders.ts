'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { generateOrderEmailContent } from '@/lib/email';
import { logError } from '@/lib/logger';
import { requireAdmin } from '@/lib/auth-checks';

export async function deleteOrder(id: string) {
    try {
        await requireAdmin();

        // 1. Fetch order with items to restore stock
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        if (!order) {
            return { success: false, message: 'Rendelés nem található.' };
        }

        // 2. Restore stock for each item
        for (const item of order.items) {
            if (!item.product) continue;

            const product = item.product;
            let newStock = product.stock + item.quantity;
            let newStockBreakdown = product.stockBreakdown ? JSON.parse(JSON.stringify(product.stockBreakdown)) : null;

            // Handle Per-Size Stock
            if (newStockBreakdown && item.size) {
                const size = item.size;
                const currentSizeStock = Number(newStockBreakdown[size] || 0);
                newStockBreakdown[size] = currentSizeStock + item.quantity;

                // Recalculate total stock from breakdown to ensure consistency
                newStock = Object.values(newStockBreakdown).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
            }

            await prisma.product.update({
                where: { id: product.id },
                data: {
                    stock: newStock,
                    stockBreakdown: newStockBreakdown ?? undefined
                }
            });
        }

        // 3. Delete the order
        await prisma.order.delete({ where: { id } });

        revalidatePath('/secretroom75/orders');
        revalidatePath('/boutique'); // Update shop stock view
        return { success: true, message: 'Rendelés törölve, a termékek visszakerültek a készletbe.' };
    } catch (e) {
        logError(e, 'DeleteOrder');
        return { success: false, message: 'Hiba a törlés során.' };
    }
}

export async function updateOrder(id: string, data: any) {
    try {
        await requireAdmin();
        await (prisma as any).order.update({
            where: { id },
            data: {
                status: data.status,
                paymentMethod: data.paymentMethod,
                shippingName: data.shippingName,
                shippingEmail: data.shippingEmail,
                // Add other fields as needed
            }
        });
        revalidatePath('/secretroom75/orders');
        return { success: true, message: 'Rendelés frissítve.' };
    } catch (e) {
        logError(e, 'UpdateOrder');
        return { success: false, message: 'Hiba a frissítés során.' };
    }
}

export async function resendOrderEmail(id: string) {
    try {
        await requireAdmin();
        const order = await (prisma as any).order.findUnique({ where: { id } });
        if (!order) return { success: false, message: 'Rendelés nem található.' };

        const content = await generateOrderEmailContent(id);

        // Send the email
        const { sendEmail } = await import('@/lib/email');
        const result = await sendEmail({
            to: order.shippingEmail,
            subject: 'Rendelés Visszaigazolása - Ismételt küldés',
            html: content
        });

        if (result.success) {
            return { success: true, message: 'Email sikeresen elküldve.' };
        } else {
            throw new Error('Email küldése sikertelen: ' + JSON.stringify(result.error));
        }
    } catch (e) {
        logError(e, 'ResendEmail');
        return { success: false, message: 'Hiba az email küldésekor.' };
    }
}

export async function exportOrdersCSV() {
    try {
        await requireAdmin();

        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        const header = ['Order Number', 'Date', 'Customer Name', 'Customer Email', 'Items', 'Total', 'Status', 'Payment Method'];
        const rows = orders.map(order => {
            const itemsSummary = order.items.map(i => `${i.quantity}x ${i.product.name} (${i.size || '-'})`).join(', ');
            return [
                order.orderNumber,
                new Date(order.createdAt).toISOString().split('T')[0],
                order.shippingName,
                order.shippingEmail,
                itemsSummary,
                order.totalAmount.toString(),
                order.status,
                order.paymentMethod
            ];
        });

        // Use semicolon for Excel compatibility in HU
        const csvContent = [
            header.join(';'),
            ...rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(';'))
        ].join('\n');

        // Add BOM for Excel UTF-8 compatibility
        const BOM = '\uFEFF';
        return { success: true, csv: BOM + csvContent };

    } catch (e) {
        logError(e, 'ExportOrdersCSV');
        return { success: false, message: 'Hiba a CSV generálásakor.' };
    }
}

export async function importOrdersCSV(formData: FormData) {
    try {
        await requireAdmin();
        const file = formData.get('file') as File;

        if (!file) return { success: false, message: 'Nincs fájl feltöltve.' };

        const text = await file.text();
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

        if (lines.length < 2) return { success: false, message: 'Üres vagy hibás CSV fájl.' };

        // Assume first line is header. We look for 'Order Number' column index.
        const headerOriginal = lines[0].split(';');
        // Remove quotes
        const header = headerOriginal.map(h => h.replace(/^"|"$/g, '').trim());

        const orderNumberIndex = header.findIndex(h => h.toLowerCase().includes('order number') || h.toLowerCase().includes('rendelésszám'));
        const statusIndex = header.findIndex(h => h.toLowerCase().includes('status') || h.toLowerCase().includes('státusz') || h.toLowerCase().includes('állapot'));

        if (orderNumberIndex === -1) {
            return { success: false, message: 'Nem található a "Order Number" vagy "Rendelésszám" oszlop.' };
        }

        let updatedCount = 0;
        let errors = 0;

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            // Split by semicolon, handling quotes is tricky with simple split but usually fine for simple exports
            // Ideally we use a parser, but for now simple split:
            // This regex splits by semicolon but ignores semicolons inside quotes
            const columns = line.match(/(".*?"|[^";]+)(?=\s*;|\s*$)/g) || [];

            // Fallback for simple split if regex fails or simple CSV
            const values = columns.length > 0
                ? columns.map(col => col.replace(/^"|"$/g, '').replace(/""/g, '"').trim())
                : line.split(';').map(col => col.replace(/^"|"$/g, '').replace(/""/g, '"').trim());

            const orderNumber = values[orderNumberIndex];

            if (!orderNumber) continue;

            const currentOrder = await prisma.order.findUnique({
                where: { orderNumber }
            });

            if (currentOrder && currentOrder.status !== 'PAID' && currentOrder.status !== 'CANCELLED') {
                // Check Status column if it exists
                let shouldMarkPaid = true;

                if (statusIndex !== -1) {
                    const csvStatus = values[statusIndex]?.toLowerCase().trim();
                    // If status is not 'paid' or 'fizetve', we might want to skip?
                    // User requirement: "hogy lássák hogy kilett fizetve" (so they see it is paid) implies this list IS valid payments.
                    // But if someone uploads a full export including 'pending', we shouldn't auto-pay them.

                    if (csvStatus && !['paid', 'fizetve', 'teljesítve', 'sikeres'].includes(csvStatus)) {
                        shouldMarkPaid = false;
                    }
                }

                if (shouldMarkPaid) {
                    await prisma.order.update({
                        where: { id: currentOrder.id },
                        data: { status: 'PAID' }
                    });
                    updatedCount++;
                }
            }
        }

        revalidatePath('/secretroom75/orders');
        return { success: true, message: `${updatedCount} rendelés frissítve 'Fizetve' státuszra.` };

    } catch (e) {
        logError(e, 'ImportOrdersCSV');
        return { success: false, message: 'Hiba a fájl feldolgozásakor.' };
    }
}

