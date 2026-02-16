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

export async function importSellers(formData: FormData) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        const file = formData.get("file") as File;
        if (!file) {
            return { success: false, error: "Nincs fájl feltöltve" };
        }

        const jsonContent = await file.text();
        let sellersData;
        try {
            sellersData = JSON.parse(jsonContent);
        } catch (e) {
            return { success: false, error: "Érvénytelen JSON formátum" };
        }

        if (!Array.isArray(sellersData)) {
            sellersData = [sellersData];
        }

        let updatedCount = 0;
        let errors = [];

        for (const seller of sellersData) {
            try {
                // Try to find existing seller by ID, then Key (kulcs), then Name (Név)
                let existingSeller = null;

                if (seller.id) {
                    existingSeller = await prisma.seller.findUnique({ where: { id: seller.id } });
                }

                if (!existingSeller) {
                    const key = seller.key || seller["kulcs"] || seller["Kulcs"];
                    if (key) {
                        existingSeller = await prisma.seller.findUnique({ where: { key: key } });
                    }
                }

                if (!existingSeller) {
                    const name = seller.name || seller["Név"] || seller["Nev"];
                    if (name) {
                        existingSeller = await prisma.seller.findFirst({ where: { name: name } });
                    }
                }

                if (existingSeller) {
                    // Update
                    await prisma.seller.update({
                        where: { id: existingSeller.id },
                        data: {
                            // Update fields present in JSON, fallback to existing if not present
                            key: (seller.key || seller["kulcs"] || seller["Kulcs"]) ?? existingSeller.key,
                            name: (seller.name || seller["Név"] || seller["Nev"]) ?? existingSeller.name,
                            address: (seller.address || seller["Cím"] || seller["Cim"]) ?? existingSeller.address,
                            bankName: seller.bankName !== undefined ? seller.bankName : (seller["Bank"] || seller["Bank neve"] || existingSeller.bankName),
                            bankAccountNumber: seller.bankAccountNumber !== undefined ? seller.bankAccountNumber : (seller["Számlaszám"] || seller["Szamlaszam"] || existingSeller.bankAccountNumber),
                            bankAccountNumberEuro: seller.bankAccountNumberEuro !== undefined ? seller.bankAccountNumberEuro : (seller["Számlaszám (EUR)"] || existingSeller.bankAccountNumberEuro),
                            ibanEuro: seller.ibanEuro !== undefined ? seller.ibanEuro : (seller["IBAN (EUR)"] || existingSeller.ibanEuro),
                            nameEuro: seller.nameEuro !== undefined ? seller.nameEuro : (seller["Kedvezményezett (EUR)"] || seller["Kedvezmenyezett (EUR)"] || existingSeller.nameEuro),
                            taxNumber: seller.taxNumber !== undefined ? seller.taxNumber : (seller["Adószám"] || seller["Adoszam"] || existingSeller.taxNumber),
                            email: seller.email !== undefined ? seller.email : (seller["Email"] || existingSeller.email),
                            representative: seller.representative !== undefined ? seller.representative : (seller["Képviselő"] || existingSeller.representative),
                            active: seller.active !== undefined ? seller.active : (seller["Aktív"] !== undefined ? seller["Aktív"] : existingSeller.active),
                        }
                    });
                    updatedCount++;
                } else {
                    // Optional: Create new if not found? 
                    // For safety, let's only update existing ones for this specific task, 
                    // or Create if enough data. The user prompt implies updating existing "BakonyOrszág".
                    // Let's Log that we couldn't find it.
                    errors.push(`Nem található szervezet: ${seller.name || seller.id}`);
                }
            } catch (err: any) {
                console.error(`Error updating seller ${seller.name}:`, err);
                errors.push(`Hiba ${seller.name} frissítésekor: ${err.message}`);
            }
        }

        revalidatePath("/secretroom75/sellers");

        if (updatedCount === 0 && errors.length > 0) {
            return { success: false, error: errors.join(", ") };
        }

        return { success: true, count: updatedCount, errors: errors.length > 0 ? errors : undefined };

    } catch (error) {
        console.error("Import error:", error);
        return { success: false, error: "Váratlan hiba történt importálás közben" };
    }
}
