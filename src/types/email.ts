/**
 * Email attachment structure
 */
export interface EmailAttachment {
    filename: string;
    content: Buffer;
    contentType: string;
}

/**
 * Email sending parameters
 */
export interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    attachments?: EmailAttachment[];
    from?: string;
}

/**
 * Email template data for shop orders
 */
export interface ShopOrderEmailData {
    orderNumber: string;
    customerName: string;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    shippingAddress: string;
}

/**
 * Email template data for event registrations
 */
export interface RegistrationEmailData {
    eventTitle: string;
    distanceName: string;
    registrantName: string;
    registrationDate: Date;
    price: string;
    paymentReference: string;
}
