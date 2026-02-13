/**
 * @fileoverview Rate limiting utilities using Upstash Redis
 * Protects against brute-force attacks and API abuse
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Rate limiter for login attempts
 * Allows 5 attempts per 15 minutes per email
 */
export const loginRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: true,
    prefix: 'ratelimit:login',
});

/**
 * Rate limiter for general API endpoints
 * Allows 100 requests per minute per IP
 */
export const apiRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: 'ratelimit:api',
});

/**
 * Rate limiter for registration/signup
 * Allows 3 attempts per hour per IP
 */
export const signupRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    analytics: true,
    prefix: 'ratelimit:signup',
});

/**
 * Rate limiter for password reset
 * Allows 3 requests per hour per email
 */
export const passwordResetRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    analytics: true,
    prefix: 'ratelimit:password-reset',
});

/**
 * Rate limiter for feedback/contact forms
 * Allows 5 submissions per day per user/IP
 */
export const feedbackRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '24 h'),
    analytics: true,
    prefix: 'ratelimit:feedback',
});

/**
 * Rate limiter for admin actions (deletions, bulk operations)
 * Allows 50 actions per minute per admin user
 */
export const adminActionRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 m'),
    analytics: true,
    prefix: 'ratelimit:admin',
});

/**
 * Helper function to get client identifier (IP or user ID)
 */
export function getClientIdentifier(request?: Request, userId?: string): string {
    if (userId) return userId;

    if (request) {
        // Try to get real IP from various headers
        const forwardedFor = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip');
        const cfConnectingIp = request.headers.get('cf-connecting-ip');

        return (
            cfConnectingIp ||
            realIp ||
            forwardedFor?.split(',')[0] ||
            'unknown'
        );
    }

    return 'unknown';
}

/**
 * Check rate limit and return result
 */
export async function checkRateLimit(
    limiter: Ratelimit,
    identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    return {
        success,
        limit,
        remaining,
        reset,
    };
}
