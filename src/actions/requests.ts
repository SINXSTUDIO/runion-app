
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { sendEmail, generateTransferRequestEmail } from '@/lib/email';
import { getSettings } from './settings';

// Define the schema based on the user's form
const ChangeRequestSchema = z.object({
    name: z.string().min(2, "A név megadása kötelező"),
    email: z.string().email("Érvényes email cím szükséges"),
    phone: z.string().min(5, "Érvényes telefonszám szükséges"),
    birthDate: z.string().optional(), // We'll parse this to Date
    address: z.string().min(5, "Cím megadása kötelező"),
    city: z.string().min(2, "Város megadása kötelező"),
    zipCode: z.string().min(4, "Irányítószám szükséges"),

    fromEvent: z.string().min(3, "Melyik versenyről?"),
    toEvent: z.string().optional(), // Required only for transfer

    type: z.enum(['TRANSFER', 'CANCELLATION', 'MODIFICATION']).default('TRANSFER'),

    comment: z.string().optional(),

    // Checkboxes (we just validate they are true if required)
    termsAccepted: z.boolean().refine(val => val === true, { message: "Az ÁSZF elfogadása kötelező" }),
    privacyAccepted: z.boolean().refine(val => val === true, { message: "Az Adatvédelmi nyilatkozat elfogadása kötelező" }),
});

export async function submitChangeRequest(prevState: any, formData: FormData) {
    try {
        const rawData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            birthDate: formData.get('birthDate'),
            address: formData.get('address'),
            city: formData.get('city'),
            zipCode: formData.get('zipCode'),

            fromEvent: formData.get('fromEvent'),
            toEvent: formData.get('toEvent'),

            type: formData.get('type') || 'TRANSFER',
            comment: formData.get('comment'),

            termsAccepted: formData.get('termsAccepted') === 'on',
            privacyAccepted: formData.get('privacyAccepted') === 'on',
        };

        const validated = ChangeRequestSchema.parse(rawData);

        // Convert string date to Date object if present
        let birthDateDate = null;
        if (validated.birthDate) {
            birthDateDate = new Date(validated.birthDate);
            if (isNaN(birthDateDate.getTime())) {
                birthDateDate = null;
            }
        }

        // Save to Database
        // @ts-ignore - ChangeRequest might not be in generated types yet
        await (prisma as any).changeRequest.create({
            data: {
                type: validated.type,
                name: validated.name,
                email: validated.email,
                phone: validated.phone,
                birthDate: birthDateDate,
                address: validated.address,
                city: validated.city,
                zipCode: validated.zipCode,

                fromEvent: validated.fromEvent,
                toEvent: validated.toEvent,

                comment: validated.comment,
                status: 'PENDING'
            }
        });

        // Revalidate admin page
        revalidatePath('/[locale]/secretroom75/requests', 'page');

        // Send Notification Email
        try {
            const settings = await getSettings();
            if (settings && (settings as any).transferEmail) {
                const emailHtml = generateTransferRequestEmail({
                    ...validated,
                    createdAt: new Date()
                });

                await sendEmail({
                    to: (settings as any).transferEmail,
                    subject: `Új átnevezési/módosítási kérelem: ${validated.name}`,
                    html: emailHtml
                });
            }
        } catch (emailError) {
            console.error('Failed to send notification email:', emailError);
            // Don't fail the whole request if email fails
        }

        return { success: true, message: 'Kérelmét sikeresen rögzítettük! Hamarosan feldolgozzuk.' };

    } catch (error: any) {
        console.error('Change request error:', error);

        if (error instanceof z.ZodError) {
            return {
                success: false,
                errors: error.flatten().fieldErrors,
                message: 'Kérjük javítsa a hibákat.'
            };
        }

        return { success: false, message: 'Szerver hiba történt. Kérjük próbálja később.' };
    }
}

export async function getChangeRequests() {
    // @ts-ignore
    return (prisma as any).changeRequest.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function updateRequestStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    try {
        // @ts-ignore
        await (prisma as any).changeRequest.update({
            where: { id },
            data: { status }
        });
        revalidatePath('/[locale]/secretroom75/requests', 'page');
        return { success: true };
    } catch (error) {
        return { success: false, message: String(error) };
    }
}
