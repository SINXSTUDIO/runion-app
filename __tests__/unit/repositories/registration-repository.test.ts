import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma module BEFORE imports
vi.mock('@/lib/prisma', () => {
    const mockRegistration = {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
    };

    return {
        prisma: { registration: mockRegistration },
        default: { registration: mockRegistration },
    };
});

// Import AFTER mock
import { RegistrationRepository } from '@/lib/repositories/registration-repository';
import { prisma } from '@/lib/prisma';
import { createMockRegistration, createMockUser, createMockEvent } from '../../setup/factories';
import { RegistrationStatus } from '@prisma/client';

describe('RegistrationRepository', () => {
    let registrationRepository: RegistrationRepository;

    beforeEach(() => {
        registrationRepository = new RegistrationRepository();
        vi.clearAllMocks();
    });

    describe('getUserRegistrations', () => {
        it('should return all registrations for a user with distance and event details', async () => {
            const userId = 'test-user-id';
            const mockRegistrations = [
                createMockRegistration({
                    userId,
                    registrationStatus: RegistrationStatus.CONFIRMED,
                    distance: {
                        id: 'dist-1',
                        name: '10K',
                        event: {
                            title: 'Test Marathon',
                            eventDate: new Date(),
                            location: 'Budapest',
                            coverImage: 'image.jpg',
                        }
                    }
                }),
            ];
            (prisma.registration.findMany as any).mockResolvedValue(mockRegistrations);

            const result = await registrationRepository.getUserRegistrations(userId);

            expect(result).toEqual(mockRegistrations);
            expect(prisma.registration.findMany).toHaveBeenCalled();
            const callArgs = (prisma.registration.findMany as any).mock.calls[0][0];
            expect(callArgs.where.userId).toBe(userId);
            expect(callArgs.include.distance).toBeDefined();
            expect(callArgs.include.distance.include.event).toBeDefined();
            expect(callArgs.orderBy.createdAt).toBe('desc');
        });

        it('should return empty array when user has no registrations', async () => {
            (prisma.registration.findMany as any).mockResolvedValue([]);

            const result = await registrationRepository.getUserRegistrations('user-id');

            expect(result).toHaveLength(0);
        });
    });

    describe('getEventRegistrations', () => {
        it('should return all registrations for an event with user and distance info', async () => {
            const eventId = 'test-event-id';
            const mockRegistrations = [
                createMockRegistration({
                    registrationStatus: RegistrationStatus.CONFIRMED,
                    user: {
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john@example.com',
                    },
                    distance: {
                        name: '10K',
                    }
                }),
            ];
            (prisma.registration.findMany as any).mockResolvedValue(mockRegistrations);

            const result = await registrationRepository.getEventRegistrations(eventId);

            expect(result).toEqual(mockRegistrations);
            expect(prisma.registration.findMany).toHaveBeenCalled();
            const callArgs = (prisma.registration.findMany as any).mock.calls[0][0];
            expect(callArgs.where.distance.eventId).toBe(eventId);
            expect(callArgs.include.user).toBeDefined();
            expect(callArgs.include.distance).toBeDefined();
        });

        it('should return empty array when event has no registrations', async () => {
            (prisma.registration.findMany as any).mockResolvedValue([]);

            const result = await registrationRepository.getEventRegistrations('event-id');

            expect(result).toHaveLength(0);
        });
    });

    describe('getWithFullDetails', () => {
        it('should return registration with user, distance, and event details', async () => {
            const registrationId = 'test-reg-id';
            const mockRegistration = createMockRegistration({
                id: registrationId,
                user: createMockUser(),
                distance: {
                    id: 'dist-1',
                    name: '10K',
                    event: createMockEvent(),
                }
            });
            (prisma.registration.findUnique as any).mockResolvedValue(mockRegistration);

            const result = await registrationRepository.getWithFullDetails(registrationId);

            expect(result).toEqual(mockRegistration);
            expect(prisma.registration.findUnique).toHaveBeenCalled();
            const callArgs = (prisma.registration.findUnique as any).mock.calls[0][0];
            expect(callArgs.where.id).toBe(registrationId);
            expect(callArgs.include.user).toBe(true);
            expect(callArgs.include.distance).toBeDefined();
            expect(callArgs.include.distance.include.event).toBe(true);
        });

        it('should return null when registration not found', async () => {
            (prisma.registration.findUnique as any).mockResolvedValue(null);

            const result = await registrationRepository.getWithFullDetails('non-existent');

            expect(result).toBeNull();
        });
    });

    describe('Base CRUD operations', () => {
        describe('create', () => {
            it('should create new registration', async () => {
                const newRegistration = createMockRegistration({
                    userId: 'user-id',
                    distanceId: 'distance-id',
                });
                (prisma.registration.create as any).mockResolvedValue(newRegistration);

                const registrationData = {
                    userId: 'user-id',
                    distanceId: 'distance-id',
                    registrationStatus: RegistrationStatus.PENDING,
                    formData: { firstName: 'Test', lastName: 'User' },
                    finalPrice: 5000,
                };

                const result = await registrationRepository.create(registrationData as any);

                expect(result).toEqual(newRegistration);
                expect(prisma.registration.create).toHaveBeenCalledWith({
                    data: registrationData,
                });
            });
        });

        describe('update', () => {
            it('should update registration status', async () => {
                const registrationId = 'test-reg-id';
                const updatedRegistration = createMockRegistration({
                    id: registrationId,
                    registrationStatus: RegistrationStatus.CONFIRMED,
                });
                (prisma.registration.update as any).mockResolvedValue(updatedRegistration);

                const result = await registrationRepository.update(
                    { id: registrationId },
                    { registrationStatus: RegistrationStatus.CONFIRMED } as any
                );

                expect(result.registrationStatus).toBe(RegistrationStatus.CONFIRMED);
                expect(prisma.registration.update).toHaveBeenCalledWith({
                    where: { id: registrationId },
                    data: { registrationStatus: RegistrationStatus.CONFIRMED },
                });
            });
        });

        describe('delete', () => {
            it('should delete registration', async () => {
                const registrationId = 'test-reg-id';
                const deletedRegistration = createMockRegistration({ id: registrationId });
                (prisma.registration.delete as any).mockResolvedValue(deletedRegistration);

                const result = await registrationRepository.delete({ id: registrationId });

                expect(result).toEqual(deletedRegistration);
                expect(prisma.registration.delete).toHaveBeenCalledWith({
                    where: { id: registrationId },
                });
            });
        });

        describe('findById', () => {
            it('should find registration by id', async () => {
                const registrationId = 'test-reg-id';
                const mockRegistration = createMockRegistration({ id: registrationId });
                (prisma.registration.findUnique as any).mockResolvedValue(mockRegistration);

                const result = await registrationRepository.findById(registrationId);

                expect(result).toEqual(mockRegistration);
                expect(prisma.registration.findUnique).toHaveBeenCalledWith({
                    where: { id: registrationId },
                    include: undefined,
                });
            });
        });
    });
});
