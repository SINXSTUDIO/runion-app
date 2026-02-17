'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { generateProformaPDF } from '@/lib/pdf-generator';
import { requireUser } from '@/lib/auth-checks';
import { getLocale } from 'next-intl/server';
import { handleError, createErrorResponse, createSuccessResponse } from '@/lib/error-handler';
import {
    BillingDataSchema,
    RegistrationFormDataSchema,
    EventExtrasArraySchema,
    type BillingData,
    type EventExtra
} from '@/lib/validators/registration';
import { registrationMutex } from '@/lib/mutex';
import { REG_EMAIL_TRANSLATIONS, Locale, generateRegistrationEmailHtml, generateNotificationEmailHtml } from '@/templates/emails/registration';

// Old schemas removed - using validators from registration.ts

export async function submitRegistration(
    eventId: string,
    userId: string,
    distanceId: string,
    formData: Record<string, unknown>,
    billingData: BillingData | null,
    extras: EventExtra[] = [],
    crewSize?: number
): Promise<{ success: boolean; registrationId?: string; error?: string }> {
    try {
        const locale = await getLocale();
        const t = REG_EMAIL_TRANSLATIONS[locale as Locale] || REG_EMAIL_TRANSLATIONS.hu;

        // Security: Verify user identity
        const user = await requireUser();
        if (user.id !== userId) {
            console.error(`[SECURITY] User ${user.id} attempted to register for ${userId}`);
            return { success: false, error: 'Jogosulatlan művelet' };
        }

        // Honeypot check - Silent failure for bots
        if (formData.website || formData.website_field) {
            console.log('[SECURITY] Bot detected via honeypot');
            // Return success to fool the bot
            await new Promise(resolve => setTimeout(resolve, 2000));
            return { success: true, registrationId: 'bot_' + Date.now() };
        }

        // Validate billing data if provided
        if (billingData && Object.keys(billingData).length > 0) {
            const billingValidation = BillingDataSchema.safeParse(billingData);
            if (!billingValidation.success) {
                const errorMessage = billingValidation.error.issues[0]?.message || 'Hibás számlázási adatok';
                return createErrorResponse(new Error(errorMessage), errorMessage);
            }
        }

        // Validate form data
        const formValidation = RegistrationFormDataSchema.safeParse(formData);
        if (!formValidation.success) {
            return createErrorResponse(new Error('Hibás űrlap adatok'), 'Hibás űrlap adatok');
        }

        // Validate extras if provided
        if (extras && extras.length > 0) {
            const extrasValidation = EventExtrasArraySchema.safeParse(extras);
            if (!extrasValidation.success) {
                return createErrorResponse(new Error('Érvénytelen kiegészítők'), 'Érvénytelen kiegészítők');
            }
        }


        // Validate inputs (Basic)
        if (!eventId || !userId || !distanceId) {
            return { success: false, error: 'Hiányzó adatok' };
        }

        // CRITICAL: Acquire mutex lock to prevent race conditions
        // Multiple users registering at the same time could bypass capacity limit
        const mutexKey = `registration:${distanceId}`;
        const release = await registrationMutex.acquire(mutexKey);

        try {
            // Check if distance exists and has capacity
            const distance = await prisma.distance.findUnique({
                where: { id: distanceId },
                include: {
                    _count: { select: { registrations: true } },
                    priceTiers: true
                }
            });

            if (!distance) {
                release(); // Release mutex before returning
                return { success: false, error: 'Érvénytelen táv' };
            }

            if (distance.capacityLimit > 0 && distance._count.registrations >= distance.capacityLimit) {
                release(); // Release mutex before returning
                return { success: false, error: 'Betelt a létszám' };
            }

            // Capacity OK - continue with registration
            // Mutex will be released in finally block

            // Calculate final price (crew pricing or regular)
            // Calculate final price (crew pricing or regular)
            let finalPrice = Number(distance.price);
            let discountPercentage = 0; // Track discount
            let isCrewPricing = false; // Track if we used crew pricing (which implies EUR)

            if (distance.crewPricing && crewSize) {
                const crewPricing = distance.crewPricing as Record<string, number>;
                finalPrice = crewPricing[crewSize.toString()] || Number(distance.price);
                isCrewPricing = true;
            } else {
                // Apply Membership Discount ONLY if standard pricing (not crew)
                // Fetch user with tier
                const userWithTier = await prisma.user.findUnique({
                    where: { id: userId },
                    include: { membershipTier: true }
                });

                if (userWithTier?.membershipTier) {
                    const discountAmt = Number(userWithTier.membershipTier.discountAmount || 0);
                    discountPercentage = Number(userWithTier.membershipTier.discountPercentage || 0);

                    if (discountAmt > 0) {
                        finalPrice = Math.max(0, finalPrice - discountAmt);
                    } else if (discountPercentage > 0) {
                        finalPrice = Math.floor(finalPrice * (1 - discountPercentage / 100)); // Round down to integer
                    }
                }
            }

            // Create Registration
            const registration = await prisma.registration.create({
                data: {
                    userId,
                    distanceId,
                    registrationStatus: 'PENDING',
                    formData: { ...formData, billingDetails: billingData },
                    extras: extras,
                    crewSize: isCrewPricing ? crewSize : null,
                    finalPrice: finalPrice,
                },
                include: {
                    distance: {
                        include: {
                            event: {
                                include: {
                                    seller: true,
                                    sellerEuro: true // Include Euro Seller for split beneficiary logic
                                }
                            }
                        }
                    },
                    user: true
                }
            });

            // Calculate Total Price (Dynamic) using the calculated finalPrice as base
            let basePrice = 0;
            let basePriceEur = 0;

            if (isCrewPricing) {
                // If it's crew pricing, the finalPrice IS in EUR (based on frontend logic and usage)
                basePrice = 0;
                basePriceEur = finalPrice;
            } else {
                // Standard pricing: finalPrice is HUF
                basePrice = finalPrice;
                // For standard pricing, check if there's a separate EUR price
                basePriceEur = (distance as any).priceEur ? Number((distance as any).priceEur) : 0;
            }

            const extrasTotal = extras.reduce((sum, item) => sum + (item.price || 0), 0);
            const extrasTotalEur = extras.reduce((sum, item) => sum + (item.priceEur || 0), 0);

            const totalPrice = basePrice + extrasTotal;
            const totalPriceEur = basePriceEur + extrasTotalEur;

            // Determine primary currency for display and logic
            // If Total HUF is 0 and Total EUR > 0, treat as EUR only
            const isEurOnly = totalPrice === 0 && totalPriceEur > 0;

            let priceDisplay = `${totalPrice.toLocaleString()} Ft`;
            if (isEurOnly) {
                priceDisplay = `${totalPriceEur} €`;
            } else if (totalPrice > 0 && totalPriceEur > 0) {
                priceDisplay = `${totalPrice.toLocaleString()} Ft / ${totalPriceEur} €`;
            }

            // Send Confirmation Email
            if (process.env.EMAIL_HOST && registration.user?.email) {
                const { sendEmail } = await import('@/lib/email');

                // Create event-based payment reference
                const event = registration.distance.event;
                const eventYear = new Date(event.eventDate).getFullYear();

                // 1. Prefix: First 3 chars of slug (e.g. RUN)
                const cleanSlug = event.slug.replace(/-/g, '').toUpperCase();
                const prefix = cleanSlug.substring(0, 3);

                // 2. Name: KOVTA (First 3 of Last + First 2 of First)
                // Helper to sanitize (remove accents)
                const sanitizeName = (s: string) => s ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z]/g, "").toUpperCase() : '';

                const lNameRaw = (formData.lastName || formData.vezeteknev || user?.lastName || '') as string;
                const fNameRaw = (formData.firstName || formData.keresztnev || user?.firstName || '') as string;

                const lName = sanitizeName(lNameRaw).substring(0, 3);
                const fName = sanitizeName(fNameRaw).substring(0, 2);
                const nameCode = `${lName}${fName}`;

                // 3. Distance: '21K' or 'MAR'
                const distNameRaw = registration.distance.name;
                const distCode = distNameRaw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 3);

                // Construct: RUNKOVTA21K-3BC37
                // Format: [EVENT_3][NAME_5][DIST_3]-[ID_5]
                const paymentReference = `${prefix}${nameCode}${distCode}-${registration.id.substring(0, 5).toUpperCase()}`;

                // Update Registration with Proforma Metadata
                await prisma.registration.update({
                    where: { id: registration.id },
                    data: {
                        proformaNumber: paymentReference,
                        proformaGeneratedAt: new Date(),
                        proformaUrl: `/api/documents/proforma/${registration.id}` // Dynamic generation route
                    }
                });

                // Update local object for PDF generation
                (registration as any).proformaNumber = paymentReference;

                // -- GENERATE PDF ATTACHMENT --
                let attachments = [];
                try {
                    const eventWithSellers = (registration.distance.event as any);
                    let seller = eventWithSellers.seller;

                    // CHECK FOR SPLIT BENEFICIARY
                    // If the transaction is EUR-only (or dominant), and a specific Euro seller is defined, use that.
                    if (isEurOnly && eventWithSellers.sellerEuro) {
                        seller = eventWithSellers.sellerEuro;
                    }

                    if (seller) {
                        const pdfArrayBuffer = await generateProformaPDF(registration as any, event as any, registration.distance as any, seller, locale as any);
                        attachments.push({
                            filename: `dijbekero_${paymentReference}.pdf`,
                            content: Buffer.from(pdfArrayBuffer),
                            contentType: 'application/pdf'
                        });
                    }
                } catch (pdfErr) {
                    console.error("Failed to generate/attach PDF:", pdfErr);
                    // Continue sending email without PDF if generation fails
                }

                // Format extras list for email table
                const extrasTableRows = extras.length > 0
                    ? extras.map(e => {
                        const priceStr = e.price !== 0
                            ? `${e.price.toLocaleString()} Ft`
                            : ((e.priceEur ?? 0) > 0 ? `${e.priceEur} €` : t.free);
                        return `<tr><td style="padding: 10px; border-bottom: 1px solid #eeeeee; font-family: Arial, Helvetica, sans-serif; font-size: 14px;">• ${e.name}</td><td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold;">${priceStr}</td></tr>`;
                    }).join('')
                    : '';

                // Calculate discount amount for display
                const originalPrice = Number(distance.price);
                const discountAmount = originalPrice - finalPrice; // Only valid if base price was original.

                // Preheader text for mobile
                const userPreviewText = `${t.preview} ${registration.distance.name} - ${priceDisplay}`;

                await sendEmail({
                    to: registration.user.email,
                    subject: `${t.subject} ${registration.distance.event.title}`,
                    html: generateRegistrationEmailHtml(t, locale as any, userPreviewText, registration as any, distance as any, finalPrice, priceDisplay, discountPercentage, paymentReference, extrasTableRows),
                    attachments: attachments
                });
            }

            // Send Notification Email to Organizer
            if (process.env.EMAIL_HOST && registration.distance.event.notificationEmail) {
                const { sendEmail } = await import('@/lib/email');

                // Extract all form data properly
                const regFormData = formData as Record<string, any>;

                // Helper to find field value by label keywords
                const findField = (keywords: string[]) => {
                    const foundKey = Object.keys(regFormData).find(key =>
                        keywords.some(kw => key.toLowerCase().includes(kw))
                    );
                    return foundKey ? regFormData[foundKey] : undefined;
                };

                // Extract key fields with fallbacks to User Profile
                const lastName = findField(['vezet', 'last', 'család']) || registration.user.lastName || '';
                const firstName = findField(['kereszt', 'first', 'utónév', 'utó']) || registration.user.firstName || '';

                const phone = findField(['telefon', 'phone', 'mobil']) || registration.user.phoneNumber || '';
                const gender = findField(['nem', 'gender']) || (registration.user.gender === 'MALE' ? 'Férfi' : (registration.user.gender === 'FEMALE' ? 'Nő' : ''));

                let birthDate = findField(['szület', 'birth']);
                if (!birthDate && registration.user.birthDate) {
                    try {
                        birthDate = new Date(registration.user.birthDate).toLocaleDateString('hu-HU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });
                    } catch (e) {
                        // Fallback if date parsing fails
                        birthDate = '';
                    }
                }

                const tshirtSize = findField(['póló', 'tshirt', 'shirt']) || registration.user.tshirtSize || 'Nem választott';
                const city = findField(['város', 'city']) || registration.user.city || '';
                const zipCode = findField(['irányító', 'zip']) || registration.user.zipCode || '';
                const address = findField(['cím', 'address', 'utca']) || registration.user.address || '';
                const clubName = findField(['klub', 'club']) || registration.user.clubName || '';

                // Format extras list for email with pricing
                const extrasList = extras.length > 0
                    ? extras.map(e => {
                        const priceStr = e.price ? `(${e.price} Ft` + (e.priceEur ? ` / ${e.priceEur} €` : '') + ')' : '';
                        return `${e.name} ${priceStr}`;
                    }).join(', ')
                    : 'Nincs';



                // Format extras for table
                const extrasListHTML = extras.length > 0
                    ? extras.map(e => {
                        const priceStr = e.price ? `${e.price} Ft` + (e.priceEur ? ` / ${e.priceEur} €` : '') : '';
                        return `<tr><td style="padding: 10px; border-bottom: 1px solid #eeeeee; font-family: Arial, Helvetica, sans-serif; font-size: 14px;">• ${e.name}</td><td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right; font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${priceStr}</td></tr>`;
                    }).join('')
                    : '';

                // Build main data table rows
                const buildRow = (label: string, value: string) => {
                    if (!value) return '';
                    return `<tr><td style="padding: 10px; border-bottom: 1px solid #eeeeee; font-weight: bold; width: 35%; font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${label}:</td><td style="padding: 10px; border-bottom: 1px solid #eeeeee; font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${value}</td></tr>`;
                };

                // Replace detailsHTML with table rows
                let mainDataRows = buildRow('Név', `${lastName} ${firstName}`);
                mainDataRows += buildRow('Email', registration.user.email);
                mainDataRows += buildRow('Telefon', phone);
                mainDataRows += buildRow('Születési dátum', birthDate || '');
                mainDataRows += buildRow('Nem', gender);
                mainDataRows += buildRow('Póló méret', tshirtSize);
                mainDataRows += buildRow('Irányítószám', zipCode);
                mainDataRows += buildRow('Város', city);
                mainDataRows += buildRow('Cím', address);
                mainDataRows += buildRow('Klub', clubName);
                if (crewSize && crewSize > 1) {
                    mainDataRows += buildRow('Csapat létszám', `${crewSize} fő`);
                }

                // Create field ID to label mapping from event formConfig
                const fieldLabelMap = new Map<string, string>();
                const eventFormConfig = (registration.distance.event as any).formConfig;
                if (eventFormConfig && eventFormConfig.fields) {
                    eventFormConfig.fields.forEach((field: any) => {
                        if (field.id && field.label) {
                            fieldLabelMap.set(field.id, field.label);
                        }
                    });
                }

                // Add custom fields to table with proper labels
                Object.entries(regFormData).forEach(([key, value]) => {
                    const standardKeys = ['vezet', 'kereszt', 'first', 'last', 'telefon', 'phone', 'nem', 'gender',
                        'szület', 'birth', 'póló', 'tshirt', 'város', 'city', 'irányító',
                        'zip', 'cím', 'address', 'klub', 'club', 'billing', 'website', 'email', 'e-mail'];

                    const fieldLabel = fieldLabelMap.get(key);

                    // Check both key and label for standard keywords
                    const isKeyStandard = standardKeys.some(sk => key.toLowerCase().includes(sk));
                    const isLabelStandard = fieldLabel ? standardKeys.some(sk => fieldLabel.toLowerCase().includes(sk)) : false;

                    // Skip standard fields and show custom fields with proper labels
                    if (!isKeyStandard && !isLabelStandard && value) {
                        if (fieldLabel) {
                            mainDataRows += buildRow(fieldLabel, String(value));
                        } else if (!key.startsWith('field_')) {
                            mainDataRows += buildRow(key, String(value));
                        }
                    }
                });

                // Billing Data Logic (Robust Fallback)
                let billingRows = '';
                let hasExplicitBilling = false;

                // 1. Try nested billingDetails object
                if (regFormData.billingDetails && typeof regFormData.billingDetails === 'object') {
                    const bd = regFormData.billingDetails;
                    // Only consider it explicit if we have at least a Name or Address
                    if (bd.billingName || bd.billingAddress) {
                        if (bd.billingName) billingRows += buildRow('Számlázási Név', bd.billingName);
                        if (bd.billingZip || bd.billingCity || bd.billingAddress) {
                            billingRows += buildRow('Számlázási Cím', `${bd.billingZip || ''} ${bd.billingCity || ''}, ${bd.billingAddress || ''}`);
                        }
                        if (bd.billingTaxNumber) billingRows += buildRow('Adószám', bd.billingTaxNumber);

                        if (billingRows) hasExplicitBilling = true;
                    }
                }

                // 2. Try identifying billing fields at top level (flat structure) if no nested found
                if (!hasExplicitBilling) {
                    const flatBillingName = findField(['billing_name', 'számlázási név', 'számlázási nev']);
                    const flatBillingZip = findField(['billing_zip', 'számlázási irányító', 'irányítószám (számlázási)']);
                    const flatBillingCity = findField(['billing_city', 'számlázási város']);
                    const flatBillingAddress = findField(['billing_address', 'számlázási cím', 'számlázási utca']);
                    const flatBillingTax = findField(['billing_tax', 'adószám', 'tax']);

                    if (flatBillingName || flatBillingAddress) {
                        if (flatBillingName) billingRows += buildRow('Számlázási Név', flatBillingName);
                        if (flatBillingZip || flatBillingCity || flatBillingAddress) {
                            billingRows += buildRow('Számlázási Cím', `${flatBillingZip || ''} ${flatBillingCity || ''}, ${flatBillingAddress || ''}`);
                        }
                        if (flatBillingTax) billingRows += buildRow('Adószám', flatBillingTax);

                        if (billingRows) hasExplicitBilling = true;
                    }
                }

                // 3. Fallback to Registrant Data (if no explicit billing info found)
                if (!hasExplicitBilling) {
                    // Check if we have registrant address
                    if (zipCode && city && address) {
                        billingRows += buildRow('Számlázási Név', `${lastName} ${firstName} (Nevező)`);
                        billingRows += buildRow('Számlázási Cím', `${zipCode} ${city}, ${address}`);
                    } else {
                        billingRows += '<tr><td colspan="2" style="padding: 10px; font-style: italic; color: #999;">Nem lett megadva külön számlázási adat, és a nevezői cím is hiányos.</td></tr>';
                    }
                }

                // Create preview text for mobile
                const previewText = `${lastName} ${firstName} nevezett - ${registration.distance.name} - ${priceDisplay}`;

                await sendEmail({
                    to: registration.distance.event.notificationEmail,
                    subject: `⚡ ÚJ NEVEZÉS: ${registration.distance.event.title}`,
                    html: generateNotificationEmailHtml(previewText, registration, mainDataRows, billingRows, extrasListHTML, priceDisplay)
                });
            }

            revalidatePath(`/races/${eventId}`);
            revalidatePath(`/secretroom75`);

            // System Notification
            try {
                const { createNotification } = await import('@/actions/notifications');
                await createNotification(
                    userId,
                    'Sikeres nevezés!',
                    `Sikeresen neveztél a(z) ${registration.distance.event.title} versenyre.`,
                    'success',
                    `/dashboard`
                );
            } catch (e) {
                console.error('Failed to create notification', e);
            }

            return { success: true, registrationId: registration.id };
        } catch (error) {
            handleError(error, 'Nevezés sikertelen');
            return createErrorResponse(error, 'Nevezés sikertelen. Kérjük, próbáld újra!');
        } finally {
            // CRITICAL: Always release mutex, even if error occurred
            release();
        }
    } catch (outerError) {
        // Catch errors that happen before mutex acquisition
        handleError(outerError, 'Nevezés sikertelen');
        return createErrorResponse(outerError, 'Nevezés sikertelen. Kérjük, próbáld újra!');
    }
}
