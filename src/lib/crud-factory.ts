import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-checks";

/**
 * Generic delete function for any Prisma model
 */
export async function genericDelete<T>(
    model: any,
    id: string,
    revalidatePaths: string[]
) {
    try {
        await requireAdmin();
        await model.delete({ where: { id } });

        revalidatePaths.forEach(path => revalidatePath(path));
        return { success: true };
    } catch (error) {
        console.error("Generic delete error:", error);
        return { success: false, error: "Hiba történt a törlés során." };
    }
}

/**
 * Generic reorder function for items with an 'order' field
 */
export async function genericReorder(
    model: any,
    items: { id: string, order: number }[],
    revalidatePaths: string[]
) {
    try {
        await requireAdmin();
        // Transaction ensures atomicity
        await prisma.$transaction(
            items.map((item) =>
                model.update({
                    where: { id: item.id },
                    data: { order: item.order },
                })
            )
        );

        revalidatePaths.forEach(path => revalidatePath(path));
        return { success: true };
    } catch (error) {
        console.error("Generic reorder error:", error);
        return { success: false, error: "Hiba történt a sorrend mentésekor." };
    }
}

/**
 * Generic duplicate function
 * Assumes the model has 'name' or 'title' field that we append '(Másolat)' to.
 * Sets 'active' to false by default.
 */
export async function genericDuplicate(
    model: any,
    id: string,
    titleField: 'name' | 'title',
    revalidatePaths: string[]
) {
    try {
        await requireAdmin();
        const item = await model.findUnique({ where: { id } });
        if (!item) throw new Error("Item not found");

        const { id: _, createdAt, updatedAt, ...data } = item;

        // Create the copy
        await model.create({
            data: {
                ...data,
                [titleField]: `${data[titleField]} (Másolat)`,
                active: false
            }
        });

        revalidatePaths.forEach(path => revalidatePath(path));
        return { success: true };
    } catch (error) {
        console.error("Generic duplicate error:", error);
        return { success: false, error: "Hiba történt a duplikálás során." };
    }
}

/**
 * Generic fetch function (no auth check needed usually for public data, but good to have helper)
 */
export async function genericFetch<T>(model: any, orderBy: object = { order: 'asc' }) {
    try {
        return await model.findMany({ orderBy });
    } catch (error) {
        console.error("Generic fetch error:", error);
        return [];
    }
}
