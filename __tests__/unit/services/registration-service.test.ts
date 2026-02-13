import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock registrationRepository and serializeData
vi.mock('@/lib/repositories', () => ({
    registrationRepository: {
        getUserRegistrations: vi.fn(),
        getEventRegistrations: vi.fn(),
        getWithFullDetails: vi.fn(),
    },
}));

vi.mock('@/lib/utils/serialization', () => ({
    serializeData: vi.fn((data) => data), // Pass-through mock
}));

// Import AFTER mock
import { RegistrationService } from '@/lib/services/registration-service';
import { registrationRepository } from '@/lib/repositories';
import { createMockRegistration, createMockEvent } from '../../setup/factories';
import { RegistrationStatus } from '@prisma/client';

describe('RegistrationService', () => {
    let registrationService: RegistrationService;

    beforeEach(() => {
        registrationService = new RegistrationService();
        vi.clearAllMocks();
    });

    describe('getUserRegistrations', () => {
        it('should return user registrations with event details', async () => {
            const userId = 'test-user-id';
            const mockRegistrations = [
                createMockRegistration({
                    userId,
                    distance: {
                        id: 'dist-1',
                        name: '10K',
                        event: {
                            title: 'Test Marathon',
                            eventDate: new Date(),
                            location: 'Budapest',
                        }
                    }
                }),
            ];
            (registrationRepository.getUserRegistrations as any).mockResolvedValue(mockRegistrations);

            const result = await registrationService.getUserRegistrations(userId);

            expect(result.success).toBe(true);
            expect((result as any).data).toEqual(mockRegistrations as any);
            expect(registrationRepository.getUserRegistrations).toHaveBeenCalledWith(userId);
        });

        it('should handle errors when fetching user registrations', async () => {
            const error = new Error('Database error');
            (registrationRepository.getUserRegistrations as any).mockRejectedValue(error);

            const result = await registrationService.getUserRegistrations('user-id');

            expect(result.success).toBe(false);
            expect((result as any).error).toContain('Database error');
        });
    });

    describe('getEventRegistrations', () => {
        it('should return event registrations with user details', async () => {
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
            (registrationRepository.getEventRegistrations as any).mockResolvedValue(mockRegistrations);

            const result = await registrationService.getEventRegistrations(eventId);

            expect(result.success).toBe(true);
            expect((result as any).data).toEqual(mockRegistrations as any);
            expect(registrationRepository.getEventRegistrations).toHaveBeenCalledWith(eventId);
        });

        it('should handle errors when fetching event registrations', async () => {
            const error = new Error('Database error');
            (registrationRepository.getEventRegistrations as any).mockRejectedValue(error);

            const result = await registrationService.getEventRegistrations('event-id');

            expect(result.success).toBe(false);
            expect((result as any).error).toContain('Database error');
        });
    });

    describe('getRegistrationDetails', () => {
        it('should return full registration details', async () => {
            const registrationId = 'test-reg-id';
            const mockRegistration = createMockRegistration({
                id: registrationId,
                user: { firstName: 'John', lastName: 'Doe' },
                distance: {
                    name: '10K',
                    event: createMockEvent({ title: 'Test Event' })
                },
            });
            (registrationRepository.getWithFullDetails as any).mockResolvedValue(mockRegistration);

            const result = await registrationService.getRegistrationDetails(registrationId);

            expect(result.success).toBe(true);
            expect((result as any).data).toEqual(mockRegistration as any);
            expect(registrationRepository.getWithFullDetails).toHaveBeenCalledWith(registrationId);
        });

        it('should return error when registration not found', async () => {
            (registrationRepository.getWithFullDetails as any).mockResolvedValue(null);

            const result = await registrationService.getRegistrationDetails('non-existent');

            expect(result.success).toBe(false);
            expect((result as any).error).toBe('Not found');
        });

        it('should handle database errors', async () => {
            const error = new Error('Connection failed');
            (registrationRepository.getWithFullDetails as any).mockRejectedValue(error);

            const result = await registrationService.getRegistrationDetails('reg-id');

            expect(result.success).toBe(false);
            expect((result as any).error).toContain('Connection failed');
        });
    });
});
