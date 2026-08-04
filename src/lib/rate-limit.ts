/**
 * @fileoverview Rate limiting utilities using Upstash Redis with fail-open fallback
 * Protects against brute-force attacks and API abuse
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Helper to safely initialize Redis client only if credentials exist
const createRedisClient = () => {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token || !url.startsWith('http')) {
        console.warn('[RateLimit] Upstash Redis credentials not configured. Rate limiting is disabled (fail-open).');
        return null;
    }

    try {
        return new Redis({ url, token });
    } catch (err) {
        console.error('[RateLimit] Failed to instantiate Redis client:', err);
        return null;
    }
};

const redis = createRedisClient();

// Cache Ratelimit instances if Redis exists
const limiters: Record<string, Ratelimit> = {};

if (redis) {
    limiters.login = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, '15 m'), // 20 attempts per 15 mins
        analytics: true,
        prefix: 'ratelimit:login',
    });

    limiters.api = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '1 m'),
        analytics: true,
        prefix: 'ratelimit:api',
    });

    limiters.signup = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 h'),
        analytics: true,
        prefix: 'ratelimit:signup',
    });

    limiters.passwordReset = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 h'),
        analytics: true,
        prefix: 'ratelimit:password-reset',
    });

    limiters.feedback = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '24 h'),
        analytics: true,
        prefix: 'ratelimit:feedback',
    });

    limiters.registration = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 m'),
        analytics: true,
        prefix: 'ratelimit:registration',
    });
}

// Fallback objects for direct exports (Backwards compatibility)
const createDummyLimiter = () => ({
    limit: async () => ({ success: true, remaining: 999, reset: 0 }),
});

export const loginRateLimit = limiters.login || createDummyLimiter();
export const apiRateLimit = limiters.api || createDummyLimiter();
export const signupRateLimit = limiters.signup || createDummyLimiter();
export const passwordResetRateLimit = limiters.passwordReset || createDummyLimiter();
export const feedbackRateLimit = limiters.feedback || createDummyLimiter();
export const registrationRateLimit = limiters.registration || createDummyLimiter();

export const checkRateLimit = async (limiter: any, identifier: string) => {
    try {
        if (!limiter || typeof limiter.limit !== 'function') {
            return { success: true, remaining: 999, reset: 0 };
        }
        return await limiter.limit(identifier);
    } catch (err) {
        console.warn('[RateLimit] Rate limit check failed, allowing action:', err);
        return { success: true, remaining: 999, reset: 0 };
    }
};
