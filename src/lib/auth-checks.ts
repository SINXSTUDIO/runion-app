import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';

export type SessionUser = {
    id: string;
    email: string;
    role: Role;
    firstName?: string;
    lastName?: string;
};

/**
 * Checks if a user is authenticated. 
 * Redirects to login if not, or returns null/throws based on usage, 
 * but for actions, we usually want to throw or return error.
 * Here we return the session user if authenticated.
 */
export async function requireUser(): Promise<SessionUser> {
    const session = await auth();

    if (!session?.user || !session.user.id) {
        throw new Error('Unauthenticated');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return session.user as any as SessionUser;
}

/**
 * Checks if the authenticated user has ADMIN or STAFF role.
 * Throws error if not.
 */
export async function requireAdmin(): Promise<SessionUser> {
    const user = await requireUser();

    if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
        throw new Error('Unauthorized: Insufficient permissions');
    }

    return user;
}
