"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-checks";
import { genericDelete, genericDuplicate, genericReorder, genericFetch } from "@/lib/crud-factory";

import { Partner } from "@prisma/client";

const partnerSchema = z.object({
    name: z.string().min(2, "A névnek legalább 2 karakternek kell lennie"),
    logoUrl: z.string().min(1, "A logó feltöltése kötelező"),
    order: z.number().int().default(0),
    active: z.boolean().default(true),
});

export async function getPartners(): Promise<Partner[]> {
    return genericFetch(prisma.partner) as Promise<Partner[]>;
}

export async function createPartner(prevState: any, formData: FormData) {
    await requireAdmin();
    const validatedFields = partnerSchema.safeParse({
        name: formData.get("name"),
        logoUrl: formData.get("logoUrl"),
        order: Number(formData.get("order")) || 0,
        active: formData.get("active") === "true",
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Hibás adatok a beküldött űrlapon.",
        };
    }

    try {
        await (prisma as any).partner.create({
            data: validatedFields.data,
        });

        revalidatePath("/[locale]/secretroom75/(admin)/partners", "page");
        revalidatePath("/", "page");

        return { message: "Partner sikeresen létrehozva.", success: true };
    } catch (error) {
        console.error("Hiba a partner létrehozásakor:", error);
        return { message: "Hiba történt az adatbázis mentés során." };
    }
}

export async function updatePartner(id: string, prevState: any, formData: FormData) {
    await requireAdmin();
    const validatedFields = partnerSchema.safeParse({
        name: formData.get("name"),
        logoUrl: formData.get("logoUrl"),
        order: Number(formData.get("order")) || 0,
        active: formData.get("active") === "true",
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Hibás adatok a beküldött űrlapon.",
        };
    }

    try {
        await (prisma as any).partner.update({
            where: { id },
            data: validatedFields.data,
        });

        revalidatePath("/[locale]/secretroom75/(admin)/partners", "page");
        revalidatePath("/", "page");

        return { message: "Partner sikeresen frissítve.", success: true };
    } catch (error) {
        console.error("Hiba a partner frissítésekor:", error);
        return { message: "Hiba történt az adatbázis frissítés során." };
    }
}

export async function deletePartner(id: string) {
    return genericDelete(prisma.partner, id, ["/[locale]/secretroom75/(admin)/partners", "/[locale]", "/"]);
}

export async function duplicatePartner(id: string) {
    return genericDuplicate(prisma.partner, id, 'name', ['/[locale]/secretroom75/partners', '/[locale]']);
}

export async function updatePartnerOrder(partners: { id: string, order: number }[]) {
    return genericReorder(prisma.partner, partners, ["/[locale]/secretroom75/(admin)/partners", "/[locale]", "/"]);
}
