import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// 1. Mock all dependencies BEFORE imports
vi.mock('@/lib/prisma', () => {
    const mockPrismaClient = {
        user: {
            findUnique: vi.fn(),
        },
        feedback: {
            create: vi.fn(),
        },
        event: {
            findMany: vi.fn(),
        },
        registration: {
            findMany: vi.fn(),
        },
    };
    return {
        prisma: mockPrismaClient,
        default: mockPrismaClient,
    };
});

vi.mock('@/lib/rate-limit', () => ({
    signupRateLimit: {
        limit: vi.fn(),
    },
    feedbackRateLimit: {
        limit: vi.fn(),
    },
}));

vi.mock('@/auth', () => ({
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
}));

vi.mock('@/lib/email', () => ({
    sendEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock('next/headers', () => ({
    headers: vi.fn().mockResolvedValue({
        get: vi.fn().mockReturnValue('127.0.0.1'),
    }),
    cookies: vi.fn().mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'hu' }),
    }),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

// 2. Import modules AFTER mocking
import { register } from '@/actions/auth';
import { createFeedback } from '@/actions/feedback-actions';
import { signupRateLimit, feedbackRateLimit } from '@/lib/rate-limit';
import { auth } from '@/auth';
import { GET as remindersGet } from '@/app/api/cron/reminders/route';
import { prisma } from '@/lib/prisma';

describe('Security & Protection Controls', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.CRON_SECRET = 'super_secret_cron_key_2026';
        (process.env as any).NODE_ENV = 'production'; // Enforce production behaviors
        (prisma.event.findMany as any).mockResolvedValue([]);
        (prisma.registration.findMany as any).mockResolvedValue([]);
    });

    describe('Signup Rate Limiting', () => {
        it('should block registration if rate limit is exceeded', async () => {
            // Mock rate limit to exceed (success: false)
            (signupRateLimit.limit as any).mockResolvedValue({ success: false });

            const formData = new FormData();
            formData.append('email', 'newuser@example.com');
            formData.append('password', 'password123');
            formData.append('firstName', 'János');
            formData.append('lastName', 'Kovács');

            const result = await register(undefined, formData);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Túl sok regisztrációs kísérlet');
        });
    });

    describe('Feedback Submission Rate Limiting', () => {
        it('should block feedback submission if daily limit exceeded', async () => {
            // Mock active user session
            (auth as any).mockResolvedValue({
                user: { id: 'user-vip', email: 'vip@example.com' }
            });

            // Mock rate limit to exceed
            (feedbackRateLimit.limit as any).mockResolvedValue({ success: false });

            const feedbackInput = {
                type: 'SUGGESTION' as any,
                subject: 'Szuper ötlet',
                message: 'Lehetne több táv is.'
            };

            const result = await createFeedback(feedbackInput);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Mára elérted a visszajelzések maximális számát');
        });
    });

    describe('Cron Route Authentication', () => {
        it('should reject reminders cron trigger without Bearer token', async () => {
            const request = new NextRequest('http://localhost:3000/api/cron/reminders', {
                headers: {
                    // No Auth header
                }
            });

            const response = await remindersGet(request);

            expect(response.status).toBe(401);
            const text = await response.text();
            expect(text).toBe('Unauthorized');
        });

        it('should reject reminders cron trigger with invalid Bearer token', async () => {
            const request = new NextRequest('http://localhost:3000/api/cron/reminders', {
                headers: {
                    'authorization': 'Bearer wrong_secret'
                }
            });

            const response = await remindersGet(request);

            expect(response.status).toBe(401);
        });

        it('should authenticate reminders cron trigger with valid Bearer token', async () => {
            const request = new NextRequest('http://localhost:3000/api/cron/reminders', {
                headers: {
                    'authorization': `Bearer super_secret_cron_key_2026`
                }
            });

            const response = await remindersGet(request);

            // Expect the endpoint to start processing and not return 401
            expect(response.status).not.toBe(401);
        });
    });
});
