import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import fs from 'fs';
import path from 'path';
import type {
    RegistrationWithDetails,
    EventDataForPDF,
    DistanceDataForPDF,
    OrderDataForPDF,
    OrderItemDataForPDF,
    GlobalSettingsForPDF,
    PDFLocale
} from '@/types/pdf';
import type { SellerForPDF } from '@/types/seller';

// Helper to replace unsupported characters
function sanitizeText(text: string | null | undefined): string {
    if (!text) return '';
    return text
        .replace(/ő/g, 'o').replace(/Ő/g, 'O')
        .replace(/ű/g, 'u').replace(/Ű/g, 'U')
        .replace(/í/g, 'i').replace(/Í/g, 'I')
        .replace(/é/g, 'e').replace(/É/g, 'E')
        .replace(/á/g, 'a').replace(/Á/g, 'A')
        .replace(/ó/g, 'o').replace(/Ó/g, 'O')
        .replace(/ú/g, 'u').replace(/Ú/g, 'U');
}
const PDF_TRANSLATIONS = {
    hu: {
        proformaTitle: 'DIJBEKERO',
        invoiceTitle: 'SZAMLA',
        receiptTitle: 'NYUGTA',
        transferOnly: 'Kizarolag utalashoz.',
        notInvoice: 'Ez a dokumentum bizonylatnak\nnem minosul.',
        issuer: 'Kibocsátó (Kedvezményezett):',
        buyer: 'Vevo:',
        orderDetails: 'Bizonylat adatai:',
        orderNumber: 'Rendelésszám:',
        date: 'Kiállítás dátuma:',
        dueDate: 'Fizetési határidő:',
        bank: 'Bank:',
        account: 'Számlaszám:',
        taxId: 'Adószám:',
        regNumber: 'Reg. szám:',
        item: 'Megnevezés',
        qty: 'Menny.',
        unitPrice: 'Egységár',
        amount: 'Összesen',
        total: 'Fizetendő:',
        thankYou: 'Köszönjük a bizalmat!',
        shipping: 'Szállítási költség'
    },
    en: {
        proformaTitle: 'PROFORMA',
        invoiceTitle: 'INVOICE',
        receiptTitle: 'RECEIPT',
        transferOnly: 'For bank transfer only.',
        notInvoice: 'This document is not an invoice.',
        issuer: 'Issuer (Beneficiary):',
        buyer: 'Buyer:',
        orderDetails: 'Document Details:',
        orderNumber: 'Order No:',
        date: 'Date of Issue:',
        dueDate: 'Due Date:',
        bank: 'Bank:',
        account: 'Account No:',
        taxId: 'Tax ID:',
        regNumber: 'Reg. No:',
        item: 'Item',
        qty: 'Qty',
        unitPrice: 'Unit Price',
        amount: 'Total',
        total: 'Total Due:',
        thankYou: 'Thank you for your trust!',
        shipping: 'Shipping Cost'
    },
    de: {
        proformaTitle: 'PROFORMA',
        invoiceTitle: 'RECHNUNG',
        receiptTitle: 'QUITTUNG',
        transferOnly: 'Nur für Überweisung.',
        notInvoice: 'Dieses Dokument ist keine Rechnung.',
        issuer: 'Aussteller (Begünstigter):',
        buyer: 'Käufer:',
        orderDetails: 'Dokumentdetails:',
        orderNumber: 'Bestellnr:',
        date: 'Ausstellungsdatum:',
        dueDate: 'Fälligkeit:',
        bank: 'Bank:',
        account: 'Kontonummer:',
        taxId: 'Steuernr:',
        regNumber: 'Reg. Nr:',
        item: 'Bezeichnung',
        qty: 'Menge',
        unitPrice: 'Einzelpreis',
        amount: 'Gesamt',
        total: 'Zu zahlen:',
        thankYou: 'Danke für Ihr Vertrauen!',
        shipping: 'Versandkosten'
    }
} as const;

type Locale = keyof typeof PDF_TRANSLATIONS;

export async function generateProformaPDF(
    registration: RegistrationWithDetails,
    event: EventDataForPDF,
    distance: DistanceDataForPDF,
    seller: SellerForPDF,
    locale: PDFLocale = 'hu'
): Promise<Uint8Array> {
    const doc = new jsPDF();
    const t = PDF_TRANSLATIONS[locale as Locale] || PDF_TRANSLATIONS.hu;
    let fontName = 'helvetica';

    // Colors
    const COLOR_RUN: [number, number, number] = [21, 21, 21];
    const COLOR_ION: [number, number, number] = [0, 242, 254];
    const COLOR_TEXT: [number, number, number] = [40, 40, 40];
    const COLOR_WHITE: [number, number, number] = [255, 255, 255];

    // -- LOGO TEXT (RUNION) --
    doc.setFontSize(32);
    doc.setTextColor(COLOR_RUN[0], COLOR_RUN[1], COLOR_RUN[2]);
    doc.text('RUN', 14, 25);
    doc.setTextColor(COLOR_ION[0], COLOR_ION[1], COLOR_ION[2]);
    doc.text('ION', 38, 25);

    // -- TITLE --
    doc.setFont(fontName, "normal");
    doc.setFontSize(22);
    doc.setTextColor(COLOR_RUN[0], COLOR_RUN[1], COLOR_RUN[2]);
    doc.text(t.proformaTitle, 196, 20, { align: 'right' });

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(t.transferOnly, 196, 25, { align: 'right' });
    doc.text(t.notInvoice, 196, 29, { align: 'right' });

    // -- SEPARATOR LINE --
    doc.setDrawColor(COLOR_ION[0], COLOR_ION[1], COLOR_ION[2]);
    doc.setLineWidth(0.5);
    doc.line(14, 33, 196, 33);

    // -- DATES & INFO --
    const today = new Date();
    const deadline = new Date(today);
    deadline.setDate(deadline.getDate() + 8);

    doc.setFontSize(10);
    doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);

    let yPos = 45;
    const rightX = 100; // Shifted left to accommodate long reference

    doc.setFont("helvetica", "bold");
    doc.text(sanitizeText(t.orderDetails), rightX, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");

    // Payment Reference
    const paymentReference = registration.proformaNumber || `REG-${registration.id.substring(0, 8).toUpperCase()}`;

    doc.text(sanitizeText(t.orderNumber), rightX, yPos);
    doc.setFontSize(9); // Slightly smaller font for long reference
    doc.text(sanitizeText(paymentReference), 196, yPos, { align: 'right' }); // Align to right margin (196)
    doc.setFontSize(10);
    yPos += 5;

    doc.text(sanitizeText(t.date), rightX, yPos);
    doc.text(format(today, 'yyyy.MM.dd'), 196, yPos, { align: 'right' });
    yPos += 5;

    doc.text(sanitizeText(t.dueDate), rightX, yPos);
    doc.setTextColor(200, 0, 0);
    doc.text(format(deadline, 'yyyy.MM.dd'), 196, yPos, { align: 'right' });
    doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);

    // -- SELLER & BUYER --
    const leftX = 14;
    yPos = 45;

    // Seller
    const sellerName = seller?.name || 'Runion SE';
    const sellerNameEuro = seller?.nameEuro || sellerName;
    const sellerAddress = seller?.address || '';
    const sellerTaxNumber = seller?.taxNumber || '';
    const sellerEmail = seller?.email || '';
    const sellerBank = seller?.bankName || '-';
    const sellerAccount = seller?.bankAccountNumber || '-';

    doc.setFont(fontName, "normal");
    doc.text(sanitizeText(t.issuer), leftX, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");

    doc.text(sanitizeText(sellerName), leftX, yPos);
    yPos += 5;
    if (sellerAddress) {
        doc.text(sanitizeText(sellerAddress), leftX, yPos);
        yPos += 5;
    }
    if (sellerTaxNumber) {
        doc.text(sanitizeText(`${t.taxId} ${sellerTaxNumber}`), leftX, yPos);
        yPos += 5;
    }
    if (sellerEmail) {
        doc.text(sanitizeText(`Email: ${sellerEmail}`), leftX, yPos);
        yPos += 5;
    }

    yPos += 6;

    // Bank Block
    doc.setFillColor(245, 245, 245);
    doc.rect(leftX - 2, yPos - 1, 95, 14, 'F');
    doc.setFont("helvetica", "bold");
    doc.text(sanitizeText(`${t.bank} ${sellerBank}`), leftX, yPos + 4);
    doc.text(sanitizeText(t.account), leftX, yPos + 9);
    doc.setFont("helvetica", "normal");
    doc.text(sellerAccount, leftX + 25, yPos + 9);

    yPos += 24;

    // Buyer (Registration Data)
    const billing = registration.formData?.billingDetails || {};
    const buyerName = billing.billingName || `${registration.user?.lastName || ''} ${registration.user?.firstName || ''}`.trim();
    const buyerAddress = billing.billingAddress ? `${billing.billingZip || ''} ${billing.billingCity || ''}, ${billing.billingAddress}`.trim() : '';
    const buyerTax = billing.billingTaxNumber;

    doc.setFont("helvetica", "bold");
    doc.text(sanitizeText(t.buyer), leftX, yPos);
    yPos += 6;

    doc.setFont("helvetica", "normal");
    doc.text(sanitizeText(buyerName), leftX, yPos);
    yPos += 5;
    if (buyerAddress) {
        doc.text(sanitizeText(buyerAddress), leftX, yPos);
        yPos += 5;
    }
    if (buyerTax) {
        doc.text(sanitizeText(`${t.taxId} ${buyerTax}`), leftX, yPos);
        yPos += 5;
    }

    // -- ITEMS PREPARATION --
    const items = [];

    // 1. Registration Fee
    let regPrice = Number(distance.price);
    if (registration.finalPrice) {
        regPrice = Number(registration.finalPrice);
    }

    items.push({
        name: `${event.title} - ${distance.name} ${t.item.toLowerCase()}`,
        qty: 1,
        price: regPrice,
        total: regPrice
    });

    // 2. Extras
    if (Array.isArray(registration.extras)) {
        registration.extras.forEach((extra: any) => {
            const extraName = locale === 'en' ? (extra.nameEn || extra.name) : locale === 'de' ? (extra.nameDe || extra.name) : extra.name;
            const extraPrice = Number(extra.price || 0);
            items.push({
                name: extraName,
                qty: 1,
                price: extraPrice,
                total: extraPrice
            });
        });
    }

    // -- TABLE GENERATION --
    const tableStartY = Math.max(yPos, 90) + 10;

    const tableRows = items.map(item => [
        sanitizeText(item.name),
        `${item.qty} db`,
        `${item.price.toLocaleString('hu-HU')} Ft`,
        `${item.total.toLocaleString('hu-HU')} Ft`
    ]);

    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    autoTable(doc, {
        startY: tableStartY,
        head: [[sanitizeText(t.item), sanitizeText(t.qty), sanitizeText(t.unitPrice), sanitizeText(t.amount)]],
        body: tableRows,
        theme: 'grid',
        headStyles: {
            fillColor: COLOR_RUN,
            textColor: COLOR_WHITE,
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { halign: 'left' },
            1: { halign: 'center' },
            2: { halign: 'right' },
            3: { halign: 'right', fontStyle: 'bold' }
        },
        styles: {
            font: fontName,
            fontSize: 9,
            cellPadding: 3
        },
        foot: [[
            { content: sanitizeText(t.total), colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fontSize: 11 } },
            { content: `${totalAmount.toLocaleString('hu-HU')} Ft`, styles: { halign: 'right', fontStyle: 'bold', fontSize: 11, textColor: COLOR_ION } }
        ]],
        footStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            lineWidth: 0.5,
            lineColor: [200, 200, 200]
        }
    });

    // -- FOOTER / PAYMENT INFO --
    let finalY = (doc as any).lastAutoTable.finalY + 15;

    if (finalY > 275) {
        doc.addPage();
        finalY = 20;
    }

    doc.setFontSize(10);
    doc.setTextColor(COLOR_RUN[0], COLOR_RUN[1], COLOR_RUN[2]);

    const footerText = locale === 'en' ? `Please include the reference in the transfer: ${paymentReference}` :
        (locale === 'de' ? `Bitte geben Sie bei der Überweisung den Verwendungszweck an: ${paymentReference}` :
            `Kérjük az átutaláshoz a közleménybe írd be: ${paymentReference}`);

    doc.text(sanitizeText(footerText), leftX, finalY);

    return doc.output('arraybuffer');
}

export async function generateShopProformaPDF(
    order: OrderDataForPDF,
    items: OrderItemDataForPDF[],
    settings: GlobalSettingsForPDF,
    locale: PDFLocale = 'hu'
): Promise<Uint8Array> {
    const doc = new jsPDF();
    const t = PDF_TRANSLATIONS[locale as Locale] || PDF_TRANSLATIONS.hu;
    let fontName = 'helvetica';

    // -- COLORS --
    const COLOR_RUN: [number, number, number] = [21, 21, 21];
    const COLOR_ION: [number, number, number] = [0, 242, 254];
    const COLOR_TEXT: [number, number, number] = [40, 40, 40];
    const COLOR_WHITE: [number, number, number] = [255, 255, 255];

    // -- LOGO (Forced Text) --
    // Force text logo by default
    doc.setFontSize(28);
    doc.setTextColor(COLOR_RUN[0], COLOR_RUN[1], COLOR_RUN[2]);
    doc.text("RUN", 14, 20);
    const runWidth = doc.getTextWidth("RUN");
    doc.setTextColor(COLOR_ION[0], COLOR_ION[1], COLOR_ION[2]);
    doc.text("ION", 14 + runWidth, 20);

    // -- TITLE --
    doc.setFont(fontName, "normal");
    doc.setFontSize(22);
    doc.setTextColor(COLOR_RUN[0], COLOR_RUN[1], COLOR_RUN[2]);
    doc.text(t.proformaTitle, 196, 20, { align: 'right' });

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(t.transferOnly, 196, 25, { align: 'right' });
    doc.text(t.notInvoice, 196, 29, { align: 'right' });

    // -- LINE --
    doc.setDrawColor(COLOR_ION[0], COLOR_ION[1], COLOR_ION[2]);
    doc.setLineWidth(0.5);
    doc.line(14, 33, 196, 33);

    // -- DATES --
    const today = new Date();
    const deadline = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

    doc.setFontSize(10);
    doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);

    let yPos = 45;
    const rightX = 120;

    doc.setFont("helvetica", "bold");
    doc.text(t.orderDetails, rightX, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");

    const paymentReference = order.orderNumber;

    doc.text(t.orderNumber, rightX, yPos);
    doc.text(paymentReference, 190, yPos, { align: 'right' }); // 190
    yPos += 5;

    doc.text(t.date, rightX, yPos);
    doc.text(format(today, 'yyyy.MM.dd'), 190, yPos, { align: 'right' }); // 190
    yPos += 5;

    doc.text(t.dueDate, rightX, yPos);
    doc.setTextColor(200, 0, 0);
    doc.text(format(deadline, 'yyyy.MM.dd'), 190, yPos, { align: 'right' }); // 190
    doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);

    // -- SELLER & BUYER --
    const leftX = 14;
    yPos = 45;

    // Seller (From Settings)
    const sellerName = settings?.shopBeneficiaryName || 'Runion SE';
    const sellerBank = settings?.shopBankName || '-';
    const sellerAccount = settings?.shopBankAccountNumber || '-';

    doc.setFont(fontName, "normal");
    doc.text(t.issuer, leftX, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");

    doc.text(sanitizeText(sellerName), leftX, yPos);
    yPos += 5;
    if (settings?.shopAddress) {
        doc.text(sanitizeText(settings.shopAddress), leftX, yPos);
        yPos += 5;
    }
    if (settings?.shopTaxNumber) {
        doc.text(`${t.taxId} ${settings.shopTaxNumber}`, leftX, yPos);
        yPos += 5;
    }
    if (settings?.shopEmail) {
        doc.text(`Email: ${settings.shopEmail}`, leftX, yPos);
        yPos += 5;
    }

    yPos += 6;

    // Bank Block
    doc.setFillColor(245, 245, 245);
    doc.rect(leftX - 2, yPos - 1, 95, 14, 'F');
    doc.setFont("helvetica", "bold");
    doc.text(`${t.bank} ${sanitizeText(sellerBank)}`, leftX, yPos + 4);
    doc.text(t.account, leftX, yPos + 9);
    doc.setFont("helvetica", "normal");
    doc.text(sellerAccount, leftX + 25, yPos + 9);

    yPos += 24;

    // Buyer
    doc.setFont("helvetica", "bold");
    doc.text(t.buyer, leftX, yPos);
    yPos += 6;

    doc.setFont("helvetica", "normal");
    doc.text(sanitizeText(order.billingName), leftX, yPos);
    yPos += 5;
    if (order.billingZip && order.billingCity) {
        doc.text(`${sanitizeText(order.billingZip)} ${sanitizeText(order.billingCity)}`, leftX, yPos);
        yPos += 5;
    }
    if (order.billingAddress) {
        doc.text(sanitizeText(order.billingAddress), leftX, yPos);
        yPos += 5;
    }
    if (order.billingTaxNumber) {
        doc.text(`${t.taxId} ${order.billingTaxNumber}`, leftX, yPos);
        yPos += 5;
    }

    // -- ITEMS TABLE --
    const tableStartY = Math.max(yPos, 90) + 10;

    const tableRows = items.map(item => [
        sanitizeText(`${item.productName} ${item.size ? `(${item.size})` : ''}`),
        `${item.quantity} db`,
        `${Number(item.price).toLocaleString('hu-HU')} Ft`,
        `${(item.quantity * item.price).toLocaleString('hu-HU')} Ft`
    ]);

    const itemsTotal = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const shippingCost = Number(order.totalAmount) - itemsTotal;

    tableRows.push([
        t.shipping,
        '1',
        shippingCost > 0 ? `${shippingCost.toLocaleString('hu-HU')} Ft` : 'Ingyenes',
        shippingCost > 0 ? `${shippingCost.toLocaleString('hu-HU')} Ft` : '0 Ft'
    ]);

    autoTable(doc, {
        startY: tableStartY,
        head: [[t.item, t.qty, t.unitPrice, t.amount]],
        body: tableRows,
        theme: 'grid',
        headStyles: {
            fillColor: COLOR_RUN,
            textColor: COLOR_WHITE,
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { halign: 'left' },
            1: { halign: 'center' },
            2: { halign: 'right' },
            3: { halign: 'right', fontStyle: 'bold' }
        },
        styles: {
            font: fontName,
            fontSize: 9,
            cellPadding: 3
        },
        foot: [[
            { content: t.total, colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fontSize: 11 } },
            { content: `${Number(order.totalAmount).toLocaleString('hu-HU')} Ft`, styles: { halign: 'right', fontStyle: 'bold', fontSize: 11, textColor: COLOR_ION } }
        ]],
        footStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            lineWidth: 0.5,
            lineColor: [200, 200, 200]
        }
    });

    if (settings?.shopNote) {
        let noteY = (doc as any).lastAutoTable.finalY + 10;

        // Page break check
        if (noteY > 260) {
            doc.addPage();
            noteY = 20;
        }

        doc.setFont(fontName, "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("Megjegyzes:", 14, noteY);

        doc.setFont(fontName, "italic");
        const splitNote = doc.splitTextToSize(sanitizeText(settings.shopNote), 180);
        doc.text(splitNote, 14, noteY + 5);
        // Manually update finalY
        (doc as any).lastAutoTable.finalY = noteY + 5 + (splitNote.length * 4);
    }

    if (order.note) {
        let noteY = (doc as any).lastAutoTable.finalY + 10;

        // Page break check
        if (noteY > 260) {
            doc.addPage();
            noteY = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("Vevoi Megjegyzes:", 14, noteY);

        doc.setFont(fontName, "italic");
        const splitNote = doc.splitTextToSize(sanitizeText(order.note), 180);
        doc.text(splitNote, 14, noteY + 5);
        (doc as any).lastAutoTable.finalY = noteY + 5 + (splitNote.length * 4);
    }

    let finalY = (doc as any).lastAutoTable.finalY + 15;

    // Page break check for footer
    if (finalY > 275) {
        doc.addPage();
        finalY = 20;
    }

    doc.setFont(fontName, "normal");
    doc.setFontSize(10);
    doc.setTextColor(COLOR_RUN[0], COLOR_RUN[1], COLOR_RUN[2]);
    // Note: This specific footer text might need translation too, but keeping it simple for now or using a generic one
    const footerText = locale === 'en' ? `Please include the reference in the transfer: ${paymentReference}` :
        (locale === 'de' ? `Bitte geben Sie bei der Überweisung den Verwendungszweck an: ${paymentReference}` :
            `Kerjuk az atutalashoz a kozlemenybe ird be: ${paymentReference}`);

    doc.text(sanitizeText(footerText), leftX, finalY);

    return doc.output('arraybuffer');
}

export async function generateShopInvoicePDF(
    order: OrderDataForPDF,
    items: OrderItemDataForPDF[],
    settings: GlobalSettingsForPDF,
    locale: PDFLocale = 'hu'
): Promise<Uint8Array> {
    const doc = new jsPDF();
    const t = PDF_TRANSLATIONS[locale as Locale] || PDF_TRANSLATIONS.hu;
    let fontName = 'helvetica';

    // -- COLORS --
    const COLOR_RUN: [number, number, number] = [21, 21, 21];
    const COLOR_ION: [number, number, number] = [0, 242, 254];
    const COLOR_TEXT: [number, number, number] = [40, 40, 40];
    const COLOR_WHITE: [number, number, number] = [255, 255, 255];

    // -- LOGO (Forced Text) --
    doc.setFontSize(28);
    doc.setTextColor(COLOR_RUN[0], COLOR_RUN[1], COLOR_RUN[2]);
    doc.text("RUN", 14, 20);
    const runWidth = doc.getTextWidth("RUN");
    doc.setTextColor(COLOR_ION[0], COLOR_ION[1], COLOR_ION[2]);
    doc.text("ION", 14 + runWidth, 20);

    // -- TITLE (INVOICE) --
    doc.setFont(fontName, "normal");
    doc.setFontSize(22);
    doc.setTextColor(COLOR_RUN[0], COLOR_RUN[1], COLOR_RUN[2]);
    doc.text(t.invoiceTitle, 196, 20, { align: 'right' });

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);

    // -- LINE --
    doc.setDrawColor(COLOR_ION[0], COLOR_ION[1], COLOR_ION[2]);
    doc.setLineWidth(0.5);
    doc.line(14, 33, 196, 33);

    // -- DATES --
    const today = new Date();

    doc.setFontSize(10);
    doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);

    let yPos = 45;
    const rightX = 120;

    doc.setFont("helvetica", "bold");
    doc.text(t.orderDetails, rightX, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");

    const paymentReference = order.orderNumber;

    doc.text(t.orderNumber, rightX, yPos);
    doc.text(paymentReference, 190, yPos, { align: 'right' });
    yPos += 5;

    doc.text(t.date, rightX, yPos);
    doc.text(format(today, 'yyyy.MM.dd'), 190, yPos, { align: 'right' });
    yPos += 5;

    // -- SELLER & BUYER --
    const leftX = 14;
    yPos = 45;

    // Seller (From Settings)
    const sellerName = settings?.shopBeneficiaryName || 'Runion SE';
    const sellerBank = settings?.shopBankName || '-';
    const sellerAccount = settings?.shopBankAccountNumber || '-';

    doc.setFont(fontName, "normal");
    doc.text(t.issuer, leftX, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");

    doc.text(sanitizeText(sellerName), leftX, yPos);
    yPos += 5;
    if (settings?.shopAddress) {
        doc.text(sanitizeText(settings.shopAddress), leftX, yPos);
        yPos += 5;
    }
    if (settings?.shopTaxNumber) {
        doc.text(`${t.taxId} ${settings.shopTaxNumber}`, leftX, yPos);
        yPos += 5;
    }
    if (settings?.shopEmail) {
        doc.text(`Email: ${settings.shopEmail}`, leftX, yPos);
        yPos += 5;
    }

    yPos += 6;

    // Bank Block
    doc.setFillColor(245, 245, 245);
    doc.rect(leftX - 2, yPos - 1, 95, 14, 'F');
    doc.setFont("helvetica", "bold");
    doc.text(`${t.bank} ${sanitizeText(sellerBank)}`, leftX, yPos + 4);
    doc.text(t.account, leftX, yPos + 9);
    doc.setFont("helvetica", "normal");
    doc.text(sellerAccount, leftX + 25, yPos + 9);

    yPos += 24;

    // Buyer
    doc.setFont("helvetica", "bold");
    doc.text(t.buyer, leftX, yPos);
    yPos += 6;

    doc.setFont("helvetica", "normal");
    doc.text(sanitizeText(order.billingName), leftX, yPos);
    yPos += 5;
    if (order.billingZip && order.billingCity) {
        doc.text(`${sanitizeText(order.billingZip)} ${sanitizeText(order.billingCity)}`, leftX, yPos);
        yPos += 5;
    }
    if (order.billingAddress) {
        doc.text(sanitizeText(order.billingAddress), leftX, yPos);
        yPos += 5;
    }
    if (order.billingTaxNumber) {
        doc.text(`${t.taxId} ${order.billingTaxNumber}`, leftX, yPos);
        yPos += 5;
    }

    // -- ITEMS TABLE --
    const tableStartY = Math.max(yPos, 90) + 10;

    const tableRows = items.map(item => [
        sanitizeText(`${item.productName} ${item.size ? `(${item.size})` : ''}`),
        `${item.quantity} db`,
        `${Number(item.price).toLocaleString('hu-HU')} Ft`,
        `${(item.quantity * item.price).toLocaleString('hu-HU')} Ft`
    ]);

    const itemsTotal = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const shippingCost = Number(order.totalAmount) - itemsTotal;

    tableRows.push([
        t.shipping,
        '1',
        shippingCost > 0 ? `${shippingCost.toLocaleString('hu-HU')} Ft` : 'Ingyenes',
        shippingCost > 0 ? `${shippingCost.toLocaleString('hu-HU')} Ft` : '0 Ft'
    ]);

    autoTable(doc, {
        startY: tableStartY,
        head: [[t.item, t.qty, t.unitPrice, t.amount]],
        body: tableRows,
        theme: 'grid',
        headStyles: {
            fillColor: COLOR_RUN,
            textColor: COLOR_WHITE,
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { halign: 'left' },
            1: { halign: 'center' },
            2: { halign: 'right' },
            3: { halign: 'right', fontStyle: 'bold' }
        },
        styles: {
            font: fontName,
            fontSize: 9,
            cellPadding: 3
        },
        foot: [[
            { content: t.total, colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fontSize: 11 } },
            { content: `${Number(order.totalAmount).toLocaleString('hu-HU')} Ft`, styles: { halign: 'right', fontStyle: 'bold', fontSize: 11, textColor: COLOR_ION } }
        ]],
        footStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            lineWidth: 0.5,
            lineColor: [200, 200, 200]
        }
    });

    return doc.output('arraybuffer');
}

