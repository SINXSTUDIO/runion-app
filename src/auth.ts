import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import type { User } from '@prisma/client';

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    trustHost: true,
    adapter: PrismaAdapter(prisma),
    session: { strategy: 'jwt' },
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
                token.firstName = (user as any).firstName;
                token.lastName = (user as any).lastName;
                token.image = (user as any).image;
                token.tokenVersion = (user as any).tokenVersion || 0;
            }

            // Check if token is stale (Force Logout check)
            if (token.id) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id },
                    select: { tokenVersion: true, deletedAt: true }
                });

                // If user deleted or token version mismatch -> invalid
                if (!dbUser || dbUser.deletedAt || (dbUser.tokenVersion ?? 0) > (token.tokenVersion || 0)) {
                    return null; // This invalidates the token
                }
            }

            if (trigger === 'update' && session) {
                return { ...token, ...session };
            }
            return token;
        },
    },
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;

                    // Rate limiting protection - 5 attempts per 15 min
                    try {
                        const { loginRateLimit } = await import('@/lib/rate-limit');
                        const { success, remaining } = await loginRateLimit.limit(email);

                        if (!success) {
                            console.log(`[RateLimit] Login blocked for ${email} - too many attempts`);
                            throw new Error('Too many login attempts. Please try again in 15 minutes.');
                        }

                        console.log(`[RateLimit] Login attempt for ${email} - ${remaining} attempts remaining`);
                    } catch (error) {
                        // If Redis is down, log but allow login (fail-open approach)
                        if (error instanceof Error && error.message.includes('Too many')) {
                            throw error; // Re-throw rate limit errors
                        }
                        console.error('[RateLimit] Redis unavailable, allowing login:', error);
                    }

                    const user = await prisma.user.findUnique({ where: { email } });

                    if (!user) {
                        throw new Error('Invalid credentials');
                    }

                    if (!user.passwordHash) {
                        throw new Error('Invalid credentials');
                    }

                    // Block soft-deleted users
                    if (user.deletedAt) {
                        throw new Error('Invalid credentials');
                    }

                    // Block unverified users
                    if (user.emailVerified === null) {
                        throw new Error('UNVERIFIED_EMAIL');
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

                    if (passwordsMatch) {
                        console.log(`Login successful for user ${email}`);
                        return user;
                    } else {
                        throw new Error('Invalid credentials');
                    }
                } else {
                    throw new Error('Invalid credentials');
                }

                return null;
            },
        }),
    ],
});
