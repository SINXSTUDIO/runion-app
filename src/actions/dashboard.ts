'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { serializeData } from '@/lib/utils/serialization';

export async function getUserRegistrations() {
    const session = await auth();
    if (!session?.user) return null;

    try {
        const registrations = await prisma.registration.findMany({
            where: { userId: session.user.id },
            include: {
                distance: {
                    include: {
                        event: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                eventDate: true,
                                location: true,
                                formConfig: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map registrations to flatten event structure for the component
        const mappedRegistrations = registrations
            .filter(reg => reg.distance && (reg.distance as any).event) // Safety check for orphaned registrations
            .map(reg => ({
                ...reg,
                event: (reg.distance as any).event
            }));

        return serializeData(mappedRegistrations) as any;
    } catch (error) {
        console.error('Failed to fetch user registrations:', error);
        return [];
    }
}
