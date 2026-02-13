'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth-checks';
import { genericDelete, genericDuplicate, genericReorder, genericFetch } from '@/lib/crud-factory';

const SponsorSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Sponsor name is required"),
    logoUrl: z.string().min(1, "Logo URL is required").refine(
        (val) => val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
        { message: "Must be a valid URL or relative path (starting with /)" }
    ),
    order: z.number().int().default(0),
    active: z.boolean().default(true),
});

export async function getSponsors() {
    return genericFetch(prisma.sponsor);
}

export async function upsertSponsor(data: z.infer<typeof SponsorSchema>) {
    try {
        await requireAdmin();
        const validated = SponsorSchema.parse(data);
        const { id, ...rest } = validated;

        if (id) {
            await prisma.sponsor.update({
                where: { id },
                data: rest,
            });
        } else {
            await prisma.sponsor.create({
                data: rest,
            });
        }

        revalidatePath('/[locale]/secretroom75/sponsors', 'page');
        revalidatePath('/[locale]', 'page');
        return { success: true };
    } catch (error: any) {
        console.error('Error upserting sponsor:', error);
        return {
            success: false,
            error: error instanceof z.ZodError
                ? 'Validációs hiba: ' + error.issues.map((i: any) => i.message).join(', ')
                : 'Szerver hiba: ' + (error.message || 'Ismeretlen hiba történt')
        };
    }
}

export async function deleteSponsor(id: string) {
    return genericDelete(prisma.sponsor, id, ['/[locale]/secretroom75/sponsors', '/[locale]']);
}

export async function duplicateSponsor(id: string) {
    return genericDuplicate(prisma.sponsor, id, 'name', ['/[locale]/secretroom75/sponsors', '/[locale]']);
}

export async function updateSponsorOrder(sponsorIds: string[]) {
    // Convert string[] of ids to {id, order}[] needed by genericReorder
    const items = sponsorIds.map((id, index) => ({ id, order: index }));
    return genericReorder(prisma.sponsor, items, ['/[locale]/secretroom75/sponsors', '/[locale]']);
}
