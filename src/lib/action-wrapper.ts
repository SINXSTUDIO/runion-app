/**
 * @fileoverview Centralized action wrapper utilities for error handling and auth
 * Provides consistent error handling, logging, and authentication across server actions
 */

import { auth } from '@/auth';
import type { Session } from 'next-auth';

/** Generic action result type */
export type ActionResult<T = unknown> =
    | { success: true; data: T }
    | { success: false; error: string };

/**
 * Get user-friendly error message from any error type
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'An unexpected error occurred';
}

/**
 * Log errors to console (can be extended to Sentry/etc later)
 */
export async function logError(error: unknown, context: string): Promise<void> {
    const timestamp = new Date().toISOString();
    const message = getErrorMessage(error);

    console.error(`[${timestamp}] [${context}] Error:`, {
        message,
        error,
        stack: error instanceof Error ? error.stack : undefined,
    });

    // Future: Send to Sentry
    // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    //   Sentry.captureException(error, { tags: { context } });
    // }
}

/**
 * Wrapper for server actions that require authentication
 * Automatically handles auth checks, error logging, and consistent error responses
 * 
 * @example
 * export const updateEvent = withAuth(async (session, eventId, data) => {
 *   return prisma.event.update({ where: { id: eventId }, data });
 * });
 */
export function withAuth<TArgs extends any[], TResult>(
    handler: (session: Session, ...args: TArgs) => Promise<TResult>
) {
    return async (...args: TArgs): Promise<ActionResult<TResult>> => {
        try {
            const session = await auth();

            if (!session?.user) {
                await logError(new Error('Unauthorized access attempt'), handler.name);
                return { success: false, error: 'Unauthorized' };
            }

            const result = await handler(session, ...args);
            return { success: true, data: result };
        } catch (error) {
            await logError(error, handler.name);
            return { success: false, error: getErrorMessage(error) };
        }
    };
}

/**
 * Wrapper for server actions that require admin role
 * Automatically handles auth + admin checks
 * 
 * @example
 * export const deleteEvent = withAdmin(async (session, eventId) => {
 *   return prisma.event.delete({ where: { id: eventId } });
 * });
 */
export function withAdmin<TArgs extends any[], TResult>(
    handler: (session: Session, ...args: TArgs) => Promise<TResult>
) {
    return async (...args: TArgs): Promise<ActionResult<TResult>> => {
        try {
            const session = await auth();

            if (!session?.user) {
                await logError(new Error('Unauthorized access attempt'), handler.name);
                return { success: false, error: 'Unauthorized' };
            }

            if (session.user.role !== 'ADMIN') {
                await logError(new Error(`Non-admin access attempt by ${session.user.email}`), handler.name);
                return { success: false, error: 'Admin access required' };
            }

            const result = await handler(session, ...args);
            return { success: true, data: result };
        } catch (error) {
            await logError(error, handler.name);
            return { success: false, error: getErrorMessage(error) };
        }
    };
}

/**
 * Wrapper for public server actions (no auth required)
 * Provides consistent error handling and logging
 * 
 * @example
 * export const getPublicEvents = withErrorHandling(async () => {
 *   return prisma.event.findMany({ where: { status: 'PUBLISHED' } });
 * });
 */
export function withErrorHandling<TArgs extends any[], TResult>(
    handler: (...args: TArgs) => Promise<TResult>
) {
    return async (...args: TArgs): Promise<ActionResult<TResult>> => {
        try {
            const result = await handler(...args);
            return { success: true, data: result };
        } catch (error) {
            await logError(error, handler.name);
            return { success: false, error: getErrorMessage(error) };
        }
    };
}

/**
 * Try-catch wrapper for inline error handling
 * Use when you need custom error handling logic
 * 
 * @example
 * const result = await tryCatch(async () => {
 *   return prisma.user.create({ data: userData });
 * }, 'createUser');
 */
export async function tryCatch<T>(
    fn: () => Promise<T>,
    context: string
): Promise<ActionResult<T>> {
    try {
        const result = await fn();
        return { success: true, data: result };
    } catch (error) {
        await logError(error, context);
        return { success: false, error: getErrorMessage(error) };
    }
}
