import { registrationRepository } from '@/lib/repositories';
import { serializeData } from '@/lib/utils/serialization';
import { handleError, createErrorResponse, createSuccessResponse } from '@/lib/error-handler';

/**
 * Registration Service - Business logic for registrations
 */
export class RegistrationService {
    /**
     * Get user's registrations with event details
     */
    async getUserRegistrations(userId: string) {
        try {
            const registrations = await registrationRepository.getUserRegistrations(userId);
            return createSuccessResponse(serializeData(registrations));
        } catch (error) {
            handleError(error, 'Felhasználói regisztrációk betöltése sikertelen');
            return createErrorResponse(error, 'Nem sikerült betölteni a regisztrációkat');
        }
    }

    /**
     * Get event registrations (admin)
     */
    async getEventRegistrations(eventId: string) {
        try {
            const registrations = await registrationRepository.getEventRegistrations(eventId);
            return createSuccessResponse(serializeData(registrations));
        } catch (error) {
            handleError(error, 'Esemény regisztrációk betöltése sikertelen');
            return createErrorResponse(error, 'Nem sikerült betölteni az esemény regisztrációkat');
        }
    }

    /**
     * Get registration with full details
     */
    async getRegistrationDetails(id: string) {
        try {
            const registration = await registrationRepository.getWithFullDetails(id);
            if (!registration) {
                return createErrorResponse(new Error('Not found'), 'Regisztráció nem található');
            }
            return createSuccessResponse(serializeData(registration));
        } catch (error) {
            handleError(error, 'Regisztráció részletek betöltése sikertelen');
            return createErrorResponse(error, 'Nem sikerült betölteni a regisztráció részleteit');
        }
    }
}

export const registrationService = new RegistrationService();
