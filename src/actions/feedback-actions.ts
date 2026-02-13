'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { FeedbackType, FeedbackStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL_NOTIFICATIONS || 'info@sinxstudio.com';

export type FeedbackInput = {
    type: FeedbackType;
    subject: string;
    message: string;
};

export async function createFeedback(data: FeedbackInput) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'Authorization required' };
        }

        // @ts-ignore - Prisma types might not be updated in editor yet
        const feedback = await prisma.feedback.create({
            data: {
                userId: session.user.id,
                type: data.type,
                subject: data.subject,
                message: data.message,
                status: 'PENDING',
            },
            include: {
                user: {
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        // Send notification email to Admin
        const emailContent = `
            <h2>Új Visszajelzés Érkezett</h2>
            <p><strong>Felhasználó:</strong> ${feedback.user.firstName} ${feedback.user.lastName} (${feedback.user.email})</p>
            <p><strong>Típus:</strong> ${data.type}</p>
            <p><strong>Tárgy:</strong> ${data.subject}</p>
            <p><strong>Üzenet:</strong></p>
            <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">${data.message}</pre>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/secretroom75/feedbacks">Megtekintés az Admin felületen</a></p>
        `;

        await sendEmail({
            to: ADMIN_EMAIL,
            subject: `[RUNION Feedback] ${data.subject}`,
            html: emailContent
        });

        revalidatePath('/dashboard/profile');
        return { success: true, feedback };

    } catch (error) {
        console.error('Error creating feedback:', error);
        return { success: false, error: 'Failed to create feedback' };
    }
}

export async function getMyFeedbacks() {
    const session = await auth();
    if (!session?.user?.id) return [];

    // @ts-ignore
    return await prisma.feedback.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
    });
}

export async function respondToFeedback(feedbackId: string, response: string) {
    try {
        const session = await auth();
        // @ts-ignore
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized' };
        }

        // @ts-ignore
        const feedback = await prisma.feedback.update({
            where: { id: feedbackId },
            data: {
                adminResponse: response,
                status: 'RESOLVED',
            },
            include: { user: true }
        });

        // Create internal notification for the user
        // @ts-ignore
        await prisma.notification.create({
            data: {
                userId: feedback.userId,
                title: 'Válasz érkezett a visszajelzésedre',
                message: `Az adminisztrátor válaszolt a következő témájú visszajelzésedre: "${feedback.subject}".`,
                type: 'info',
                link: '/dashboard/profile' // Or wherever the user can see feedbacks
            }
        });

        revalidatePath('/secretroom75/feedbacks');
        return { success: true };
    } catch (error) {
        console.error('Error responding to feedback:', error);
        return { success: false, error: 'Failed to respond' };
    }
}
