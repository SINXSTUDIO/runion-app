import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma module BEFORE imports
vi.mock('@/lib/prisma', () => {
    const mockEvent = {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
    };

    return {
        prisma: { event: mockEvent },
        default: { event: mockEvent },
    };
});

// Import AFTER mock
import { EventRepository } from '@/lib/repositories/event-repository';
import { prisma } from '@/lib/prisma';
import { createMockEvent } from '../../setup/factories';
import { EventStatus } from '@prisma/client';

describe('EventRepository', () => {
    let eventRepository: EventRepository;

    beforeEach(() => {
        eventRepository = new EventRepository();
        vi.clearAllMocks();
    });

    describe('getPublishedEvents', () => {
        it('should return published events with future dates', async () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 10);

            const publishedEvents = [
                createMockEvent({
                    status: EventStatus.PUBLISHED,
                    eventDate: futureDate,
                    endDate: futureDate
                }),
            ];
            (prisma.event.findMany as any).mockResolvedValue(publishedEvents);

            const result = await eventRepository.getPublishedEvents();

            expect(result).toEqual(publishedEvents);
            expect(prisma.event.findMany).toHaveBeenCalled();
            // Verify the where clause includes status and date filters
            const callArgs = (prisma.event.findMany as any).mock.calls[0][0];
            expect(callArgs.where.status).toBe(EventStatus.PUBLISHED);
            expect(callArgs.where.OR).toBeDefined();
        });

        it('should return empty array when no published events', async () => {
            (prisma.event.findMany as any).mockResolvedValue([]);

            const result = await eventRepository.getPublishedEvents();

            expect(result).toHaveLength(0);
        });

        it('should include distances, organizer, and seller relations', async () => {
            (prisma.event.findMany as any).mockResolvedValue([]);

            await eventRepository.getPublishedEvents();

            const callArgs = (prisma.event.findMany as any).mock.calls[0][0];
            expect(callArgs.include.distances).toBeDefined();
            expect(callArgs.include.organizer).toBeDefined();
            expect(callArgs.include.seller).toBeDefined();
        });
    });

    describe('getBySlug', () => {
        it('should return event by slug with relations', async () => {
            const mockEvent = createMockEvent({
                slug: 'test-event',
                distances: [{ id: 'dist-1', name: '10K' }],
            });
            (prisma.event.findUnique as any).mockResolvedValue(mockEvent);

            const result = await eventRepository.getBySlug('test-event');

            expect(result).toEqual(mockEvent);
            expect(prisma.event.findUnique).toHaveBeenCalled();
            const callArgs = (prisma.event.findUnique as any).mock.calls[0][0];
            expect(callArgs.where.slug).toBe('test-event');
            expect(callArgs.include.distances).toBeDefined();
            expect(callArgs.include.organizer).toBeDefined();
        });

        it('should return null when slug does not exist', async () => {
            (prisma.event.findUnique as any).mockResolvedValue(null);

            const result = await eventRepository.getBySlug('non-existent');

            expect(result).toBeNull();
        });
    });

    describe('getWithFullRelations', () => {
        it('should return event with all relations for admin', async () => {
            const eventId = 'test-event-id';
            const mockEvent = createMockEvent({
                id: eventId,
                distances: [
                    {
                        id: 'dist-1',
                        registrations: [{ id: 'reg-1' }],
                        priceTiers: [{ id: 'tier-1' }]
                    }
                ],
            });
            (prisma.event.findUnique as any).mockResolvedValue(mockEvent);

            const result = await eventRepository.getWithFullRelations(eventId);

            expect(result).toEqual(mockEvent);
            expect(prisma.event.findUnique).toHaveBeenCalled();
            const callArgs = (prisma.event.findUnique as any).mock.calls[0][0];
            expect(callArgs.where.id).toBe(eventId);
            expect(callArgs.include.distances).toBeDefined();
        });
    });

    describe('getAllEvents', () => {
        it('should return all events with basic relations', async () => {
            const allEvents = [
                createMockEvent({ title: 'Event 1', status: EventStatus.PUBLISHED }) as any,
                createMockEvent({ title: 'Event 2', status: EventStatus.DRAFT }) as any,
                createMockEvent({ title: 'Event 3', status: EventStatus.CANCELLED }) as any,
            ];
            (prisma.event.findMany as any).mockResolvedValue(allEvents);

            const result = await eventRepository.getAllEvents();

            expect(result).toHaveLength(3);
            expect(result).toEqual(allEvents);
            expect(prisma.event.findMany).toHaveBeenCalled();
            const callArgs = (prisma.event.findMany as any).mock.calls[0][0];
            expect(callArgs.include.distances).toBe(true);
            expect(callArgs.include.organizer).toBeDefined();
            expect(callArgs.orderBy.eventDate).toBe('desc');
        });

        it('should return empty array when no events exist', async () => {
            (prisma.event.findMany as any).mockResolvedValue([]);

            const result = await eventRepository.getAllEvents();

            expect(result).toHaveLength(0);
        });
    });

    describe('Base CRUD operations', () => {
        describe('create', () => {
            it('should create new event', async () => {
                const newEvent = createMockEvent({ title: 'New Event' });
                (prisma.event.create as any).mockResolvedValue(newEvent);

                const eventData = {
                    title: 'New Event',
                    slug: 'new-event',
                    description: 'Test description',
                    status: EventStatus.DRAFT,
                    eventDate: new Date(),
                    location: 'Budapest',
                };

                const result = await eventRepository.create(eventData as any);

                expect(result).toEqual(newEvent);
                expect(prisma.event.create).toHaveBeenCalledWith({
                    data: eventData,
                });
            });
        });

        describe('update', () => {
            it('should update event', async () => {
                const eventId = 'test-event-id';
                const updatedEvent = createMockEvent({
                    id: eventId,
                    title: 'Updated Title'
                });
                (prisma.event.update as any).mockResolvedValue(updatedEvent);

                const updateData = { title: 'Updated Title' };

                const result = await eventRepository.update({ id: eventId }, updateData as any);

                expect(result.title).toBe('Updated Title');
                expect(prisma.event.update).toHaveBeenCalledWith({
                    where: { id: eventId },
                    data: updateData,
                });
            });
        });

        describe('delete', () => {
            it('should delete event', async () => {
                const eventId = 'test-event-id';
                const deletedEvent = createMockEvent({ id: eventId });
                (prisma.event.delete as any).mockResolvedValue(deletedEvent);

                const result = await eventRepository.delete({ id: eventId });

                expect(result).toEqual(deletedEvent);
                expect(prisma.event.delete).toHaveBeenCalledWith({
                    where: { id: eventId },
                });
            });
        });

        describe('findById', () => {
            it('should find event by id', async () => {
                const eventId = 'test-event-id';
                const mockEvent = createMockEvent({ id: eventId });
                (prisma.event.findUnique as any).mockResolvedValue(mockEvent);

                const result = await eventRepository.findById(eventId);

                expect(result).toEqual(mockEvent);
                expect(prisma.event.findUnique).toHaveBeenCalledWith({
                    where: { id: eventId },
                    include: undefined,
                });
            });
        });
    });
});
