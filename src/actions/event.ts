'use server';

import prisma from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { generateOrderEmailContent as generateEmailContent, sendEmail } from '@/lib/email';
import { logError } from '@/lib/logger';

const RegistrationSchema = z.object({
    eventId: z.string(),
    distanceId: z.string(),
    name: z.string().min(2),
    email: z.string().email(),
    birthDate: z.string(),
    gender: z.enum(['MALE', 'FEMALE']),
    zipCode: z.string(),
    city: z.string(),
    address: z.string(),
    phone: z.string(),
    tshirtSize: z.string(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    paymentMethod: z.enum(['CARD', 'TRANSFER']),
    terms: z.string().optional(),

    // Billing fields
    requestCompanyInvoice: z.string().optional(), // Checkbox 'on'
    taxNumber: z.string().optional(), // Validated if requestCompanyInvoice is on

    billingSameAsPersonal: z.string().optional(), // Checkbox 'on'
    billingName: z.string().optional(),
    billingZip: z.string().optional(),
    billingCity: z.string().optional(),
    billingAddress: z.string().optional(),
});

export async function registerForEvent(prevState: any, formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());

    // Honeypot check
    if (rawData.website_hp) {
        return { message: 'Success', success: true }; // Silent success for bots
    }

    // Parse data
    const validatedFields = RegistrationSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            message: 'Hibás adatok. Kérlek ellenőrizd a mezőket.',
            errors: validatedFields.error.flatten().fieldErrors,
            success: false
        };
    }

    const data = validatedFields.data;

    try {
        // 1. Find or Create User
        // We split name into First/Last for the User model (simplistic approach)
        const nameParts = data.name.trim().split(' ');
        const lastName = nameParts[0];
        const firstName = nameParts.slice(1).join(' ');

        const user = await prisma.user.upsert({
            where: { email: data.email },
            update: {
                firstName: firstName || data.name, // Fallback if single name
                lastName: lastName || '',
                birthDate: new Date(data.birthDate),
                gender: data.gender as any,
                city: data.city,
                zipCode: data.zipCode,
                address: data.address,
                phoneNumber: data.phone,
                tshirtSize: data.tshirtSize,
                emergencyContactName: data.emergencyContactName,
                emergencyContactPhone: data.emergencyContactPhone,
            },
            create: {
                email: data.email,
                firstName: firstName || data.name,
                lastName: lastName || '',
                birthDate: new Date(data.birthDate),
                gender: data.gender as any,
                city: data.city,
                zipCode: data.zipCode,
                address: data.address,
                phoneNumber: data.phone,
                tshirtSize: data.tshirtSize,
                emergencyContactName: data.emergencyContactName,
                emergencyContactPhone: data.emergencyContactPhone,
                role: 'USER',
            }
        });

        // 2. Create Registration
        const registration = await prisma.registration.create({
            data: {
                userId: user.id,
                distanceId: data.distanceId,
                registrationStatus: 'PENDING', // Correct field name
                bibSent: false,
                formData: {
                    billingName: data.billingSameAsPersonal === 'on' ? (user.firstName + ' ' + user.lastName) : data.billingName,
                    billingZip: data.billingSameAsPersonal === 'on' ? user.zipCode : data.billingZip,
                    billingCity: data.billingSameAsPersonal === 'on' ? user.city : data.billingCity,
                    billingAddress: data.billingSameAsPersonal === 'on' ? user.address : data.billingAddress,
                    taxNumber: data.requestCompanyInvoice === 'on' ? data.taxNumber : undefined,
                }
            },
            include: {
                distance: {
                    include: {
                        event: {
                            include: {
                                seller: true
                            }
                        }
                    }
                },
                user: true
            }
        });

        // ... inside try block after saving registration ...

        // 3. Trigger Email Sending & Proforma
        let attachments: any[] = [];
        let proformaUrl = null;

        if (data.paymentMethod === 'TRANSFER') {
            const { generateProformaPDF } = await import('@/lib/pdf-generator');

            // Access event and seller via distance
            const event = registration.distance.event;
            const seller = (event as any).seller;

            if (seller) {
                const pdfBuffer = await generateProformaPDF(
                    registration as any,
                    event as any,
                    registration.distance as any,
                    seller
                );

                // For email attachment
                attachments.push({
                    filename: `dijbekero_${registration.id.substring(0, 8)}.pdf`,
                    content: Buffer.from(pdfBuffer)
                });

                // ... continue with PDF saving logic ...
                const fs = await import('fs');
                const path = await import('path');
                const fileName = `proforma_${registration.id}.pdf`;
                const publicPath = path.join(process.cwd(), 'public', 'invoices');
                if (!fs.existsSync(publicPath)) fs.mkdirSync(publicPath, { recursive: true });
                fs.writeFileSync(path.join(publicPath, fileName), Buffer.from(pdfBuffer));

                proformaUrl = `/invoices/${fileName}`;

                // Update registration with url
                await prisma.registration.update({
                    where: { id: registration.id },
                    data: {
                        proformaUrl: proformaUrl,
                        proformaNumber: `PRO-${registration.id.substring(0, 8).toUpperCase()}`,
                        proformaGeneratedAt: new Date()
                    }
                });
            }
        }

        const emailBody = await generateEmailContent(registration.id);

        await sendEmail({
            to: user.email,
            subject: 'Sikeres Regisztráció - RUNION',
            html: emailBody,
            attachments: attachments.length > 0 ? attachments : undefined
        });

        revalidatePath(`/races`);
        return {
            message: 'Sikeres regisztráció! Kérlek fizesd ki a nevezési díjat.',
            success: true,
            registrationId: registration.id,
            invoiceLink: proformaUrl || undefined // Return the generated URL
        };

    } catch (error) {
        await logError(error, 'Event Registration');
        return { message: 'Adatbázis hiba történt. Részletek a szerver naplóban.', success: false };
    }
}
