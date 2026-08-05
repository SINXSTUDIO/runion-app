import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getUserNotifications } from '@/actions/notifications';
import NotificationList from '@/components/dashboard/NotificationList';

export default async function NotificationsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await auth();
    let t: any;
    try {
        t = await getTranslations('Dashboard.Notifications');
    } catch {
        t = (key: string) => key;
    }

    if (!session?.user) {
        redirect(`/${locale}/login`);
    }

    let dbNotifications: any[] = [];
    try {
        dbNotifications = (await getUserNotifications()) || [];
    } catch (e) {
        console.error('[NotificationsPage] getUserNotifications error:', e);
    }

    // Map Prisma objects to interface with serialized ISO timestamp strings
    const notifications = dbNotifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        read: n.read,
        timestamp: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
        link: n.link
    }));

    const safeT = (key: string, fallback: string) => {
        try {
            const val = typeof t === 'function' ? t(key) : fallback;
            return val && val !== key ? val : fallback;
        } catch {
            return fallback;
        }
    };

    const labels = {
        title: safeT('title', 'Értesítések'),
        noNew: safeT('noNew', 'Nincsenek új értesítések'),
        unreadCount: safeT('unreadCount', 'Olvasatlan értesítés'),
        markAllRead: safeT('markAllRead', 'Összes megjelölése olvasottként'),
        emptyTitle: safeT('emptyTitle', 'Nincsenek értesítések'),
        emptyDesc: safeT('emptyDesc', 'Jelenleg egyetlen értesítésed sincs.'),
    };

    return (
        <NotificationList
            initialNotifications={notifications}
            locale={locale}
            labels={labels}
        />
    );
}
