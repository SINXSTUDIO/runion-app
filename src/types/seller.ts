import { Seller } from '@prisma/client';

/**
 * Complete Seller data with all fields
 */
export interface SellerData {
    id: string;
    key: string | null;
    name: string;
    address: string;
    phone: string | null;
    email: string | null;
    taxNumber: string | null;
    regNumber: string | null;
    representative: string | null;
    bankName: string | null;
    bankAccountNumber: string | null;
    iban: string | null;
    bankAccountNumberEuro: string | null;
    ibanEuro: string | null;
    order: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Seller summary for dropdowns and lists
 */
export type SellerSummary = Pick<SellerData, 'id' | 'name' | 'active'>;

/**
 * Seller for PDF generation (only necessary fields)
 */
export interface SellerForPDF {
    id: string;
    name: string;
    address: string;
    email?: string | null;
    taxNumber: string | null;
    regNumber: string | null;
    bankName: string | null;
    bankAccountNumber: string | null;
    iban: string | null;
    nameEuro?: string | null;
    bankAccountNumberEuro?: string | null;
    ibanEuro?: string | null;
    bankNameEur?: string | null;
    swift?: string | null;
}

/**
 * Type guard to check if object is a valid Seller
 */
export function isSellerData(obj: unknown): obj is SellerData {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'name' in obj &&
        'address' in obj
    );
}
