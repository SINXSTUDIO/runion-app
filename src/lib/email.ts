import nodemailer from 'nodemailer';
import type { SendEmailParams } from '@/types/email';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: true, // true for 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

export const sendEmail = async ({ to, subject, html, attachments, from }: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: unknown }> => {
    try {
        console.log('Sending email to:', to);
        const info = await transporter.sendMail({
            from: from || process.env.SHOP_EMAIL_FROM || process.env.EMAIL_FROM || '"RUNION.EU" <runionsport@gmail.com>',
            to,
            subject,
            html,
            attachments,
        });
        console.log('Message sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
};

export const generateOrderEmailContent = async (orderId: string) => {
    // Basic implementation to satisfy the build
    return `
    <html>
      <body>
        <h1>Rendelés Visszaigazolás</h1>
        <p>Rendelés azonosító: ${orderId}</p>
        <p>Köszönjük a rendelését!</p>
      </body>
    </html>
    `;
};

const EMAIL_TRANSLATIONS = {
    hu: {
        shopTitle: 'RUNION SHOP',
        orderConfirmation: 'Rendelés Visszaigazolás',
        dear: 'Kedves',
        thankYou: 'Köszönjük a rendelésedet! Sikeresen rögzítettük rendszerünkben az alábbi adatokkal.',
        orderNumber: 'Rendelés száma:',
        date: 'Dátum:',
        itemsTitle: 'Megrendelt termékek',
        product: 'Termék',
        qty: 'Menny.',
        unitPrice: 'Egységár',
        total: 'Összesen',
        grandTotal: 'Végösszeg:',
        shippingCost: 'Szállítási költség',
        free: 'Ingyenes',
        noteTitle: 'Vevői Megjegyzés:',
        paymentInfo: '💳 Fizetési Információk',
        transferText: 'Kérjük, utald át a végösszeget az alábbi bankszámlára:',
        beneficiary: 'Kedvezményezett:',
        bank: 'Bank:',
        account: 'Számlaszám:',
        reference: 'Közlemény:',
        refNote: 'A közlemény rovatba kérjük, csak a megrendelés számát írd be!',
        shippingInfo: 'Szállítási adatok',
        billingInfo: 'Számlázási adatok',
        taxId: 'Adószám:',
        footer: '© ' + new Date().getFullYear() + ' Runion',
        subject: 'Rendelés Visszaigazolás',
    },
    en: {
        shopTitle: 'RUNION SHOP',
        orderConfirmation: 'Order Confirmation',
        dear: 'Dear',
        thankYou: 'Thank you for your order! We have successfully recorded it with the following details.',
        orderNumber: 'Order Number:',
        date: 'Date:',
        itemsTitle: 'Ordered Products',
        product: 'Product',
        qty: 'Qty',
        unitPrice: 'Unit Price',
        total: 'Total',
        grandTotal: 'Grand Total:',
        shippingCost: 'Shipping Cost',
        free: 'Free',
        noteTitle: 'Customer Note:',
        paymentInfo: '💳 Payment Information',
        transferText: 'Please transfer the total amount to the following bank account:',
        beneficiary: 'Beneficiary:',
        bank: 'Bank:',
        account: 'Account Number:',
        reference: 'Reference:',
        refNote: 'Please enter only the order number in the reference field!',
        shippingInfo: 'Shipping Information',
        billingInfo: 'Billing Information',
        taxId: 'Tax ID:',
        footer: '© ' + new Date().getFullYear() + ' Runion',
        subject: 'Order Confirmation',
    },
    de: {
        shopTitle: 'RUNION SHOP',
        orderConfirmation: 'Bestellbestätigung',
        dear: 'Hallo',
        thankYou: 'Vielen Dank für Ihre Bestellung! Wir haben sie erfolgreich mit folgenden Daten erfasst.',
        orderNumber: 'Bestellnummer:',
        date: 'Datum:',
        itemsTitle: 'Bestellte Produkte',
        product: 'Produkt',
        qty: 'Menge',
        unitPrice: 'Einzelpreis',
        total: 'Gesamt',
        grandTotal: 'Gesamtsumme:',
        shippingCost: 'Versandkosten',
        free: 'Kostenlos',
        noteTitle: 'Kundenhinweis:',
        paymentInfo: '💳 Zahlungsinformationen',
        transferText: 'Bitte überweisen Sie den Gesamtbetrag auf folgendes Bankkonto:',
        beneficiary: 'Begünstigter:',
        bank: 'Bank:',
        account: 'Kontonummer:',
        reference: 'Verwendungszweck:',
        refNote: 'Bitte geben Sie im Verwendungszweck nur die Bestellnummer an!',
        shippingInfo: 'Versandinformationen',
        billingInfo: 'Rechnungsinformationen',
        taxId: 'Steuernummer:',
        footer: '© ' + new Date().getFullYear() + ' Runion',
        subject: 'Bestellbestätigung',
    }
} as const;

type Locale = keyof typeof EMAIL_TRANSLATIONS;

export const generateShopOrderEmail = (order: any, items: any[], settings?: any, locale: string = 'hu') => {
    const t = EMAIL_TRANSLATIONS[locale as Locale] || EMAIL_TRANSLATIONS.hu;

    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eeeeee; font-family: Arial, sans-serif; font-size: 14px;">
                ${item.productName} ${item.size ? `(${item.size})` : ''}
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: center; font-family: Arial, sans-serif; font-size: 14px;">
                ${item.quantity} db
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right; font-family: Arial, sans-serif; font-size: 14px;">
                ${Number(item.price).toLocaleString('hu-HU')} Ft
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold;">
                ${(item.quantity * item.price).toLocaleString('hu-HU')} Ft
            </td>
        </tr>
    `).join('');

    const itemsTotal = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const shippingCost = Number(order.totalAmount) - itemsTotal;

    // Add Shipping Row
    const shippingHtml = `
        <tr>
            <td style="padding: 10px; border-bottom: 2px solid #eeeeee; font-family: Arial, sans-serif; font-size: 14px; font-style: italic;">
                ${t.shippingCost}
            </td>
            <td style="padding: 10px; border-bottom: 2px solid #eeeeee; text-align: center; font-family: Arial, sans-serif; font-size: 14px;">
                1
            </td>
            <td style="padding: 10px; border-bottom: 2px solid #eeeeee; text-align: right; font-family: Arial, sans-serif; font-size: 14px;">
                ${shippingCost > 0 ? `${shippingCost.toLocaleString('hu-HU')} Ft` : t.free}
            </td>
            <td style="padding: 10px; border-bottom: 2px solid #eeeeee; text-align: right; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold;">
                ${shippingCost > 0 ? `${shippingCost.toLocaleString('hu-HU')} Ft` : '0 Ft'}
            </td>
        </tr>
    `;

    const fullItemsHtml = itemsHtml + shippingHtml;

    const beneficiaryName = settings?.shopBeneficiaryName || 'Runion SE';
    const bankName = settings?.shopBankName || 'OTP Bank';
    const bankAccount = settings?.shopBankAccountNumber || '11700000-00000000-00000000';

    const shopNoteHtml = settings?.shopNote ? `
        <div style="background-color: #fff; border: 1px dashed #ccc; padding: 15px; margin: 20px 0; color: #555; border-radius: 8px;">
            <strong style="color: #333;">Megjegyzés:</strong><br>
            ${settings.shopNote.replace(/\n/g, '<br>')}
        </div>
    ` : '';

    const bankTransferDetails = `
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fff9e6; margin: 30px 0; border: 2px solid #ffd700; border-radius: 8px;">
            <tr>
            <td style="padding: 20px;">
                <h3 style="margin: 0 0 15px 0; font-size: 20px; color: #b7791f; font-family: Arial, sans-serif; font-weight: bold;">${t.paymentInfo}</h3>
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #333333; font-family: Arial, sans-serif;">${t.transferText}</p>

                        <p style="margin: 5px 0; font-size: 14px; color: #333333; font-family: Arial, sans-serif;">
                            <strong>${t.beneficiary} </strong> ${beneficiaryName}<br>
                                <strong>${t.bank} </strong> ${bankName}<br>
                                    <strong>${t.account} </strong> ${bankAccount}<br>
                                        <strong>${t.reference} </strong> ${order.orderNumber}
                                            </p>

                                            <p style="margin-top: 15px; font-size: 13px; color: #666; font-family: Arial, sans-serif;">
                                                ${t.refNote}
                                                    </p>
                                                    </td>
                                                    </tr>
                                                    </table>
    `;

    return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${t.subject} - ${t.shopTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
    <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <!-- Header -->
            <tr>
            <td align="center" style="background-color: #111111; padding: 30px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">${t.shopTitle}</h1>
                <p style="color: #888888; margin: 10px 0 0 0; font-size: 14px;">${t.orderConfirmation}</p>
            </td>
            </tr>

            <!-- Content -->
            <tr>
            <td style="padding: 40px 30px;">
                <p style="color: #333333; font-size: 16px; margin-bottom: 20px;">
                    ${t.dear} <strong>${order.shippingName}</strong>!
                </p>
                <p style="color: #555555; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
                    ${t.thankYou}
                </p>

                <!-- Order Info Box -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 30px;">
                    <tr>
                    <td style="padding: 20px;">
                        <p style="margin: 0 0 10px 0; color: #666666; font-size: 13px;">${t.orderNumber}</p>
                        <p style="margin: 0 0 20px 0; color: #000000; font-size: 18px; font-weight: bold; font-family: monospace;">${order.orderNumber}</p>

                        <p style="margin: 0 0 10px 0; color: #666666; font-size: 13px;">${t.date}</p>
                        <p style="margin: 0; color: #000000; font-size: 14px;">${new Date().toLocaleDateString('hu-HU')}</p>
                    </td>
                    </tr>
                </table>

                <!-- Items Table -->
                <h3 style="color: #111111; font-size: 16px; margin-bottom: 15px; border-bottom: 2px solid #eeeeee; padding-bottom: 10px;">${t.itemsTitle}</h3>
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px; border-collapse: collapse;">
                    <thead>
                    <tr style="background-color: #f9f9f9;">
                        <th style="padding: 10px; text-align: left; font-size: 12px; color: #666666; text-transform: uppercase;">${t.product}</th>
                        <th style="padding: 10px; text-align: center; font-size: 12px; color: #666666; text-transform: uppercase;">${t.qty}</th>
                        <th style="padding: 10px; text-align: right; font-size: 12px; color: #666666; text-transform: uppercase;">${t.unitPrice}</th>
                        <th style="padding: 10px; text-align: right; font-size: 12px; color: #666666; text-transform: uppercase;">${t.total}</th>
                    </tr>
                    </thead>
                    <tbody>
                        ${fullItemsHtml}
                    </tbody>
                    <tfoot>
                    <tr>
                    <td colspan="3" style="padding: 15px 10px; text-align: right; font-weight: bold; color: #111111;">${t.grandTotal}</td>
                        <td style="padding: 15px 10px; text-align: right; font-weight: bold; color: #111111; font-size: 16px;">
                            ${Number(order.totalAmount).toLocaleString('hu-HU')} Ft
                        </td>
                    </tr>
                    </tfoot>
                </table>

                ${shopNoteHtml}

                ${order.note ? `
                    <div style="background-color: #f0f9ff; border: 1px dashed #00f2fe; padding: 15px; margin: 20px 0; border-radius: 8px;">
                        <strong style="color: #333; font-size: 13px; text-transform: uppercase;">${t.noteTitle}</strong><br>
                        <p style="margin: 5px 0 0 0; color: #555; font-style: italic;">${order.note.replace(/\n/g, '<br>')}</p>
                    </div>
                ` : ''}

                ${bankTransferDetails}

                <!-- Shipping / Billing Info -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                    <td valign="top" width="50%" style="padding-right: 15px;">
                        <h4 style="color: #666666; font-size: 12px; text-transform: uppercase; margin-bottom: 10px;">${t.shippingInfo}</h4>
                        <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.5;">
                            ${order.shippingName}<br>
                            ${order.shippingZip} ${order.shippingCity}<br>
                            ${order.shippingAddress}<br>
                            ${order.shippingPhone}
                        </p>
                    </td>
                    <td valign="top" width="50%" style="padding-left: 15px;">
                        <h4 style="color: #666666; font-size: 12px; text-transform: uppercase; margin-bottom: 10px;">${t.billingInfo}</h4>
                        <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.5;">
                            ${order.billingName}<br>
                            ${order.billingZip} ${order.billingCity}<br>
                            ${order.billingAddress}<br>
                            ${order.billingTaxNumber ? `${t.taxId} ${order.billingTaxNumber}` : ''}
                        </p>
                    </td>
                    </tr>
                </table>
            </td>
            </tr>

            <!-- Footer -->
            <tr>
            <td align="center" style="background-color: #f8f9fa; padding: 20px; border-top: 1px solid #eeeeee;">
                <p style="margin: 0; color: #888888; font-size: 12px;">
                    ${t.footer}
                </p>
            </td>
            </tr>
        </table>
    </td>
    </tr>
</table>
</body>
</html>
    `;
};

export const generateTransferRequestEmail = (requestData: any) => {
    const typeNames: Record<string, string> = {
        'TRANSFER': 'Átnevezés',
        'CANCELLATION': 'Adatmódosítás',
        'MODIFICATION': 'Egyéb'
    };

    const typeName = typeNames[requestData.type] || requestData.type;

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Új kérelem érkezett</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #111; border-bottom: 2px solid #f2f2f2; padding-bottom: 10px;">Új kérelem érkezett: ${typeName}</h2>
        
        <p><strong>Feladó adatai:</strong></p>
        <ul style="list-style: none; padding: 0;">
            <li><strong>Név:</strong> ${requestData.name}</li>
            <li><strong>Email:</strong> ${requestData.email}</li>
            <li><strong>Telefon:</strong> ${requestData.phone}</li>
            <li><strong>Cím:</strong> ${requestData.zipCode} ${requestData.city}, ${requestData.address}</li>
        </ul>

        <p><strong>Kérelem részletei:</strong></p>
        <ul style="list-style: none; padding: 0;">
            <li><strong>Honnan:</strong> ${requestData.fromEvent}</li>
            ${requestData.toEvent ? `<li><strong>Hová:</strong> ${requestData.toEvent}</li>` : ''}
            <li><strong>Megjegyzés:</strong> ${requestData.comment || '-'}</li>
        </ul>

        <div style="margin-top: 30px; padding: 15px; background: #f9f9f9; border-radius: 5px;">
            <p style="margin: 0; font-size: 14px; color: #666;">
                Ez egy automatikus értesítés a RUNION rendszeréből. A kérelem az adminisztrációs felületen kezelhető.
            </p>
        </div>
    </div>
</body>
</html>
    `;
};
