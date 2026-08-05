'use server';

import { prisma } from '@/lib/prisma';
import { EventStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { serializeData } from '@/lib/utils/serialization';
import { requireAdmin } from '@/lib/auth-checks';
import { handleError, createErrorResponse, createSuccessResponse } from '@/lib/error-handler';
import { sanitizeHtml, sanitizeEmailContent } from '@/lib/sanitize';
import { slugify } from '@/lib/utils/slugify';

async function ensureSeller(
    providedSellerId: string,
    beneficiaryName: string,
    bankName: string,
    bankAccountNumber: string,
    bankAccountNumberEuro: string,
    ibanEuro: string,
    nameEuro: string
): Promise<string | null> {
    if (providedSellerId && providedSellerId !== 'custom') {
        // If selecting an existing seller, we might want to update it with provided details if they are newer/different?
        // For now, if it's a template ID (like 'balatonfuredi-ac'), we check if it exists in DB, if not create it.
        const templateIds = ['balatonfuredi-ac', 'kahu', 'bakonyorszag'];
        if (templateIds.includes(providedSellerId)) {
            const existingSeller = await prisma.seller.findFirst({
                where: { key: providedSellerId }
            });

            if (existingSeller) {
                // Determine if we should update the existing seller with new details
                // Only update if fields are provided and different
                const dataToUpdate: any = {};
                if (nameEuro && existingSeller.nameEuro !== nameEuro) dataToUpdate.nameEuro = nameEuro;
                if (bankAccountNumberEuro && existingSeller.bankAccountNumberEuro !== bankAccountNumberEuro) dataToUpdate.bankAccountNumberEuro = bankAccountNumberEuro;
                if (ibanEuro && existingSeller.ibanEuro !== ibanEuro) dataToUpdate.ibanEuro = ibanEuro;

                if (Object.keys(dataToUpdate).length > 0) {
                    await prisma.seller.update({
                        where: { id: existingSeller.id },
                        data: dataToUpdate
                    });
                }
                return existingSeller.id;
            } else {
                const newSeller = await prisma.seller.create({
                    data: {
                        key: providedSellerId,
                        name: beneficiaryName,
                        nameEuro: nameEuro || null,
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
            // It's a standard UUID seller ID
            return providedSellerId;
        }
    } else if (beneficiaryName && bankAccountNumber) {
        // Custom mode: Check if seller logic exists based on account number
        const existingSeller = await prisma.seller.findFirst({
            where: { bankAccountNumber: bankAccountNumber }
        });

        if (existingSeller) {
            // Update Euro details if provided
            const dataToUpdate: any = {};
            if (nameEuro && existingSeller.nameEuro !== nameEuro) dataToUpdate.nameEuro = nameEuro;
            if (bankAccountNumberEuro && existingSeller.bankAccountNumberEuro !== bankAccountNumberEuro) dataToUpdate.bankAccountNumberEuro = bankAccountNumberEuro;
            if (ibanEuro && existingSeller.ibanEuro !== ibanEuro) dataToUpdate.ibanEuro = ibanEuro;

            if (Object.keys(dataToUpdate).length > 0) {
                await prisma.seller.update({
                    where: { id: existingSeller.id },
                    data: dataToUpdate
                });
            }
            return existingSeller.id;
        } else {
            const newSeller = await prisma.seller.create({
                data: {
                    name: beneficiaryName,
                    nameEuro: nameEuro || null,
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
            sellerEuroId: null as string | null,

            showCountdown: showCountdown,
            coverImage: rawData.coverImage as string || null,
            ogImage: rawData.ogImage as string || null,
            ogDescription: rawData.ogDescription as string || null,
            extras: rawData.extras ? JSON.parse(rawData.extras as string) : undefined,

            status: rawData.status as EventStatus || 'DRAFT',
            paymentReminderEnabled: rawData.paymentReminderEnabled === 'on',
            infopack: rawData.infopack ? JSON.parse(rawData.infopack as string) : undefined,
            infopackActive: rawData.infopackActive === 'on',

            organizerId: user.id
        };

        // Handle Seller: Either use existing sellerId or create new Seller
        const providedSellerId = rawData.sellerId as string;
        const beneficiaryName = rawData.beneficiaryName as string;
        const bankName = rawData.bankName as string;
        const bankAccountNumber = rawData.bankAccountNumber as string;
        const bankAccountNumberEuro = rawData.bankAccountNumberEuro as string;
        const ibanEuro = rawData.ibanEuro as string;
        const nameEuro = rawData.nameEuro as string;

        eventData.sellerId = await ensureSeller(
            providedSellerId,
            beneficiaryName,
            bankName,
            bankAccountNumber,
            bankAccountNumberEuro,
            ibanEuro,
            nameEuro
        );

        // Handle Euro Seller (Separate ID if selected)
        const sellerIdEuro = rawData.sellerIdEuro as string;
        if (sellerIdEuro && sellerIdEuro !== 'same' && sellerIdEuro !== 'custom') {
            eventData.sellerEuroId = sellerIdEuro;
        } else {
            eventData.sellerEuroId = null;
        }

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
            sellerEuroId: null as string | null,

            showCountdown: showCountdown,
            coverImage: rawData.coverImage as string || null,
            ogImage: rawData.ogImage as string || null,
            ogDescription: rawData.ogDescription as string || null,
            extras: rawData.extras ? JSON.parse(rawData.extras as string) : undefined,

            status: rawData.status as EventStatus,
            paymentReminderEnabled: rawData.paymentReminderEnabled === 'on',
            infopack: rawData.infopack ? JSON.parse(rawData.infopack as string) : undefined,
            infopackActive: rawData.infopackActive === 'on'
        };

        // Handle Seller (same logic as createEvent)
        const providedSellerId = rawData.sellerId as string;
        const beneficiaryName = rawData.beneficiaryName as string;
        const bankName = rawData.bankName as string;
        const bankAccountNumber = rawData.bankAccountNumber as string;
        const bankAccountNumberEuro = rawData.bankAccountNumberEuro as string;
        const ibanEuro = rawData.ibanEuro as string;
        const nameEuro = rawData.nameEuro as string;

        eventData.sellerId = await ensureSeller(
            providedSellerId,
            beneficiaryName,
            bankName,
            bankAccountNumber,
            bankAccountNumberEuro,
            ibanEuro,
            nameEuro
        );

        // Handle Euro Seller (Separate ID if selected)
        const sellerIdEuro = rawData.sellerIdEuro as string;
        if (sellerIdEuro && sellerIdEuro !== 'same' && sellerIdEuro !== 'custom') {
            eventData.sellerEuroId = sellerIdEuro;
        } else {
            eventData.sellerEuroId = null;
        }

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

export async function importEvents(jsonContent: string) {
    try {
        const user = await requireAdmin();

        const events = JSON.parse(jsonContent);
        if (!Array.isArray(events)) {
            return { success: false, message: 'Érvénytelen JSON formátum (nem tömb).' };
        }

        let count = 0;
        let errors: string[] = [];

        for (const item of events) {
            // Basic validation
            if (!item.title || !item.slug || !item.eventDate || !item.location || !item.description) {
                errors.push(`Hiányzó adatok: ${item.title || 'Névtelen esemény'}`);
                continue;
            }

            try {
                // Check if slug exists
                const existing = await prisma.event.findUnique({ where: { slug: item.slug } });
                if (existing) {
                    errors.push(`Már létező slug: ${item.slug}`);
                    continue;
                }

                await prisma.event.create({
                    data: {
                        title: item.title,
                        titleEn: item.titleEn,
                        titleDe: item.titleDe,
                        slug: item.slug,
                        description: sanitizeHtml(item.description),
                        descriptionEn: item.descriptionEn,
                        descriptionDe: item.descriptionDe,
                        location: item.location,
                        eventDate: new Date(item.eventDate),
                        regDeadline: new Date(item.regDeadline || item.eventDate), // Default to event date if missing
                        status: item.status || 'DRAFT',
                        organizerId: user.id
                    }
                });
                count++;
            } catch (err) {
                console.error(`Error importing event ${item.slug}:`, err);
                errors.push(`Hiba a mentéskor: ${item.slug}`);
            }
        }

        revalidatePath('/[locale]/secretroom75/events', 'page');

        if (count === 0 && errors.length > 0) {
            return { success: false, message: 'Nem sikerült importálni egyetlen eseményt sem.', errors };
        }

        return {
            success: true,
            message: `${count} esemény sikeresen importálva!`,
            errors: errors.length > 0 ? errors : undefined
        };

    } catch (error) {
        console.error('Import events failed:', error);
        return { success: false, message: 'Hiba történt az importálás során.' };
    }
}
