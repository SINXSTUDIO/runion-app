import { eventRepository } from '@/lib/repositories';
import { serializeData } from '@/lib/utils/serialization';
import { prisma } from '@/lib/prisma';
import { handleError, createErrorResponse, createSuccessResponse } from '@/lib/error-handler';

/**
 * Event Service - Business logic for events
 */
export class EventService {
    /**
     * Get published events with serialized data
     */
    async getPublishedEvents() {
        try {
            const events = await eventRepository.getPublishedEvents();
            return createSuccessResponse(serializeData(events));
        } catch (error) {
            handleError(error, 'Események betöltése sikertelen');
            return createErrorResponse(error, 'Események betöltése sikertelen');
        }
    }

    /**
     * Get event by slug
     */
    async getEventBySlug(slug: string) {
        try {
            const event = await eventRepository.getBySlug(slug);
            if (!event) {
                return { success: false, error: 'Event not found' };
            }
            return createSuccessResponse(serializeData(event));
        } catch (error) {
            handleError(error, `Esemény betöltése sikertelen: ${slug}`);
            return createErrorResponse(error, 'Esemény betöltése sikertelen');
        }
    }

    /**
     * Update event form config
     */
    async updateFormConfig(eventId: string, config: any) {
        try {
            await eventRepository.update(
                { id: eventId },
                { formConfig: config }
            );
            return createSuccessResponse(undefined);
        } catch (error) {
            handleError(error, 'Form konfiguráció frissítése sikertelen');
            return createErrorResponse(error, 'Form konfiguráció frissítése sikertelen');
        }
    }

    /**
     * Delete event with full audit logging
     */
    async deleteEvent(id: string) {
        try {
            // Fetch full event data before deletion for audit log
            const event = await eventRepository.getWithFullRelations(id);

            if (!event) {
                return { success: false, error: 'Event not found' };
            }

            // Log the deletion with FULL snapshot
            const { logAuditAction } = await import('@/lib/audit-logger');
            await logAuditAction('DELETE', 'Event', id, {
                ...(event as any),
                totalDistances: (event as any).distances?.length || 0,
                totalRegistrations: (event as any).distances?.reduce((sum: number, d: any) => sum + (d.registrations?.length || 0), 0) || 0,
            });

            // Manually delete relations (schema has no Cascade)
            const distances = (event as any).distances || [];
            const distanceIds = distances.map((d: any) => d.id);

            // Delete registrations for these distances
            if (distanceIds.length > 0) {
                await prisma.registration.deleteMany({
                    where: { distanceId: { in: distanceIds } }
                });
                console.log(`[DeleteEvent] Deleted ${distances.reduce((sum: number, d: any) => sum + (d.registrations?.length || 0), 0)} registrations`);
            }

            // Delete distances
            await prisma.distance.deleteMany({ where: { eventId: id } });
            console.log(`[DeleteEvent] Deleted ${distances.length} distances`);

            // Delete event
            await eventRepository.delete({ id });
            console.log(`[DeleteEvent] ✅ Event ${id} deleted successfully`);

            return createSuccessResponse(undefined);
        } catch (error) {
            handleError(error, 'Esemény törlése sikertelen');
            return createErrorResponse(error, 'Esemény törlése sikertelen');
        }
    }

    /**
     * Duplicate event
     */
    async duplicateEvent(id: string) {
        try {
            const existing = await eventRepository.findById(id, { distances: true });

            if (!existing) {
                return { success: false, error: 'Event not found' };
            }

            // Properly exclude all system and relational fields
            const {
                id: _,
                slug,
                createdAt,
                updatedAt,
                status,
                distances,
                organizerId,
                sellerId,
                sortOrder,
                ...otherData
            } = existing as any;

            const newEvent = await prisma.event.create({
                data: {
                    ...otherData,
                    slug: `${slug}-copy-${Date.now()}`,
                    title: `${existing.title} (Másolat)`,
                    titleEn: existing.titleEn ? `${existing.titleEn} (Copy)` : null,
                    titleDe: existing.titleDe ? `${existing.titleDe} (Kopie)` : null,
                    status: 'DRAFT',
                    organizerId: organizerId,
                    sellerId: sellerId,
                    sortOrder: sortOrder || 0,
                    distances: {
                        create: (distances || []).map((d: any) => ({
                            name: d.name,
                            nameEn: d.nameEn,
                            nameDe: d.nameDe,
                            description: d.description,
                            price: d.price,
                            priceEur: d.priceEur,
                            capacityLimit: d.capacityLimit,
                            startTime: d.startTime,
                            crewPricing: d.crewPricing as any
                        }))
                    }
                }
            });

            return createSuccessResponse({ newId: newEvent.id });
        } catch (error) {
            handleError(error, 'Esemény duplikálása sikertelen');
            return createErrorResponse(error, 'Esemény duplikálása sikertelen');
        }
    }
}

export const eventService = new EventService();

