'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth-checks';

export async function updateUserRole(userId: string, role: string) {
    await requireAdmin();

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: role as any }
        });
        revalidatePath('/secretroom75/users');
        return { success: true };
    } catch (error) {
        console.error('Error updating user role:', error);
        return { success: false, error: 'Hiba történt a jogosultság frissítésekor.' };
    }
}

export async function deleteUser(userId: string) {
    await requireAdmin();

    try {
        await prisma.user.delete({
            where: { id: userId }
        });
        revalidatePath('/secretroom75/users');
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: 'Hiba történt a felhasználó törlésekor. Valószínűleg kapcsolódó adatai (pl. nevezések) vannak.' };
    }
}

export async function updateUserMembership(userId: string, tierId: string | null) {
    await requireAdmin();

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                membershipTierId: tierId || null,
                // Default to 1 year if setting for the first time or keep old if just changing?
                // For now, let's just update the ID as requested.
            }
        });
        revalidatePath('/secretroom75/users');
        return { success: true };
    } catch (error) {
        console.error('Error updating user membership:', error);
        return { success: false, error: 'Hiba történt a tagság frissítésekor.' };
    }
}
