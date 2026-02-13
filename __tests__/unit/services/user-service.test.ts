import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock userRepository using inline vi.fn()
vi.mock('@/lib/repositories', () => ({
    userRepository: {
        softDelete: vi.fn(),
        update: vi.fn(),
        findWithMembershipTier: vi.fn(),
    },
}));

// Import AFTER mock
import { UserService } from '@/lib/services/user-service';
import { userRepository } from '@/lib/repositories';
import { createMockUser } from '../../setup/factories';

describe('UserService', () => {
    let userService: UserService;

    beforeEach(() => {
        userService = new UserService();
        vi.clearAllMocks();
    });

    describe('softDeleteAccount', () => {
        it('should soft delete user account successfully', async () => {
            (userRepository.softDelete as any).mockResolvedValue(undefined);

            const result = await userService.softDeleteAccount('test-user-id');

            expect(result.success).toBe(true);
            expect(userRepository.softDelete).toHaveBeenCalledWith('test-user-id');
        });

        it('should return error when soft delete fails', async () => {
            (userRepository.softDelete as any).mockRejectedValue(new Error('Database error'));

            const result = await userService.softDeleteAccount('test-user-id');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Failed to delete account');
        });
    });

    describe('forceLogout', () => {
        it('should increment token version successfully', async () => {
            (userRepository.update as any).mockResolvedValue(undefined);

            const result = await userService.forceLogout('test-user-id');

            expect(result.success).toBe(true);
            expect(userRepository.update).toHaveBeenCalledWith(
                { id: 'test-user-id' },
                { tokenVersion: { increment: 1 } }
            );
        });

        it('should return error when force logout fails', async () => {
            (userRepository.update as any).mockRejectedValue(new Error('Database error'));

            const result = await userService.forceLogout('test-user-id');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Failed to force logout user');
        });
    });

    describe('getUserWithMembership', () => {
        it('should return user with membership tier', async () => {
            const mockUser = createMockUser({
                id: 'test-user-id',
                membershipTier: {
                    id: 'tier-1',
                    name: 'Gold',
                },
            });
            (userRepository.findWithMembershipTier as any).mockResolvedValue(mockUser);

            const result = await userService.getUserWithMembership('test-user-id');

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockUser);
            expect(userRepository.findWithMembershipTier).toHaveBeenCalledWith('test-user-id');
        });

        it('should return error when user not found', async () => {
            (userRepository.findWithMembershipTier as any).mockResolvedValue(null);

            const result = await userService.getUserWithMembership('non-existent-id');

            expect(result.success).toBe(false);
            expect(result.error).toBe('User not found');
        });

        it('should handle database errors', async () => {
            const error = new Error('Database connection failed');
            (userRepository.findWithMembershipTier as any).mockRejectedValue(error);

            const result = await userService.getUserWithMembership('test-user-id');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Error: Database connection failed');
        });
    });
});
