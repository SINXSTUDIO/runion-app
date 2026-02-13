'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCircle, Info, AlertCircle, XCircle } from 'lucide-react';
import { markNotificationRead, markAllNotificationsRead } from '@/actions/notifications';
import { toast } from 'sonner';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    timestamp: Date;
    link?: string | null;
}

interface NotificationListProps {
    initialNotifications: Notification[];
    locale: string;
    labels: {
        title: string;
        noNew: string;
        unreadCount: string;
        markAllRead: string;
        emptyTitle: string;
        emptyDesc: string;
    };
}

export default function NotificationList({ initialNotifications, locale, labels }: NotificationListProps) {
    const [notifications, setNotifications] = useState(initialNotifications);
    const router = useRouter();

    const unreadCount = notifications.filter(n => !n.read).length;

    const getNotificationConfig = (type: string) => {
        switch (type) {
            case 'success':
                return {
                    icon: CheckCircle,
                    color: 'emerald',
                    bgColor: 'bg-emerald-500/10',
                    borderColor: 'border-emerald-500/30',
                    iconColor: 'text-emerald-400',
                };
            case 'warning':
                return {
                    icon: AlertCircle,
                    color: 'amber',
                    bgColor: 'bg-amber-500/10',
                    borderColor: 'border-amber-500/30',
                    iconColor: 'text-amber-400',
                };
            case 'error':
                return {
                    icon: XCircle,
                    color: 'red',
                    bgColor: 'bg-red-500/10',
                    borderColor: 'border-red-500/30',
                    iconColor: 'text-red-400',
                };
            default:
                return {
                    icon: Info,
                    color: 'blue',
                    bgColor: 'bg-blue-500/10',
                    borderColor: 'border-blue-500/30',
                    iconColor: 'text-blue-400',
                };
        }
    };

    const handleMarkRead = async (id: string, currentRead: boolean, link?: string | null) => {
        if (!currentRead) {
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

            const result = await markNotificationRead(id);
            if (!result.success) {
                // Revert on failure
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
                toast.error('Hiba történt.');
            } else {
                router.refresh(); // Refresh server data
            }
        }

        if (link) {
            router.push(link);
        }
    };

    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        const result = await markAllNotificationsRead();
        if (result.success) {
            toast.success('Összes olvasottnak jelölve');
            router.refresh();
        } else {
            toast.error('Hiba történt.');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black italic text-white mb-2 flex items-center gap-3">
                        <Bell className="w-8 h-8 text-accent" />
                        {labels.title}
                    </h1>
                    <p className="text-zinc-400">
                        {unreadCount > 0 ? (
                            <span>
                                <span className="text-accent font-bold">{unreadCount}</span> {labels.unreadCount.replace('{count}', '')}
                            </span>
                        ) : (
                            labels.noNew
                        )}
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                    >
                        {labels.markAllRead}
                    </button>
                )}
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
                {notifications.length > 0 ? (
                    notifications.map((notification, index) => {
                        const config = getNotificationConfig(notification.type);
                        const NotificationIcon = config.icon;

                        return (
                            <div
                                key={notification.id}
                                onClick={() => handleMarkRead(notification.id, notification.read, notification.link)}
                                className={`
                  ${config.bgColor} 
                  border ${config.borderColor}
                  rounded-2xl p-6
                  backdrop-blur-sm
                  hover:scale-[1.02] transition-all duration-300
                  cursor-pointer
                  ${!notification.read ? 'shadow-lg shadow-accent/5 ring-1 ring-accent/20' : 'opacity-75'}
                  animate-in slide-in-from-bottom-4 fade-in
                `}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 bg-gradient-to-br from-${config.color}-500 to-${config.color}-600 rounded-xl flex-shrink-0`}>
                                        <NotificationIcon className="w-6 h-6 text-white" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className={`text-lg font-bold ${!notification.read ? 'text-white' : 'text-zinc-400'}`}>
                                                {notification.title}
                                            </h3>
                                            {!notification.read && (
                                                <span className="ml-2 w-2 h-2 bg-accent rounded-full animate-pulse flex-shrink-0" />
                                            )}
                                        </div>

                                        <p className="text-zinc-300 mb-3">{notification.message}</p>

                                        <p className="text-xs text-zinc-500">
                                            {new Date(notification.timestamp).toLocaleString(locale, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
                        <Bell className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">{labels.emptyTitle}</h3>
                        <p className="text-zinc-400">{labels.emptyDesc}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
