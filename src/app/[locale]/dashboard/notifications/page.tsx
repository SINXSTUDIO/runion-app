import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getUserNotifications } from '@/actions/notifications';
import NotificationList from '@/components/dashboard/NotificationList';

export default async function NotificationsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await auth();
    const t = await getTranslations('Dashboard.Notifications');

    if (!session?.user) {
        redirect(`/${locale}/login`);
    }

    const dbNotifications = await getUserNotifications();

    // Map Prisma objects to interface if needed, or just pass directly if compatible
    const notifications = dbNotifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        read: n.read,
        timestamp: n.createdAt,
        link: n.link
    }));

    const labels = {
        title: t('title'),
        noNew: t('noNew'),
        unreadCount: t('unreadCount'),
        markAllRead: t('markAllRead'),
        emptyTitle: t('emptyTitle'),
        emptyDesc: t('emptyDesc'),
    };

    return (
        <NotificationList
            initialNotifications={notifications}
            locale={locale}
            labels={labels}
        />
    );
}
