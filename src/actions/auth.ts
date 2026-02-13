'use server';

import { cookies } from 'next/headers';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email';
import { ensureDefaultTiers } from '@/actions/memberships';
import crypto from 'crypto';

const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
});

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        const locale = (await cookies()).get('NEXT_LOCALE')?.value || 'hu';
        await signIn('credentials', { ...Object.fromEntries(formData), redirectTo: `/${locale}/dashboard` });
    } catch (error) {
        console.error("Login error:", error);
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export type RegisterState = {
    success: boolean;
    error?: string;
    requiresVerification?: boolean;
    email?: string;
}

export async function register(prevState: RegisterState | undefined, formData: FormData): Promise<RegisterState> {
    // Honeypot check
    const honeypot = formData.get('website');
    if (honeypot && honeypot.toString().length > 0) {
        return { success: false, error: 'Registration failed.' };
    }

    const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
        return { success: false, error: 'Hiányzó adatok. Sikertelen regisztráció.' };
    }

    const { email, password, firstName, lastName } = validatedFields.data;

    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        // Soft-deleted user reactivation check
        if (existingUser.deletedAt) {
            // Reactivate user flow
            // We'll update the password and clear deletedAt during verification or here?
            // Better to update hashed password here to allow login after verification
            // And clear deletedAt upon successful verification? 
            // OR update it right here, but keep emailVerified as is (or nullify if we want re-verification).

            // Re-verification is safer.
            const hashedPassword = await bcrypt.hash(password, 10);

            await prisma.user.update({
                where: { email },
                data: {
                    passwordHash: hashedPassword,
                    firstName,
                    lastName,
                    deletedAt: null, // Reactivate immediately? Or wait? 
                    // If we reactivate here, they can login. 
                    // But we want them to verify email again if we treat it as "new".
                    // Let's reset emailVerified to null to force verification if we want strict security.
                    // But existingUser might have had verified email. 
                    // The requirement: "mintha most regisztrált volna" (as if registered now).
                    emailVerified: null
                }
            });

            // Send verification code
            return await sendVerificationCode(email);
        }

        return { success: false, error: 'Ez az email cím már regisztrálva van.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // Create User (unverified)
        await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                firstName,
                lastName,
                emailVerified: null,
            },
        });

        // 2FA Flow
        return await sendVerificationCode(email);

    } catch (error) {
        console.error("Database Error:", error);
        return { success: false, error: 'Adatbázis hiba történt.' };
    }
}

export async function sendVerificationCode(email: string): Promise<RegisterState> {
    try {
        const code = crypto.randomInt(100000, 999999).toString();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        // Clean up old tokens
        try {
            await prisma.verificationToken.deleteMany({ where: { identifier: email } });
        } catch (e) {
            // Ignore if none
        }

        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token: code,
                expires
            }
        });

        await sendEmail({
            to: email,
            from: '"RUNION.EU" <runionsport@gmail.com>',
            subject: 'Regisztráció Megerősítése - Kód',
            html: `
                <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                    <h1>Hitelesítő Kód</h1>
                    <p>A regisztráció befejezéséhez kérlek használd az alábbi kódot:</p>
                    <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px auto; display: inline-block;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000;">${code}</span>
                    </div>
                    <p>A kód 15 percig érvényes.</p>
                </div>
            `,
        });

        return { success: true, requiresVerification: true, email };
    } catch (e) {
        console.error("Email send error:", e);
        return { success: false, error: 'Nem sikerült elküldeni a megerősítő emailt.' };
    }
}


export async function verifyEmail(email: string, code: string) {
    try {
        const token = await prisma.verificationToken.findFirst({
            where: { identifier: email, token: code }
        });

        if (!token) {
            return { success: false, error: 'Érvénytelen vagy hibás kód.' };
        }

        if (new Date() > token.expires) {
            return { success: false, error: 'A kód lejárt. Kérj újat.' };
        }

        // Verify User
        await prisma.user.update({
            where: { email },
            data: { emailVerified: new Date() }
        });

        // Delete Token
        await prisma.verificationToken.deleteMany({
            where: { identifier: email, token: code }
        }); // deleteMany is safer against unique constraints issues if any schema drift

        // Assign Standard Membership
        await ensureDefaultTiers();
        const standardTier = await prisma.membershipTier.findUnique({ where: { name: 'Standard' } });

        if (standardTier) {
            const now = new Date();
            const end = new Date(now);
            end.setMonth(end.getMonth() + standardTier.durationMonths); // 100 years

            await prisma.user.update({
                where: { email },
                data: {
                    membershipTierId: standardTier.id,
                    membershipStart: now,
                    membershipEnd: end
                }
            });
        }

        return { success: true };

    } catch (e) {
        console.error("Verification error:", e);
        return { success: false, error: 'Szerver hiba a hitelesítés során.' };
    }
}
