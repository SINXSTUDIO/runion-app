'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth-checks';
import { genericDelete, genericReorder, genericFetch } from '@/lib/crud-factory';

const GalleryImageSchema = z.object({
    id: z.string().optional(),
    imageUrl: z.string().min(1, "Image URL is required").refine(
        (val) => val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
        { message: "Must be a valid URL or relative path (starting with /)" }
    ),
    caption: z.string().nullable().optional(),
    order: z.number().int().default(0),
    active: z.boolean().default(true),
});

export async function getGalleryImages() {
    return genericFetch((prisma as any).galleryImage);
}

export async function upsertGalleryImage(data: z.infer<typeof GalleryImageSchema>) {
    try {
        await requireAdmin();
        const validated = GalleryImageSchema.parse(data);
        const { id, ...rest } = validated;

        if (id) {
            await (prisma as any).galleryImage.update({
                where: { id },
                data: rest,
            });
        } else {
            await (prisma as any).galleryImage.create({
                data: rest,
            });
        }

        revalidatePath('/[locale]/secretroom75/gallery', 'page');
        revalidatePath('/[locale]', 'page');
        return { success: true };
    } catch (error: any) {
        console.error('Error upserting gallery image:', error);
        return {
            success: false,
            error: error instanceof z.ZodError
                ? 'Validációs hiba: ' + error.issues.map((i: any) => i.message).join(', ')
                : 'Szerver hiba: ' + (error.message || 'Ismeretlen hiba történt')
        };
    }
}

export async function deleteGalleryImage(id: string) {
    return genericDelete((prisma as any).galleryImage, id, ['/[locale]/secretroom75/gallery', '/[locale]']);
}

export async function updateGalleryImageOrder(imageIds: string[]) {
    // Convert string[] of ids to {id, order}[] needed by genericReorder
    const items = imageIds.map((id, index) => ({ id, order: index }));
    return genericReorder((prisma as any).galleryImage, items, ['/[locale]/secretroom75/gallery', '/[locale]']);
}
