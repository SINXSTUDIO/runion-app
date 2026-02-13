import { BaseRepository } from './base/base-repository';
import { Registration, Prisma } from '@prisma/client';

export class RegistrationRepository extends BaseRepository<
    Registration,
    Prisma.RegistrationCreateInput,
    Prisma.RegistrationUpdateInput,
    Prisma.RegistrationWhereUniqueInput
> {
    protected modelName = 'Registration' as Prisma.ModelName;

    /**
     * Get user's registrations
     */
    async getUserRegistrations(userId: string) {
        return this.findMany({
            where: { userId },
            include: {
                distance: {
                    include: {
                        event: {
                            select: {
                                title: true,
                                eventDate: true,
                                location: true,
                                coverImage: true,
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get registrations for an event
     */
    async getEventRegistrations(eventId: string) {
        return this.findMany({
            where: {
                distance: {
                    eventId
                }
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                },
                distance: {
                    select: {
                        name: true,
                    }
                }
            }
        });
    }

    /**
     * Get registration with full details
     */
    async getWithFullDetails(id: string) {
        return this.findById(id, {
            user: true,
            distance: {
                include: {
                    event: true
                }
            }
        });
    }
}
