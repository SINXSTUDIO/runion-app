'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ... existing code ...
export async function getUserNotifications() {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
        });
        return notifications;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
}

export async function getUnreadNotificationCount() {
    const session = await auth();
    if (!session?.user?.id) return 0;

    try {
        const count = await prisma.notification.count({
            where: {
                userId: session.user.id,
                read: false
            }
        });
        return count;
    } catch (error) {
        console.error('Error fetching unread notification count:', error);
        return 0;
    }
}
// ... existing code ...

export async function markNotificationRead(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false };

    try {
        await prisma.notification.update({
            where: { id, userId: session.user.id }, // Ensure ownership
            data: { read: true },
        });
        revalidatePath('/dashboard/notifications');
        return { success: true };
    } catch (error) {
        console.error('Error marking notification read:', error);
        return { success: false };
    }
}

export async function markAllNotificationsRead() {
    const session = await auth();
    if (!session?.user?.id) return { success: false };

    try {
        await prisma.notification.updateMany({
            where: { userId: session.user.id, read: false },
            data: { read: true },
        });
        revalidatePath('/dashboard/notifications');
        return { success: true };
    } catch (error) {
        console.error('Error marking all notifications read:', error);
        return { success: false };
    }
}

// Internal use primarily
export async function createNotification(userId: string, title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info', link?: string) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link
            }
        });
        return { success: true };
    } catch (error) {
        console.error('Error creating notification:', error);
        return { success: false };
    }
}
