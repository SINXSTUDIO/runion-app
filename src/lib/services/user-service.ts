import { userRepository } from '@/lib/repositories';
import { signOut } from '@/auth';

/**
 * User Service - Business logic for user operations
 */
export class UserService {
    /**
     * Soft delete user account
     */
    async softDeleteAccount(userId: string) {
        try {
            await userRepository.softDelete(userId);
            return { success: true };
        } catch (error) {
            console.error('Account deletion error:', error);
            return { success: false, error: 'Failed to delete account' };
        }
    }

    /**
     * Force logout user by incrementing token version
     */
    async forceLogout(userId: string) {
        try {
            await userRepository.update(
                { id: userId },
                { tokenVersion: { increment: 1 } }
            );
            return { success: true };
        } catch (error) {
            console.error('Force logout error:', error);
            return { success: false, error: 'Failed to force logout user' };
        }
    }

    /**
     * Get user with membership tier
     */
    async getUserWithMembership(userId: string) {
        try {
            const user = await userRepository.findWithMembershipTier(userId);
            if (!user) {
                return { success: false, error: 'User not found' };
            }
            return { success: true, data: user };
        } catch (error) {
            console.error('Failed to fetch user with membership:', error);
            return { success: false, error: String(error) };
        }
    }
}

export const userService = new UserService();
