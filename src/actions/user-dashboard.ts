'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { serializeData } from '@/lib/utils/serialization';
import { Gender } from '@prisma/client';

const profileSchema = z.object({
    firstName: z.string().min(1, "Keresztnév kötelező"),
    lastName: z.string().min(1, "Vezetéknév kötelező"),
    phoneNumber: z.string().optional().nullable(),
    birthDate: z.string().optional().nullable(),
    gender: z.string().optional().nullable(),
    clubName: z.string().optional().nullable(),
    tshirtSize: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    zipCode: z.string().optional().nullable(),
    street: z.string().optional().nullable(),
    emergencyContactName: z.string().optional().nullable(),
    emergencyContactPhone: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
    isVegetarian: z.boolean().optional(),
    fiveTrialsId: z.string().optional().nullable(),
    teamName: z.string().optional().nullable(),
    teamMembers: z.array(z.string()).optional(),
    billingName: z.string().optional().nullable(),
    taxNumber: z.string().optional().nullable(),
    billingZipCode: z.string().optional().nullable(),
    billingCity: z.string().optional().nullable(),
    billingAddress: z.string().optional().nullable(),
});



export async function getUserRegistrations(userId: string) {
    try {
        const session = await auth();

        // Security check: user can only access their own data
        if (!session?.user || session.user.id !== userId) {
            throw new Error('Unauthorized');
        }

        const { registrationService } = await import('@/lib/services');
        const result = await registrationService.getUserRegistrations(userId);

        if (!result.success) {
            return [];
        }

        // Map registrations to flatten event structure for the component
        const mappedRegistrations = result.data.map((reg: any) => ({
            ...reg,
            event: reg.distance?.event
        }));

        return mappedRegistrations;
    } catch (error) {
        console.error('Error fetching user registrations:', error);
        return [];
    }
}

export async function getRegistrationDetails(registrationId: string) {
    try {
        const session = await auth();
        if (!session?.user) {
            throw new Error('Unauthorized');
        }

        const { registrationService } = await import('@/lib/services');
        const result = await registrationService.getRegistrationDetails(registrationId);

        if (!result.success) {
            return null;
        }

        const registration = result.data;

        // Security check
        if (!registration || registration.userId !== session.user.id) {
            throw new Error('Unauthorized or not found');
        }

        // Flatten event for the component
        const mappedRegistration = {
            ...registration,
            event: (registration as any).distance?.event
        };

        return mappedRegistration;
    } catch (error) {
        console.error('Error fetching registration details:', error);
        return null;
    }
}

export async function getUserStats(userId: string) {
    try {
        const session = await auth();

        if (!session?.user || session.user.id !== userId) {
            throw new Error('Unauthorized');
        }

        const registrations = await prisma.registration.findMany({
            where: { userId },
            include: {
                distance: true,
            },
        });

        const stats = {
            totalRegistrations: registrations.length,
            activeRegistrations: registrations.filter(
                (r) => r.registrationStatus === 'CONFIRMED'
            ).length,
            completedRaces: registrations.filter(
                (r) => r.registrationStatus === 'COMPLETED'
            ).length,
            totalPaid: registrations
                .filter((r) => r.paymentStatus === 'PAID')
                .reduce((sum, r) => sum + Number(r.distance.price), 0),
        };

        return serializeData(stats);
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return {
            totalRegistrations: 0,
            activeRegistrations: 0,
            completedRaces: 0,
            totalPaid: 0,
        };
    }
}

export async function updateUserProfile(data: z.infer<typeof profileSchema>) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            throw new Error('Nem vagy bejelentkezve (Hiányzó User ID)!');
        }

        console.log(`[updateUserProfile] Received data for User ID: ${session.user.id}`, data);

        const validData = profileSchema.parse(data);
        console.log('[updateUserProfile] Validated data:', validData);

        // Convert string date to Date object if present
        const birthDate = validData.birthDate ? new Date(validData.birthDate) : null;

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                firstName: validData.firstName,
                lastName: validData.lastName,
                phoneNumber: validData.phoneNumber,
                birthDate: birthDate,
                gender: validData.gender ? (validData.gender as Gender) : null,
                clubName: validData.clubName,
                tshirtSize: validData.tshirtSize,
                city: validData.city,
                zipCode: validData.zipCode,
                address: validData.street, // Mapping 'street' from form to 'address' in DB
                emergencyContactName: validData.emergencyContactName,
                emergencyContactPhone: validData.emergencyContactPhone,
                image: validData.image,
                isVegetarian: validData.isVegetarian ?? false,
                fiveTrialsId: validData.fiveTrialsId,
                teamName: validData.teamName,
                teamMembers: validData.teamMembers || [],
                billingName: validData.billingName,
                taxNumber: validData.taxNumber,
                billingZipCode: validData.billingZipCode,
                billingCity: validData.billingCity,
                billingAddress: validData.billingAddress,
            }
        });

        console.log('[updateUserProfile] Update successful');
        revalidatePath('/dashboard/profile');
        return { success: true };
    } catch (error) {
        console.error('Profile update error details:', error);
        if (error instanceof z.ZodError) {
            return { success: false, error: 'Érvénytelen adatok: ' + error.issues.map((e: z.ZodIssue) => e.message).join(', ') };
        }
        return { success: false, error: 'Hiba történt a mentés során: ' + (error instanceof Error ? error.message : String(error)) };
    }
}
