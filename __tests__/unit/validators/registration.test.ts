import { describe, it, expect } from 'vitest';
import { BillingDataSchema } from '@/lib/validators/registration';

describe('BillingDataSchema - Tax Number Validation', () => {
    const baseBillingData = {
        billingName: 'Test Company Kft.',
        billingZip: '1234',
        billingCity: 'Budapest',
        billingAddress: 'Fő utca 1.',
    };

    it('should validate successfully with valid Hungarian tax numbers', () => {
        const validHungarian = [
            '12345678-1-12',
            '12345678-2-42',
            '12345678-3-12',
            '12345678 1 12',
            '12345678112',
        ];

        validHungarian.forEach(taxNum => {
            const data = { ...baseBillingData, billingTaxNumber: taxNum };
            const result = BillingDataSchema.safeParse(data);
            expect(result.success).toBe(true);
        });
    });

    it('should validate successfully with valid EU/international VAT numbers', () => {
        const validInternational = [
            'DE123456789',
            'ATU12345678',
            'GB-123456789',
            'NL800100200B01',
            'IE1234567T',
            'PL1234567890',
        ];

        validInternational.forEach(taxNum => {
            const data = { ...baseBillingData, billingTaxNumber: taxNum };
            const result = BillingDataSchema.safeParse(data);
            expect(result.success).toBe(true);
        });
    });

    it('should allow empty or optional tax numbers', () => {
        const emptyData = { ...baseBillingData };
        const result1 = BillingDataSchema.safeParse(emptyData);
        expect(result1.success).toBe(true);

        const emptyStringData = { ...baseBillingData, billingTaxNumber: '' };
        const result2 = BillingDataSchema.safeParse(emptyStringData);
        expect(result2.success).toBe(true);
    });

    it('should reject invalid tax numbers', () => {
        const invalidTaxNumbers = [
            '123', // Too short (minimum 6 characters)
            'DE12345678901234567890123456789', // Too long (maximum 25 characters)
            'DE@12345678', // Contains invalid character (@)
            'DE12345#78', // Contains invalid character (#)
        ];

        invalidTaxNumbers.forEach(taxNum => {
            const data = { ...baseBillingData, billingTaxNumber: taxNum };
            const result = BillingDataSchema.safeParse(data);
            expect(result.success).toBe(false);
        });
    });
});
