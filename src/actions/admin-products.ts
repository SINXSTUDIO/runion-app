'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth-checks';

const ProductSchema = z.object({
    name: z.string().min(2, "A név kötelező"),
    price: z.coerce.number().min(0, "Az ár nem lehet negatív"),
    imageUrl: z.string().optional().nullable(),
    active: z.boolean().default(true),
    stock: z.coerce.number().int().min(0, "A készlet nem lehet negatív").default(0),
    description: z.string().optional().nullable(),
    descriptionEn: z.string().optional().nullable(),
    descriptionDe: z.string().optional().nullable(),
    nameEn: z.string().optional().nullable(),
    nameDe: z.string().optional().nullable(),
});

export async function createProduct(prevState: any, formData: FormData) {
    try {
        await requireAdmin();

        const rawData: any = {
            name: formData.get('name'),
            price: formData.get('price'),
            imageUrl: formData.get('imageUrl'),
            active: formData.get('active') === 'on',
            stock: formData.get('stock'),
            description: formData.get('description'),
            descriptionEn: formData.get('descriptionEn'),
            descriptionDe: formData.get('descriptionDe'),
            nameEn: formData.get('nameEn'),
            nameDe: formData.get('nameDe'),
        };



        // Handle Stock Breakdown
        const stockBreakdownJson = formData.get('stockBreakdown') as string;
        let stockBreakdown = null;
        if (stockBreakdownJson) {
            try {
                stockBreakdown = JSON.parse(stockBreakdownJson);
                // Calculate total stock from breakdown
                const totalStock = Object.values(stockBreakdown).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
                rawData.stock = totalStock;
            } catch (e) {
                console.error("Invalid stock breakdown JSON", e);
            }
        }

        const validatedFields = ProductSchema.safeParse(rawData);

        if (!validatedFields.success) {
            return {
                message: 'Hibás adatok: ' + JSON.stringify(validatedFields.error.flatten().fieldErrors),
                errors: validatedFields.error.flatten().fieldErrors,
                success: false
            };
        }

        const product = await prisma.product.create({
            data: {
                ...validatedFields.data,
                stockBreakdown: stockBreakdown ?? undefined
            }
        });

        revalidatePath('/secretroom75/products');
        revalidatePath('/boutique');
        return { success: true, message: 'Termék létrehozva' };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Szerver hiba: ' + (e instanceof Error ? e.message : String(e)) };
    }
}

export async function updateProduct(id: string, prevState: any, formData: FormData) {
    try {
        await requireAdmin();

        const rawData: any = {
            name: formData.get('name'),
            price: formData.get('price'),
            imageUrl: formData.get('imageUrl'),
            active: formData.get('active') === 'on',
            stock: formData.get('stock'),
            description: formData.get('description'),
            descriptionEn: formData.get('descriptionEn'),
            descriptionDe: formData.get('descriptionDe'),
            nameEn: formData.get('nameEn'),
            nameDe: formData.get('nameDe'),
        };



        // Handle Stock Breakdown
        const stockBreakdownJson = formData.get('stockBreakdown') as string;
        let stockBreakdown = null;
        if (stockBreakdownJson) {
            try {
                stockBreakdown = JSON.parse(stockBreakdownJson);
                // Calculate total stock from breakdown
                const totalStock = Object.values(stockBreakdown).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
                rawData.stock = totalStock;
            } catch (e) {
                console.error("Invalid stock breakdown JSON", e);
            }
        }

        const validatedFields = ProductSchema.safeParse(rawData);

        if (!validatedFields.success) {
            return {
                message: 'Hibás adatok: ' + JSON.stringify(validatedFields.error.flatten().fieldErrors),
                errors: validatedFields.error.flatten().fieldErrors,
                success: false
            };
        }

        await prisma.product.update({
            where: { id },
            data: {
                ...validatedFields.data,
                stockBreakdown: stockBreakdown ?? undefined
            }
        });

        revalidatePath('/secretroom75/products');
        revalidatePath('/boutique');
        return { success: true, message: 'Termék frissítve' };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Szerver hiba: ' + (e instanceof Error ? e.message : String(e)) };
    }
}

export async function deleteProduct(id: string) {
    try {
        await requireAdmin();
        await prisma.product.delete({
            where: { id }
        });
        revalidatePath('/secretroom75/products');
        revalidatePath('/boutique');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Törlés sikertelen (lehet, hogy van már rendelés ehhez a termékhez)' };
    }
}
