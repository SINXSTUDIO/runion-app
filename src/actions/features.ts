'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth-checks';
import { genericDelete, genericDuplicate, genericReorder, genericFetch } from '@/lib/crud-factory';

const FeatureSchema = z.object({
    id: z.string().optional(),
    iconName: z.string().min(1),
    title: z.string().min(1),
    titleEn: z.string().nullable().optional(),
    titleDe: z.string().nullable().optional(),
    description: z.string().min(1),
    descriptionEn: z.string().nullable().optional(),
    descriptionDe: z.string().nullable().optional(),
    order: z.number().int().default(0),
    active: z.boolean().default(true),
});

export async function getFeatures() {
    return genericFetch(prisma.homepageFeature);
}

export async function upsertFeature(data: z.infer<typeof FeatureSchema>) {
    try {
        await requireAdmin();
        const validated = FeatureSchema.parse(data);
        const { id, ...rest } = validated;

        if (id) {
            await prisma.homepageFeature.update({
                where: { id },
                data: rest,
            });
        } else {
            await prisma.homepageFeature.create({
                data: rest,
            });
        }

        revalidatePath('/[locale]/secretroom75/features', 'page');
        revalidatePath('/[locale]', 'page');
        return { success: true };
    } catch (error: any) {
        console.error('Error upserting feature:', error);
        return {
            success: false,
            error: error instanceof z.ZodError
                ? 'Validációs hiba: ' + error.issues.map((i: any) => i.message).join(', ')
                : 'Szerver hiba: ' + (error.message || 'Ismeretlen hiba történt')
        };
    }
}

export async function deleteFeature(id: string) {
    return genericDelete(prisma.homepageFeature, id, ['/[locale]/secretroom75/features', '/[locale]']);
}

export async function duplicateFeature(id: string) {
    return genericDuplicate(prisma.homepageFeature, id, 'title', ['/[locale]/secretroom75/features', '/[locale]']);
}

export async function updateFeatureOrder(featureIds: string[]) {
    const items = featureIds.map((id, index) => ({ id, order: index }));
    return genericReorder(prisma.homepageFeature, items, ['/[locale]/secretroom75/features', '/[locale]']);
}
