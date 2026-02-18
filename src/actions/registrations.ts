'use server';

import { prisma } from '@/lib/prisma';
import { PaymentStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function importRegistrationPayments(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, message: 'Nincs fájl kiválasztva.' };
        }

        const text = await file.text();
        let rawLines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

        // Handle Excel 2007 "sep=;" directive if present
        if (rawLines.length > 0 && rawLines[0].toLowerCase().startsWith('sep=')) {
            rawLines.shift();
        }

        if (rawLines.length < 2) {
            return { success: false, message: 'Üres vagy hibás CSV fájl.' };
        }

        // --- Delimiter Detection ---
        // We check the first line (header) for required columns using common delimiters.
        const headerLine = rawLines[0];
        const delimiters = [';', ',', '\t', '|'];
        let delimiter = '';
        let headers: string[] = [];

        for (const d of delimiters) {
            const h = parseCSVLine(headerLine, d).map(val => val.trim().replace(/^"|"$/g, ''));
            // Check if this split gives us at least 2 columns and potentially the ones we need
            // "id" is mandatory. "paymentStatus" is mandatory.
            const hasId = h.some(col => col.toLowerCase() === 'id' || col.toLowerCase() === 'azonosító');
            const hasStatus = h.some(col => col.toLowerCase() === 'paymentstatus' || col.toLowerCase() === 'fizetési státusz' || col.toLowerCase() === 'fizetesi statusz');

            if (hasId && hasStatus) {
                delimiter = d;
                headers = h;
                break;
            }
        }

        if (!delimiter) {
            // Fallback: try counts if strict header check fails (though strict Check is safer)
            // Or just return error. Let's be helpful and suggest what was missing.
            return {
                success: false,
                message: 'Nem sikerült automatikusan felismerni a CSV formátumot. Ellenőrizd, hogy az "id" és "paymentStatus" (vagy "Fizetési Státusz") oszlopok megvannak-e, és pontosvessző (;) vagy vessző (,) az elválasztó.'
            };
        }

        // Identify column indices
        const idIndex = headers.findIndex(h => h.toLowerCase() === 'id' || h.toLowerCase() === 'azonosító');
        const statusIndex = headers.findIndex(h => h.toLowerCase() === 'paymentstatus' || h.toLowerCase() === 'fizetési státusz' || h.toLowerCase() === 'fizetesi statusz');

        if (idIndex === -1 || statusIndex === -1) {
            return { success: false, message: 'A fejlécek elemzése sikertelen. (Hiányzó ID vagy Státusz oszlop)' };
        }

        let updatedCount = 0;
        const errors: string[] = [];
        const errorLines: number[] = [];

        // Process data lines
        for (let i = 1; i < rawLines.length; i++) {
            const line = rawLines[i].trim();
            if (!line) continue;

            const cols = parseCSVLine(line, delimiter);

            // Basic validation: row should have roughly same columns as header
            // Allow some flexibility but must have at least up to the max index we need
            const maxIndex = Math.max(idIndex, statusIndex);
            if (cols.length <= maxIndex) {
                console.warn(`Skipping line ${i + 1}: too few columns. Expected at least ${maxIndex + 1}, found ${cols.length}. Content: ${line}`);
                errorLines.push(i + 1);
                continue;
            }

            const id = cols[idIndex].trim();
            const statusRaw = cols[statusIndex].trim();

            // Map status text to PaymentStatus Enum
            let status: PaymentStatus | undefined;
            const s = statusRaw.toUpperCase();

            if (['PAID', 'FIZETVE'].includes(s)) status = 'PAID';
            else if (['UNPAID', 'NINCS_FIZETVE', 'FIZETENDŐ', 'FIZETENDO'].includes(s)) status = 'UNPAID';
            else if (['PARTIALLY_PAID', 'RÉSZBEN_FIZETVE', 'RESZBEN_FIZETVE'].includes(s)) status = 'PARTIALLY_PAID';
            else if (['REFUNDED', 'VISSZATÉRÍTVE', 'VISSZATERITVE'].includes(s)) status = 'REFUNDED';
            else if (Object.values(PaymentStatus).includes(s as PaymentStatus)) status = s as PaymentStatus;

            if (id && status) {
                try {
                    await prisma.registration.update({
                        where: { id },
                        data: { paymentStatus: status }
                    });
                    updatedCount++;
                } catch (err) {
                    console.error(`Failed to update registration ${id}:`, err);
                    errors.push(id);
                }
            } else {
                // If status couldn't be mapped or ID is missing
                if (id) {
                    console.warn(`Invalid status for ID ${id}: ${statusRaw}`);
                    // treat as non-fatal but count it? Or maybe fatal for that row.
                    // Let's add to errors list if we want to be strict, or just ignore. 
                    // User asked for "Simple but stable". Stable means valid updates happen.
                    // But maybe we should warn?
                    // For now, silently skip if status invalid, or log.
                }
            }
        }

        revalidatePath('/[locale]/secretroom75/events/[id]/registrations', 'page');

        let msg = `Sikeres importálás! ${updatedCount} db befizetés frissítve.`;
        if (errors.length > 0) msg += ` (${errors.length} hiba az adatbázis mentéskor)`;
        if (errorLines.length > 0) msg += ` (${errorLines.length} sor nem feldolgozható)`;

        return {
            success: true,
            message: msg
        };

    } catch (error) {
        console.error('Import failed:', error);
        return { success: false, message: 'Szerver hiba történt az importálás során.' };
    }
}

/**
 * Robust CSV Line Parser
 * Handles:
 * - Delimiters
 * - Quoted fields (including delimiters inside quotes)
 * - Escaped quotes ("") inside quoted fields
 * - Empty fields
 */
function parseCSVLine(text: string, delimiter: string): string[] {
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1]; // Safe even at end (returns undefined)

        if (inQuotes) {
            if (char === '"') {
                if (nextChar === '"') {
                    // Escaped quote: "" -> "
                    currentValue += '"';
                    i++; // Skip the next quote
                } else {
                    // Closing quote
                    inQuotes = false;
                }
            } else {
                currentValue += char;
            }
        } else {
            if (char === '"' && currentValue.length === 0) {
                // Opening quote (must be at start of value)
                inQuotes = true;
            } else if (char === delimiter) {
                // End of value
                values.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
    }
    // Add the last value
    values.push(currentValue);

    return values;
}

export async function deleteRegistration(id: string) {
    try {
        // 1. Fetch FULL registration data for audit log
        const registration = await prisma.registration.findUnique({
            where: { id },
            include: {
                distance: {
                    include: {
                        event: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    }
                }
            }
        });

        if (!registration) {
            return { success: false, message: 'Nevezés nem található.' };
        }

        // 2. Log the deletion with FULL snapshot
        const { logAuditAction } = await import('@/lib/audit-logger');
        await logAuditAction('DELETE', 'Registration', id, {
            ...registration,
            // Include readable context
            eventTitle: registration.distance.event.title,
            distanceName: registration.distance.name,
            userName: `${registration.user.firstName} ${registration.user.lastName}`,
            userEmail: registration.user.email,
        });

        const eventTitle = registration.distance.event.title;
        const userId = registration.userId;

        // 3. Delete notifications related to this event registration
        await prisma.notification.deleteMany({
            where: {
                userId: userId,
                title: 'Sikeres nevezés!',
                message: {
                    contains: eventTitle
                }
            }
        });

        // 4. Delete the registration
        await prisma.registration.delete({
            where: { id }
        });

        console.log(`[DeleteRegistration] ✅ Registration ${id} deleted successfully`);

        revalidatePath('/[locale]/secretroom75/events/[id]/registrations', 'page');
        return { success: true, message: 'Nevezés és kapcsolódó értesítés sikeresen törölve.' };
    } catch (error) {
        console.error('[DeleteRegistration] ❌ Delete failed:', error);
        return { success: false, message: 'Hiba történt a törlés során.' };
    }
}
