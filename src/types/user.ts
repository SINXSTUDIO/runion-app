import { type User } from '@prisma/client';

/**
 * User summary for dashboard header display
 * Only includes essential fields needed for UI
 */
export type UserSummary = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'image' | 'role'>;

/**
 * Type guard to check if user has required fields
 */
export function isValidUserSummary(user: unknown): user is UserSummary {
    return (
        typeof user === 'object' &&
        user !== null &&
        'id' in user &&
        'email' in user &&
        'firstName' in user
    );
}
