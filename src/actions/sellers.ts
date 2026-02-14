"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";

// Schema for validation
const sellerSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "A név kötelező"),
    key: z.string().optional().nullable(),
    address: z.string().min(1, "A cím kötelező"),
    phone: z.string().optional().nullable(),
    email: z.string().email("Érvénytelen email").optional().nullable().or(z.literal('')),
    taxNumber: z.string().optional().nullable(),
    regNumber: z.string().optional().nullable(),
    representative: z.string().optional().nullable(),
    bankName: z.string().optional().nullable(),
    bankAccountNumber: z.string().optional().nullable(),
    iban: z.string().optional().nullable(), // Legacy IBAN field, probably unused if ibanEuro exists
    bankAccountNumberEuro: z.string().optional().nullable(),
    ibanEuro: z.string().optional().nullable(),
    active: z.boolean().default(true),
    order: z.number().int().default(0),
});

export async function getSellers() {
    try {
        const sellers = await prisma.seller.findMany({
            orderBy: { order: 'asc' }
        });
        return sellers;
    } catch (error) {
        console.error("Failed to fetch sellers:", error);
        return [];
    }
}

export async function upsertSeller(data: z.infer<typeof sellerSchema>) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        const validated = sellerSchema.parse(data);

        if (validated.id) {
            // Update
            await prisma.seller.update({
                where: { id: validated.id },
                data: {
                    name: validated.name,
                    key: validated.key,
                    address: validated.address,
                    phone: validated.phone,
                    email: validated.email || null,
                    taxNumber: validated.taxNumber,
                    regNumber: validated.regNumber,
                    representative: validated.representative,
                    bankName: validated.bankName,
                    bankAccountNumber: validated.bankAccountNumber,
                    iban: validated.iban,
                    bankAccountNumberEuro: validated.bankAccountNumberEuro,
                    ibanEuro: validated.ibanEuro,
                    active: validated.active,
                    order: validated.order,
                }
            });
        } else {
            // Create
            await prisma.seller.create({
                data: {
                    name: validated.name,
                    key: validated.key,
                    address: validated.address,
                    phone: validated.phone,
                    email: validated.email || null,
                    taxNumber: validated.taxNumber,
                    regNumber: validated.regNumber,
                    representative: validated.representative,
                    bankName: validated.bankName,
                    bankAccountNumber: validated.bankAccountNumber,
                    iban: validated.iban,
                    bankAccountNumberEuro: validated.bankAccountNumberEuro,
                    ibanEuro: validated.ibanEuro,
                    active: validated.active,
                    order: validated.order,
                }
            });
        }

        revalidatePath("/secretroom75/sellers");
        revalidatePath("/secretroom75/settings"); // Revalidate settings as sellers might be used there
        revalidatePath("/secretroom75/events");   // Revalidate events as sellers are used there

        return { success: true };
    } catch (error) {
        console.error("Failed to upsert seller:", error);
        return { success: false, error: String(error) };
    }
}

export async function deleteSeller(id: string) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        // Check for usage in events or membership settings
        const usedInEvents = await prisma.event.count({ where: { sellerId: id } });
        if (usedInEvents > 0) {
            return { success: false, error: "Nem törölhető: A szervezet használatban van eseményeknél." };
        }

        // We could verify usage in GlobalSettings too but Prisma relations should handle restrictive checks or we do it manually.
        // For now, let's try delete and catch error.

        await prisma.seller.delete({ where: { id } });

        revalidatePath("/secretroom75/sellers");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete seller:", error);
        return { success: false, error: "Hiba törlés közben (lehet, hogy használatban van)." };
    }
}
