import { z } from 'zod';

/**
 * Hungarian tax number validation (XXXXXXXX-X-XX format or just 11 digits)
 * Allows optional spaces and hyphens.
 */
/**
 * Alphanumeric tax/VAT number validation (allows letters, digits, spaces, hyphens, 6-25 characters)
 */
const taxNumberRegex = /^[A-Z0-9\-\s]{6,25}$/i;

/**
 * International phone number validation (allows optional +, digits, spaces, hyphens, parentheses, 7-20 characters)
 */
const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;

/**
 * Alphanumeric zip/postal code validation (allows digits, letters, spaces, hyphens, 3-10 characters)
 */
const zipRegex = /^[a-z0-9\-\s]{3,10}$/i;

/**
 * Billing data validation schema
 */
export const BillingDataSchema = z.object({
    billingName: z.string().min(1, "Számlázási név kötelező"),
    billingZip: z.string().regex(zipRegex, "Érvénytelen irányítószám"),
    billingCity: z.string().min(1, "Város kötelező"),
    billingAddress: z.string().min(5, "Cím kötelező (minimum 5 karakter)"),
    billingTaxNumber: z.string()
        .regex(taxNumberRegex, "Érvénytelen adószám vagy közösségi adószám formátum")
        .optional()
        .or(z.literal('')),
}).strict();

/**
 * Registration form data validation
 * Includes honeypot protection
 */
export const RegistrationFormDataSchema = z.object({
    email: z.string().email("Érvénytelen email").optional().or(z.literal('')),
    phone: z.string()
        .regex(phoneRegex, "Érvénytelen telefonszám")
        .optional()
        .or(z.literal('')),

    // Honeypot fields - MUST be empty!
    website: z.literal('').optional(),
    website_field: z.literal('').optional(),
}).catchall(z.unknown()); // Allow other dynamic fields

/**
 * Event extras validation
 */
export const EventExtraSchema = z.object({
    name: z.string().min(1, "Extra név kötelező"),
    price: z.number(), // Allow negative for discounts
    priceEur: z.number().min(0).optional(),
    category: z.string().optional(),
    description: z.string().optional(),
});

export const EventExtrasArraySchema = z.array(EventExtraSchema);

/**
 * Crew size validation (for team registrations)
 */
export const CrewSizeSchema = z.number()
    .int("Létszám egész szám kell legyen")
    .min(1, "Minimum 1 fő")
    .max(50, "Maximum 50 fő");

/**
 * Payment method validation
 */
export const PaymentMethodSchema = z.enum(['CARD', 'BANK_TRANSFER', 'CASH']);

/**
 * Type exports
 */
export type BillingData = z.infer<typeof BillingDataSchema>;
export type RegistrationFormData = z.infer<typeof RegistrationFormDataSchema>;
export type EventExtra = z.infer<typeof EventExtraSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

/**
 * Validation helper - returns user-friendly error messages
 */
export function validateSchema<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors = result.error.issues.map((err: any) =>
        `${err.path.join('.')}: ${err.message}`
    );

    return { success: false, errors };
}
