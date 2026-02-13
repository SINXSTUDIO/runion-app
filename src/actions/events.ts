'use server';

import { prisma } from '@/lib/prisma';
import { EventStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { serializeData } from '@/lib/utils/serialization';
import { requireAdmin } from '@/lib/auth-checks';
import { handleError, createErrorResponse, createSuccessResponse } from '@/lib/error-handler';
import { sanitizeHtml, sanitizeEmailContent } from '@/lib/sanitize';
import { slugify } from '@/lib/utils/slugify';

async function ensureSeller(providedSellerId: string, beneficiaryName: string, bankName: string, bankAccountNumber: string, bankAccountNumberEuro: string, ibanEuro: string): Promise<string | null> {
    if (providedSellerId && providedSellerId !== 'custom') {
        const templateIds = ['balatonfuredi-ac', 'kahu', 'bakonyorszag'];
        if (templateIds.includes(providedSellerId)) {
            const existingSeller = await prisma.seller.findFirst({
                where: { key: providedSellerId }
            });

            if (existingSeller) {
                return existingSeller.id;
            } else {
                const newSeller = await prisma.seller.create({
                    data: {
                        key: providedSellerId,
                        name: beneficiaryName,
                        bankName: bankName,
                        bankAccountNumber: bankAccountNumber,
                        bankAccountNumberEuro: bankAccountNumberEuro || null,
                        ibanEuro: ibanEuro || null,
                        address: '',
                        active: true
                    }
                });
                return newSeller.id;
            }
        } else {
            return providedSellerId;
        }
    } else if (beneficiaryName && bankAccountNumber) {
        const existingSeller = await prisma.seller.findFirst({
            where: { bankAccountNumber: bankAccountNumber }
        });

        if (existingSeller) {
            return existingSeller.id;
        } else {
            const newSeller = await prisma.seller.create({
                data: {
                    name: beneficiaryName,
                    bankName: bankName || '',
                    bankAccountNumber: bankAccountNumber,
                    bankAccountNumberEuro: bankAccountNumberEuro || null,
                    ibanEuro: ibanEuro || null,
                    address: '', // Custom form doesn't have address
                    active: true
                }
            });
            return newSeller.id;
        }
    }
    return null;
}

export async function getPublishedEvents() {
    const { eventService } = await import('@/lib/services');
    return eventService.getPublishedEvents();
}

export async function getEventBySlug(slug: string) {
    const { eventService } = await import('@/lib/services');
    return eventService.getEventBySlug(slug);
}

export async function updateEventFormConfig(eventId: string, config: any) {
    await requireAdmin();
    const { eventService } = await import('@/lib/services');
    return eventService.updateFormConfig(eventId, config);
}

export async function deleteEvent(id: string) {
    await requireAdmin();
    const { eventService } = await import('@/lib/services');
    const result = await eventService.deleteEvent(id);

    if (result.success) {
        revalidatePath('/[locale]/secretroom75/events', 'page');
    }

    return result;
}

export async function duplicateEvent(id: string) {
    await requireAdmin();
    const { eventService } = await import('@/lib/services');
    const result = await eventService.duplicateEvent(id);

    if (result.success) {
        revalidatePath('/[locale]/secretroom75/events', 'page');
    }

    return result;
}

export async function createEvent(prevState: any, formData: FormData) {
    try {
        const user = await requireAdmin(); // Ensure admin and get user

        const rawData = Object.fromEntries(formData.entries());

        // Handle checkboxes and special fields
        const showCountdown = formData.get('showCountdown') === 'on';

        // Validate required fields
        const requiredFields = [
            'title', 'slug', 'description', 'location',
            'eventDate', 'regDeadline'
        ];

        const missingFields = requiredFields.filter(field => !formData.get(field));
        if (missingFields.length > 0) {
            return createErrorResponse(
                new Error(`Missing fields: ${missingFields.join(', ')}`),
                `Hiányzó mezők: ${missingFields.join(', ')}`
            );
        }

        const slug = formData.get('slug') as string;
        const title = formData.get('title') as string;
        const rawDescription = formData.get('description') as string;
        const location = formData.get('location') as string;
        const eventDate = formData.get('eventDate') as string;
        const regDeadline = formData.get('regDeadline') as string;
        const rawConfirmationEmailText = formData.get('confirmationEmailText') as string | null;

        // SECURITY: Sanitize HTML content to prevent XSS
        const description = sanitizeHtml(rawDescription);
        const confirmationEmailText = rawConfirmationEmailText ? sanitizeEmailContent(rawConfirmationEmailText) : null;

        // Generate slug if not provided or empty
        let finalSlug = slug.trim();
        if (!finalSlug) {
            finalSlug = slugify(title);
            if (!finalSlug) finalSlug = `event-${Date.now()}`;
        }

        const eventData = {
            title: title,
            titleEn: rawData.titleEn as string || null,
            titleDe: rawData.titleDe as string || null,
            slug: finalSlug,
            description: description,  // Sanitized
            descriptionEn: rawData.descriptionEn as string || null,
            descriptionDe: rawData.descriptionDe as string || null,
            eventDate: new Date(eventDate),
            endDate: rawData.endDate ? new Date(rawData.endDate as string) : null,
            regDeadline: new Date(regDeadline),
            location: location,

            googleMapsUrl: rawData.googleMapsUrl as string || null,
            websiteUrl: rawData.websiteUrl as string || null,
            organizerName: rawData.organizerName as string || null,
            notificationEmail: rawData.notificationEmail as string || null,
            extraOrganizers: rawData.extraOrganizers as string || null, // Legacy field
            confirmationEmailText: confirmationEmailText, // Sanitized

            extraLocations: rawData.extraLocations ? JSON.parse(rawData.extraLocations as string) : undefined as any,
            extraOrganizersJson: rawData.extraOrganizersJson ? JSON.parse(rawData.extraOrganizersJson as string) : undefined as any,

            // Seller Logic: If sellerId is provided, use it. Otherwise, create new Seller if custom data provided.
            sellerId: null as string | null,

            showCountdown: showCountdown,
            coverImage: rawData.coverImage as string || null,
            ogImage: rawData.ogImage as string || null,
            ogDescription: rawData.ogDescription as string || null,
            extras: rawData.extras ? JSON.parse(rawData.extras as string) : undefined,

            status: rawData.status as EventStatus || 'DRAFT',
            paymentReminderEnabled: rawData.paymentReminderEnabled === 'on',
            infopack: rawData.infopack ? JSON.parse(rawData.infopack as string) : undefined,

            organizerId: user.id
        };

        // Handle Seller: Either use existing sellerId or create new Seller
        const providedSellerId = rawData.sellerId as string;
        const beneficiaryName = rawData.beneficiaryName as string;
        const bankName = rawData.bankName as string;
        const bankAccountNumber = rawData.bankAccountNumber as string;
        const bankAccountNumberEuro = rawData.bankAccountNumberEuro as string;
        const ibanEuro = rawData.ibanEuro as string;

        eventData.sellerId = await ensureSeller(
            providedSellerId,
            beneficiaryName,
            bankName,
            bankAccountNumber,
            bankAccountNumberEuro,
            ibanEuro
        );

        const event = await prisma.event.create({
            data: eventData
        });

        revalidatePath('/[locale]/secretroom75/events', 'page');
        return { message: 'Sikeres létrehozás!', type: 'success', eventId: event.id };
    } catch (error) {
        console.error('Create event failed:', error);
        return { message: 'Hiba történt a létrehozás során: ' + String(error), type: 'error' };
    }
}

export async function updateEvent(id: string, prevState: any, formData: FormData) {
    try {
        console.log('UpdateEvent called for ID:', id);
        console.log('Form data keys:', Array.from(formData.keys()));
        const confirmationTextRaw = formData.get('confirmationEmailText');
        console.log('Received confirmationEmailText:', confirmationTextRaw ? ((confirmationTextRaw as string).substring(0, 50) + '...') : 'NULL/EMPTY');

        await requireAdmin();
        const rawData = Object.fromEntries(formData.entries());
        const showCountdown = formData.get('showCountdown') === 'on';

        // SECURITY: Sanitize HTML content to prevent XSS  
        const rawDescription = rawData.description as string;
        const rawConfirmationText = rawData.confirmationEmailText as string | null;
        const description = sanitizeHtml(rawDescription);
        const confirmationEmailText = rawConfirmationText ? sanitizeEmailContent(rawConfirmationText) : null;

        const eventData = {
            title: rawData.title as string,
            titleEn: rawData.titleEn as string || null,
            titleDe: rawData.titleDe as string || null,
            slug: (rawData.slug as string) || slugify(rawData.title as string),
            description: description,  // Sanitized
            descriptionEn: rawData.descriptionEn as string || null,
            descriptionDe: rawData.descriptionDe as string || null,
            eventDate: new Date(rawData.eventDate as string),
            endDate: rawData.endDate ? new Date(rawData.endDate as string) : null,
            regDeadline: new Date(rawData.regDeadline as string),
            location: rawData.location as string,

            googleMapsUrl: rawData.googleMapsUrl as string || null,
            websiteUrl: rawData.websiteUrl as string || null,
            organizerName: rawData.organizerName as string || null,
            notificationEmail: rawData.notificationEmail as string || null,
            extraOrganizers: rawData.extraOrganizers as string || null, // Legacy field

            extraLocations: rawData.extraLocations ? JSON.parse(rawData.extraLocations as string) : undefined as any,
            extraOrganizersJson: rawData.extraOrganizersJson ? JSON.parse(rawData.extraOrganizersJson as string) : undefined as any,
            confirmationEmailText: confirmationEmailText,  // Sanitized

            // Seller Logic (same as createEvent)
            sellerId: null as string | null,

            showCountdown: showCountdown,
            coverImage: rawData.coverImage as string || null,
            ogImage: rawData.ogImage as string || null,
            ogDescription: rawData.ogDescription as string || null,
            extras: rawData.extras ? JSON.parse(rawData.extras as string) : undefined,

            status: rawData.status as EventStatus,
            paymentReminderEnabled: rawData.paymentReminderEnabled === 'on',
            infopack: rawData.infopack ? JSON.parse(rawData.infopack as string) : undefined
        };

        // Handle Seller (same logic as createEvent)
        const providedSellerId = rawData.sellerId as string;
        const beneficiaryName = rawData.beneficiaryName as string;
        const bankName = rawData.bankName as string;
        const bankAccountNumber = rawData.bankAccountNumber as string;
        const bankAccountNumberEuro = rawData.bankAccountNumberEuro as string;
        const ibanEuro = rawData.ibanEuro as string;

        eventData.sellerId = await ensureSeller(
            providedSellerId,
            beneficiaryName,
            bankName,
            bankAccountNumber,
            bankAccountNumberEuro,
            ibanEuro
        );

        await prisma.event.update({
            where: { id },
            data: eventData
        });

        revalidatePath('/[locale]/secretroom75/events', 'page');
        revalidatePath(`/[locale]/secretroom75/events/${id}/edit`, 'page');

        return { message: 'Sikeres frissítés!', type: 'success' };
    } catch (error) {
        console.error('Update event failed:', error);
        return { message: 'Hiba történ a frissítés során: ' + String(error), type: 'error' };
    }
}

// Update events order (for drag and drop)
export async function updateEventsOrder(eventOrders: { id: string; sortOrder: number }[]) {
    try {
        await requireAdmin();

        // Batch update using transaction
        await prisma.$transaction(
            eventOrders.map(({ id, sortOrder }) =>
                prisma.event.update({
                    where: { id },
                    data: { sortOrder }
                })
            )
        );

        revalidatePath('/[locale]/secretroom75/events', 'page');
        return { success: true };
    } catch (error) {
        console.error('Failed to update events order:', error);
        return { success: false, error: String(error) };
    }
}

export async function getAllEventsAdmin() {
    try {
        await requireAdmin();
        const events = await prisma.event.findMany({
            orderBy: { eventDate: 'desc' },
            select: {
                id: true,
                title: true,
                eventDate: true,
                status: true
            }
        });
        return serializeData(events);
    } catch (error) {
        console.error('Failed to fetch events for admin:', error);
        return [];
    }
}
