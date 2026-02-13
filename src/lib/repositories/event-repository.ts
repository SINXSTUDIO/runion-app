import { BaseRepository } from './base/base-repository';
import { Event, EventStatus, Prisma } from '@prisma/client';

export class EventRepository extends BaseRepository<
    Event,
    Prisma.EventCreateInput,
    Prisma.EventUpdateInput,
    Prisma.EventWhereUniqueInput
> {
    protected modelName = 'Event' as Prisma.ModelName;

    /**
     * Get all published events (with future dates)
     */
    async getPublishedEvents() {
        const now = new Date();

        return this.findMany({
            where: {
                status: EventStatus.PUBLISHED,
                OR: [
                    { endDate: { gte: now } },
                    {
                        AND: [
                            { endDate: null },
                            { eventDate: { gte: now } }
                        ]
                    }
                ]
            },
            include: {
                distances: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                    },
                    orderBy: { price: 'asc' }
                },
                organizer: {
                    select: {
                        clubName: true,
                        firstName: true,
                        lastName: true,
                    }
                },
                seller: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            orderBy: { eventDate: 'asc' }
        });
    }

    /**
     * Get event by slug (published only)
     */
    async getBySlug(slug: string) {
        return this.findUnique(
            { slug },
            {
                distances: {
                    include: {
                        _count: { select: { registrations: true } },
                        priceTiers: { orderBy: { validFrom: 'asc' } }
                    },
                    orderBy: { price: 'asc' }
                },
                organizer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        clubName: true
                    }
                }
            }
        );
    }

    /**
     * Get event with full relations (for admin)
     */
    async getWithFullRelations(id: string) {
        return this.findById(id, {
            distances: {
                include: {
                    registrations: true,
                    priceTiers: true,
                },
            },
        });
    }

    /**
     * Get all events (admin)
     */
    async getAllEvents() {
        return this.findMany({
            include: {
                distances: true,
                organizer: {
                    select: {
                        firstName: true,
                        lastName: true,
                    }
                }
            },
            orderBy: { eventDate: 'desc' }
        });
    }
}
