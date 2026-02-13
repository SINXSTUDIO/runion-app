import { SellerForPDF } from './seller';
import { EventExtra } from './extras';

/**
 * Billing details structure within formData
 */
export interface BillingDetails {
    billingName?: string;
    billingZip?: string;
    billingCity?: string;
    billingAddress?: string;
    billingTaxNumber?: string;
}

/**
 * Registration data with all necessary relations for PDF generation
 */
export interface RegistrationWithDetails {
    id: string;
    userId: string;
    distanceId: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    formData?: {
        billingDetails?: BillingDetails;
        [key: string]: unknown;
    } | null;
    extras?: EventExtra[] | null;
    finalPrice?: number | null;
    proformaNumber?: string | null;
    proformaGeneratedAt?: Date | null;
    proformaUrl?: string | null;
    createdAt: Date;
    paymentMethod?: string;
    paymentStatus?: string;
    crewSize?: number | null;
    distance: {
        id: string;
        name: string;
        price: number;
        event: {
            id: string;
            title: string;
            seller?: any;
            confirmationEmailText?: string | null;
        };
    };
}

/**
 * Event data for PDF generation
 */
export interface EventDataForPDF {
    id: string;
    title: string;
    titleEn?: string | null;
    titleDe?: string | null;
    eventDate: Date;
    location: string;
    slug: string;
    organizerName?: string | null;
}

/**
 * Distance data for PDF generation
 */
export interface DistanceDataForPDF {
    id: string;
    name: string;
    nameEn?: string | null;
    nameDe?: string | null;
    price: number;
    priceEur?: number | null;
}

/**
 * Complete proforma PDF generation data
 */
export interface ProformaGenerationData {
    registration: RegistrationWithDetails;
    event: EventDataForPDF;
    distance: DistanceDataForPDF;
    seller: SellerForPDF;
    locale: 'hu' | 'en' | 'de';
}

/**
 * Order data for shop PDF generation
 */
export interface OrderDataForPDF {
    id: string;
    orderNumber: string;
    totalAmount: number;
    billingName: string;
    billingCity: string;
    billingZip: string;
    billingAddress: string;
    billingTaxNumber?: string | null;
    shippingName: string;
    shippingCity: string;
    shippingZip: string;
    shippingAddress: string;
    shippingPhone?: string;
    note?: string | null;
    createdAt: Date;
}

/**
 * Order item data for shop PDF
 */
export interface OrderItemDataForPDF {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    size?: string | null;
    productName: string; // For direct access
    product: {
        name: string;
        nameEn?: string | null;
        nameDe?: string | null;
    };
}

/**
 * Global settings data for shop PDF
 */
export interface GlobalSettingsForPDF {
    shopBeneficiaryName?: string | null;
    shopBankName?: string | null;
    shopBankAccountNumber?: string | null;
    shopTaxNumber?: string | null;
    shopAddress?: string | null;
    shopLogoUrl?: string | null;
    shopEmail?: string | null;
    shopNote?: string | null;
}

/**
 * Shop proforma PDF generation data
 */
export interface ShopProformaGenerationData {
    order: OrderDataForPDF;
    items: OrderItemDataForPDF[];
    settings: GlobalSettingsForPDF;
    locale: 'hu' | 'en' | 'de';
}

/**
 * PDF locale type
 */
export type PDFLocale = 'hu' | 'en' | 'de';

/**
 * Validate PDF locale
 */
export function isValidPDFLocale(locale: string): locale is PDFLocale {
    return ['hu', 'en', 'de'].includes(locale);
}
