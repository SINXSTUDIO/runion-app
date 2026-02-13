'use server';

import { auth, signOut } from '@/auth';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-checks';
import { revalidatePath } from 'next/cache';

export async function forceLogoutUser(userId: string) {
    await requireAdmin();
    const { userService } = await import('@/lib/services');
    const result = await userService.forceLogout(userId);

    if (result.success) {
        revalidatePath('/secretroom75/users');
    }

    return result;
}

export async function deleteMyAccount() {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized' };
    }

    const { userService } = await import('@/lib/services');
    const result = await userService.softDeleteAccount(session.user.id);

    if (result.success) {
        // Sign out user
        await signOut({ redirect: true, redirectTo: '/' });
    }

    return result;
}

export async function logoutUser() {
    await signOut({ redirectTo: '/' });
}
