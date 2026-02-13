'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const distanceSchema = z.object({
    name: z.string().min(1),
    nameEn: z.string().optional().nullable(),
    nameDe: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    price: z.number().min(0),
    priceEur: z.number().optional(),
    capacityLimit: z.number().int().min(1),
    startTime: z.string().optional(), // ISO String
    crewPricing: z.any().optional().nullable(), // {"1": 130, "2": 200, ...}
    tiers: z.array(z.object({
        id: z.string().optional(),
        name: z.string().min(1),
        price: z.number().min(0),
        priceEur: z.number().optional(),
        validFrom: z.string(),
        validTo: z.string(),
    })).optional()
});

export async function createDistance(eventId: string, data: z.infer<typeof distanceSchema>) {
    try {
        const validated = distanceSchema.parse(data);

        await prisma.distance.create({
            data: {
                eventId,
                name: validated.name,
                nameEn: validated.nameEn,
                nameDe: validated.nameDe,
                description: validated.description,
                price: validated.price,
                priceEur: validated.priceEur,
                capacityLimit: validated.capacityLimit,
                startTime: validated.startTime ? new Date(validated.startTime) : new Date(), // Fallback to now if missing? Or should be required.
                crewPricing: validated.crewPricing || null,
                priceTiers: validated.tiers ? {
                    create: validated.tiers.map(t => ({
                        name: t.name,
                        price: t.price,
                        priceEur: t.priceEur,
                        validFrom: new Date(t.validFrom),
                        validTo: new Date(t.validTo)
                    }))
                } : undefined
            }
        });

        revalidatePath(`/[locale]/secretroom75/events/${eventId}/edit`, 'page');
        return { success: true };
    } catch (error) {
        console.error('Failed to create distance:', error);
        return { success: false, error: String(error) };
    }
}

export async function updateDistance(id: string, eventId: string, data: z.infer<typeof distanceSchema>) {
    try {
        const validated = distanceSchema.parse(data);

        // Transaction to update distance and handle tiers
        await prisma.$transaction(async (tx) => {
            // Update Distance basics
            await tx.distance.update({
                where: { id },
                data: {
                    name: validated.name,
                    nameEn: validated.nameEn,
                    nameDe: validated.nameDe,
                    description: validated.description,
                    price: validated.price, // Base Price
                    priceEur: validated.priceEur,
                    capacityLimit: validated.capacityLimit,
                    startTime: validated.startTime ? new Date(validated.startTime) : undefined,
                    crewPricing: validated.crewPricing || null,
                }
            });

            // Handle Tiers
            // Strategy: Delete all existing tiers and recreate? Or smart update?
            // Delete+Recreate is simpler and safe for small lists < 10 items.
            if (validated.tiers) {
                await tx.priceTier.deleteMany({ where: { distanceId: id } });
                if (validated.tiers.length > 0) {
                    await tx.priceTier.createMany({
                        data: validated.tiers.map(t => ({
                            distanceId: id,
                            name: t.name,
                            price: t.price,
                            priceEur: t.priceEur,
                            validFrom: new Date(t.validFrom),
                            validTo: new Date(t.validTo)
                        }))
                    });
                }
            }
        });

        revalidatePath(`/[locale]/secretroom75/events/${eventId}/edit`, 'page');
        return { success: true };
    } catch (error) {
        console.error('Failed to update distance:', error);
        return { success: false, error: String(error) };
    }
}

export async function deleteDistance(id: string, eventId: string) {
    try {
        await prisma.distance.delete({ where: { id } });
        revalidatePath(`/[locale]/secretroom75/events/${eventId}/edit`, 'page');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete distance:', error);
        return { success: false, error: String(error) };
    }
}

export async function duplicateDistance(id: string, eventId: string) {
    try {
        const existing = await prisma.distance.findUnique({
            where: { id },
            include: { priceTiers: true }
        });

        if (!existing) return { success: false, error: 'Distance not found' };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, priceTiers, ...data } = existing;

        await prisma.distance.create({
            data: {
                name: `${data.name} (Másolat)`,
                nameEn: data.nameEn,
                nameDe: data.nameDe,
                description: data.description,
                price: Number(data.price),
                priceEur: data.priceEur ? Number(data.priceEur) : null,
                capacityLimit: data.capacityLimit,
                startTime: data.startTime,
                eventId: data.eventId,
                crewPricing: data.crewPricing as any,
                priceTiers: {
                    create: priceTiers.map(t => ({
                        name: t.name,
                        price: t.price,
                        priceEur: t.priceEur,
                        validFrom: new Date(t.validFrom),
                        validTo: new Date(t.validTo)
                    }))
                }
            }
        });

        revalidatePath(`/[locale]/secretroom75/events/${eventId}/edit`, 'page');
        return { success: true };
    } catch (error) {
        console.error('Failed to duplicate distance:', error);
        return { success: false, error: String(error) };
    }
}
