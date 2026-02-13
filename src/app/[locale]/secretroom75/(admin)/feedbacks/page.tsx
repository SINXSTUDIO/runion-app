import { getTranslations } from 'next-intl/server';
import { FeedbackList } from '@/components/admin/FeedbackList';
import { prisma } from '@/lib/prisma';

export default async function FeedbacksPage() {
    const t = await getTranslations('Admin.Feedbacks');

    // Fetch data directly in server component for simplicity or use a server action wrapper
    const feedbacks = await prisma.feedback.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true
                }
            }
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-white">
                        Visszajelzések
                    </h1>
                    <p className="text-zinc-400 mt-2">
                        Felhasználói hibajelentések és észrevételek kezelése
                    </p>
                </div>
            </div>

            <FeedbackList initialFeedbacks={feedbacks} />
        </div>
    );
}
