import { type RegistrationWithDetails, type DistanceDataForPDF } from '@/types/pdf';

export const REG_EMAIL_TRANSLATIONS = {
    hu: {
        subject: '✅ Sikeres Nevezés:',
        preview: 'Sikeres nevezés!',
        title: '✅ Sikeres Nevezés!',
        greeting: 'Kedves',
        thankYou: 'Köszönjük a nevezésedet a(z)',
        race: 'versenyre.',
        eventLabel: 'Esemény:',
        distanceLabel: 'Választott táv:',
        priceLabel: 'Táv ára:',
        discountLabel: 'Kedvezmény:',
        extrasTitle: 'Kiegészítők',
        paymentInfoTitle: '💳 Fizetési Információk',
        paymentInstruct: 'Kérjük utald át a nevezési díjat a véglegesítéshez.',
        proformaNote: 'Mellékelten küldjük a proforma számlát (díjbekérőt) a fizetéshez szükséges adatokkal.',
        totalDue: '💰 Fizetendő:',
        beneficiary: 'Kedvezményezett:',
        bankAccount: 'Bankszámlaszám (HUF):',
        notice: 'Közlemény:',
        footerNote: 'Ez egy automatikus értesítés a Runion rendszertől.',
        teamLabel: 'Runion Csapata',
        free: 'Ingyenes'
    },
    en: {
        subject: '✅ Registration Successful:',
        preview: 'Registration successful!',
        title: '✅ Registration Successful!',
        greeting: 'Dear',
        thankYou: 'Thank you for registering for the',
        race: 'race.',
        eventLabel: 'Event:',
        distanceLabel: 'Selected Distance:',
        priceLabel: 'Distance Price:',
        discountLabel: 'Discount:',
        extrasTitle: 'Extras',
        paymentInfoTitle: '💳 Payment Information',
        paymentInstruct: 'Please transfer the registration fee to finalize your registration.',
        proformaNote: 'We have attached the proforma invoice with the necessary payment details.',
        totalDue: '💰 Total Due:',
        beneficiary: 'Beneficiary:',
        bankAccount: 'Bank Account (HUF):',
        notice: 'Reference:',
        footerNote: 'This is an automated notification from the Runion system.',
        teamLabel: 'Runion Team',
        free: 'Free'
    },
    de: {
        subject: '✅ Anmeldung Erfolgreich:',
        preview: 'Anmeldung erfolgreich!',
        title: '✅ Anmeldung Erfolgreich!',
        greeting: 'Hallo',
        thankYou: 'Vielen Dank für deine Anmeldung zum',
        race: 'Wettbewerb.',
        eventLabel: 'Veranstaltung:',
        distanceLabel: 'Gewählte Distanz:',
        priceLabel: 'Distanzpreis:',
        discountLabel: 'Rabatt:',
        extrasTitle: 'Extras',
        paymentInfoTitle: '💳 Zahlungsinformationen',
        paymentInstruct: 'Bitte überweise die Anmeldegebühr, um deine Registrierung abzuschließen.',
        proformaNote: 'Im Anhang findest du die Proforma-Rechnung mit den nötigen Zahlungsdaten.',
        totalDue: '💰 Zu zahlen:',
        beneficiary: 'Begünstigter:',
        bankAccount: 'Bankkonto (HUF):',
        notice: 'Verwendungszweck:',
        footerNote: 'Dies ist eine automatische Benachrichtigung vom Runion-System.',
        teamLabel: 'Runion Team',
        free: 'Kostenlos'
    }
} as const;

export type Locale = keyof typeof REG_EMAIL_TRANSLATIONS;

/**
 * Generate HTML for user registration confirmation email
 * @param registration - Full registration data with relations
 * @param distance - Distance data for pricing calculations
 */
export function generateRegistrationEmailHtml(
    t: typeof REG_EMAIL_TRANSLATIONS[Locale],
    locale: string,
    userPreviewText: string,
    registration: RegistrationWithDetails,
    distance: DistanceDataForPDF,
    finalPrice: number,
    priceDisplay: string,
    discountPercentage: number,
    paymentReference: string,
    extrasTableRows: string
) {
    return `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" lang="${locale}">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <meta name="color-scheme" content="light dark">
            <meta name="supported-color-schemes" content="light dark">
            <title>${t.title} - ${registration.distance.event.title}</title>
            <!--[if mso]>
            <style type="text/css">
                table {border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;}
            </style>
            <![endif]-->
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif; width: 100% !important;">
            
            <!-- Preheader -->
            <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; mso-hide: all;">${userPreviewText}</div>
            
            <!-- Main Container -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5; margin: 0; padding: 0;">
                <tr>
                    <td align="center" style="padding: 20px 10px;">
                        
                        <!-- Email Card (650px) -->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; background-color: #ffffff; border-radius: 12px;">
                            
                            <!-- Header -->
                            <tr>
                                <td align="center" style="background-color: #00cc66; padding: 30px 20px; border-radius: 12px 12px 0 0;">
                                    <h1 style="margin: 0; padding: 0; font-size: 28px; color: #ffffff; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">${t.title}</h1>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style="padding: 30px 20px;">
                                    
                                    <!-- Greeting -->
                                    <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; font-family: Arial, Helvetica, sans-serif;">${t.greeting} <strong>${registration.user.firstName} ${registration.user.lastName}</strong>!</p>
                                    <p style="margin: 0 0 30px 0; font-size: 16px; color: #333333; font-family: Arial, Helvetica, sans-serif;">${t.thankYou} <strong>${registration.distance.event.title}</strong> ${t.race}</p>
                                    
                                    <!-- Event Details Box -->
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f9fa; margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                                        <tr>
                                            <td style="padding: 20px;">
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                    <tr>
                                                        <td style="padding: 10px 0; font-weight: bold; font-size: 14px; color: #666666; font-family: Arial, Helvetica, sans-serif; width: 40%;">${t.eventLabel}</td>
                                                        <td style="padding: 10px 0; font-size: 14px; color: #333333; font-family: Arial, Helvetica, sans-serif;">${registration.distance.event.title}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px 0; font-weight: bold; font-size: 14px; color: #666666; font-family: Arial, Helvetica, sans-serif;">${t.distanceLabel}</td>
                                                        <td style="padding: 10px 0; font-size: 14px; color: #333333; font-family: Arial, Helvetica, sans-serif; font-weight: bold;">${registration.distance.name}</td>
                                                    </tr>
                                                    ${distance.price ? `
                                                    <tr>
                                                        <td style="padding: 10px 0; font-weight: bold; font-size: 14px; color: #666666; font-family: Arial, Helvetica, sans-serif;">${t.priceLabel}</td>
                                                        <td style="padding: 10px 0; font-size: 14px; color: #333333; font-family: Arial, Helvetica, sans-serif;">
                                                            ${(discountPercentage > 0 || Number(distance.price) > finalPrice) ? `<span style="text-decoration: line-through; color: #999; margin-right: 8px;">${Number(distance.price) > 0 ? distance.price.toLocaleString() + ' Ft' : ''}</span>` : ''}
                                                            <span>${priceDisplay}</span>
                                                        </td>
                                                    </tr>
                                                    ${(discountPercentage > 0 || Number(distance.price) > finalPrice) ? `
                                                    <tr>
                                                        <td style="padding: 5px 0 10px 0; font-weight: bold; font-size: 13px; color: #00cc66; font-family: Arial, Helvetica, sans-serif;">${t.discountLabel}</td>
                                                        <td style="padding: 5px 0 10px 0; font-size: 13px; color: #00cc66; font-family: Arial, Helvetica, sans-serif; font-weight: bold;">
                                                            ${discountPercentage > 0 ? `- ${discountPercentage}%` : `Kedvezmény érvényesítve`}
                                                        </td>
                                                    </tr>
                                                    ` : ''}
                                                    ` : ''}
                                                </table>
                                            </td>
                                        </tr>
                                    </table>

                                    ${extrasTableRows ? `
                                    <!-- Extras Table -->
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                                        <tr>
                                            <td colspan="2" style="padding: 15px; background-color: #f0f0f0; border-bottom: 2px solid #00cc66;">
                                                <h3 style="margin: 0; padding: 0; font-size: 18px; color: #333333; font-family: Arial, Helvetica, sans-serif; font-weight: bold;">${t.extrasTitle}</h3>
                                            </td>
                                        </tr>
                                        ${extrasTableRows}
                                    </table>
                                    ` : ''}

                                    <!-- Payment Info Section -->
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fff9e6; margin: 30px 0; border: 2px solid #ffd700; border-radius: 8px;">
                                        <tr>
                                            <td style="padding: 20px;">
                                                <h3 style="margin: 0 0 15px 0; font-size: 20px; color: #b7791f; font-family: Arial, Helvetica, sans-serif; font-weight: bold;">${t.paymentInfoTitle}</h3>
                                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #333333; font-family: Arial, Helvetica, sans-serif;">${t.paymentInstruct}</p>
                                                <p style="margin: 0 0 20px 0; font-size: 14px; color: #333333; font-family: Arial, Helvetica, sans-serif;">${t.proformaNote}</p>
                                                
                                                <!-- Total Price -->
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                                                    <tr>
                                                        <td align="center" style="background-color: #00cc66; padding: 15px; border-radius: 8px;">
                                                            <p style="margin: 0; font-size: 24px; color: #ffffff; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">${t.totalDue} ${priceDisplay}</p>
                                                        </td>
                                                    </tr>
                                                </table>

                                                <!-- Bank Details -->
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 6px;">
                                                    <tr>
                                                        <td style="padding: 15px;">
                                                            <p style="margin: 0 0 10px 0; font-size: 14px; font-family: Arial, Helvetica, sans-serif;"><strong style="color: #666666;">${t.beneficiary}</strong><br/><span style="color: #333333; font-size: 16px; font-weight: bold;">${registration.distance.event.seller?.name || 'Runion SE'}</span></p>
                                                            ${priceDisplay.includes('€') && !priceDisplay.includes('Ft') && (registration.distance.event.seller as any)?.ibanEuro ? `
                                                                <p style="margin: 0 0 10px 0; font-size: 14px; font-family: Arial, Helvetica, sans-serif;"><strong style="color: #666666;">IBAN (EUR):</strong><br/><span style="font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold; color: #333333;">${(registration.distance.event.seller as any)?.ibanEuro}</span><br/><span style="color: #666666; font-size: 13px;">${(registration.distance.event.seller as any)?.bankNameEur || (registration.distance.event.seller as any)?.bankName}</span></p>
                                                                ${(registration.distance.event.seller as any)?.swift ? `<p style="margin: 0 0 10px 0; font-size: 14px; font-family: Arial, Helvetica, sans-serif;"><strong style="color: #666666;">SWIFT/BIC:</strong><br/><span style="font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold; color: #333333;">${(registration.distance.event.seller as any)?.swift}</span></p>` : ''}
                                                            ` : `
                                                                <p style="margin: 0 0 10px 0; font-size: 14px; font-family: Arial, Helvetica, sans-serif;"><strong style="color: #666666;">${t.bankAccount}</strong><br/><span style="color: #333333; font-size: 16px; font-weight: bold;">${registration.distance.event.seller?.bankAccountNumber || '-'}</span><br/><span style="color: #666666; font-size: 13px;">${registration.distance.event.seller?.bankName || '-'}</span></p>
                                                            `}
                                                            <p style="margin: 0; font-size: 14px; font-family: Arial, Helvetica, sans-serif;"><strong style="color: #666666;">${t.notice}</strong><br/><span style="background-color: #ffe6cc; padding: 5px 10px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold; color: #333333;">${paymentReference}</span></p>
                                                        </td>
                                                    </tr>
                                                </table>

                                                ${(registration.distance.event.seller as any)?.ibanEuro && (!priceDisplay.includes('€') || priceDisplay.includes('Ft')) ? `
                                                <!-- Optional International Payment -->
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 15px; background-color: #e3f2fd; border: 1px solid #90caf9; border-radius: 6px;">
                                                    <tr>
                                                        <td style="padding: 15px;">
                                                            <h4 style="margin: 0 0 10px 0; font-size: 16px; color: #0056b3; font-family: Arial, Helvetica, sans-serif; font-weight: bold;">🌍 Külföldi fizetés / International Payment (EUR)</h4>
                                                            <p style="margin: 0 0 8px 0; font-size: 13px; color: #333333; font-family: Arial, Helvetica, sans-serif;"><strong>Account Owner:</strong> ${registration.distance.event.seller?.nameEuro || registration.distance.event.seller?.name}</p>
                                                            <p style="margin: 0 0 8px 0; font-size: 13px; color: #333333; font-family: Arial, Helvetica, sans-serif;"><strong>Bank:</strong> ${registration.distance.event.seller?.bankName}</p>
                                                            ${registration.distance.event.seller?.bankAccountNumberEuro ? `<p style="margin: 0 0 8px 0; font-size: 13px; color: #333333; font-family: Arial, Helvetica, sans-serif;"><strong>Account Number:</strong> ${registration.distance.event.seller?.bankAccountNumberEuro}</p>` : ''}
                                                            <p style="margin: 0; font-size: 13px; color: #333333; font-family: Arial, Helvetica, sans-serif;"><strong>IBAN:</strong> <span style="font-family: 'Courier New', monospace;">${registration.distance.event.seller?.ibanEuro}</span></p>
                                                        </td>
                                                    </tr>
                                                </table>
                                                ` : ''}

                                            </td>
                                        </tr>
                                    </table>

                                    ${registration.distance.event.confirmationEmailText ? `
                                    <!-- Additional Info Section -->
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fffbf0; margin: 20px 0; border: 2px solid #ffc107; border-radius: 8px;">
                                        <tr>
                                            <td style="padding: 20px;">
                                                <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #b7791f; font-family: Arial, Helvetica, sans-serif; font-weight: bold; text-transform: uppercase;">📋 További Információk / Additional Info</h3>
                                                <div style="font-size: 14px; color: #333333; font-family: Arial, Helvetica, sans-serif; line-height: 1.8;">${registration.distance.event.confirmationEmailText}</div>
                                            </td>
                                        </tr>
                                    </table>
                                    ` : ''}

                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td align="center" style="padding: 20px; background-color: #f9f9f9; border-top: 1px solid #eeeeee; border-radius: 0 0 12px 12px;">
                                    <p style="margin: 0; padding: 0; color: #999999; font-size: 12px; font-family: Arial, Helvetica, sans-serif;">&copy; ${new Date().getFullYear()} Runion</p>
                                </td>
                            </tr>
                            
                        </table>
                        
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
}

export function generateNotificationEmailHtml(
    previewText: string,
    registration: any,
    mainDataRows: string,
    billingRows: string,
    extrasListHTML: string,
    priceDisplay: string
) {
    return `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" lang="hu">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <meta name="color-scheme" content="light dark">
            <meta name="supported-color-schemes" content="light dark">
            <title>Új Nevezés - ${registration.distance.event.title}</title>
            <!--[if mso]>
            <style type="text/css">
                table {border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;}
            </style>
            <![endif]-->
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; width: 100% !important;">
            
            <!-- Preheader for mobile preview (hidden in email) -->
            <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; mso-hide: all;">${previewText}</div>
            
            <!-- Main Container Table -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5; margin: 0; padding: 0;">
                <tr>
                    <td align="center" style="padding: 20px 10px;">
                        
                        <!-- Email Card Table (650px max-width) -->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; background-color: #ffffff; border-radius: 12px;">
                            
                            <!-- Header Row -->
                            <tr>
                                <td align="center" style="background-color: #00aaff; padding: 30px 20px; border-radius: 12px 12px 0 0;">
                                    <h1 style="margin: 0; padding: 0; font-size: 28px; color: #ffffff; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">⚡ Új Nevezés Érkezett!</h1>
                                </td>
                            </tr>
                            
                            <!-- Content Padding Row -->
                            <tr>
                                <td style="padding: 20px;">
                                    
                                    <!-- Event Info Table -->
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                                        <tr>
                                            <td style="padding: 15px; background-color: #f0f0f0; font-weight: bold; border-bottom: 1px solid #dddddd; width: 30%; font-family: Arial, Helvetica, sans-serif; font-size: 14px;">Esemény:</td>
                                            <td style="padding: 15px; background-color: #f0f0f0; border-bottom: 1px solid #dddddd; font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${registration.distance.event.title}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 15px; font-weight: bold; width: 30%; font-family: Arial, Helvetica, sans-serif; font-size: 14px;">Táv:</td>
                                            <td style="padding: 15px; font-family: Arial, Helvetica, sans-serif; font-size: 14px;">${registration.distance.name}</td>
                                        </tr>
                                    </table>

                                    <!-- Participant Data Table -->
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                                        <tr>
                                            <td colspan="2" style="padding: 15px; background-color: #f0f0f0; border-bottom: 2px solid #00aaff;">
                                                <h3 style="margin: 0; padding: 0; font-size: 18px; color: #333333; font-family: Arial, Helvetica, sans-serif; font-weight: bold;">Nevező Adatai</h3>
                                            </td>
                                        </tr>
                                        ${mainDataRows}
                                    </table>
                                    
                                    <!-- Billing Data Table -->
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                                        <tr>
                                            <td colspan="2" style="padding: 15px; background-color: #f0f0f0; border-bottom: 2px solid #00aaff;">
                                                <h3 style="margin: 0; padding: 0; font-size: 18px; color: #333333; font-family: Arial, Helvetica, sans-serif; font-weight: bold;">Számlázási Adatok</h3>
                                            </td>
                                        </tr>
                                        ${billingRows}
                                    </table>

                                    ${extrasListHTML ? `
                                    <!-- Extras Table -->
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                                        <tr>
                                            <td colspan="2" style="padding: 15px; background-color: #f0f0f0; border-bottom: 2px solid #00aaff;">
                                                <h3 style="margin: 0; padding: 0; font-size: 18px; color: #333333; font-family: Arial, Helvetica, sans-serif; font-weight: bold;">Kiegészítők</h3>
                                            </td>
                                        </tr>
                                        ${extrasListHTML}
                                    </table>
                                    ` : ''}

                                    <!-- Total Price Table -->
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0;">
                                        <tr>
                                            <td align="center" style="background-color: #00aaff; padding: 20px; border-radius: 8px;">
                                                <p style="margin: 0; padding: 0; font-size: 24px; color: #ffffff; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">💰 Végösszeg: ${priceDisplay}</p>
                                            </td>
                                        </tr>
                                    </table>

                                </td>
                            </tr>
                            
                            <!-- Footer Row -->
                            <tr>
                                <td align="center" style="padding: 20px; background-color: #f9f9f9; border-top: 1px solid #eeeeee; border-radius: 0 0 12px 12px;">
                                    <p style="margin: 5px 0; padding: 0; color: #666666; font-size: 14px; font-family: Arial, Helvetica, sans-serif;"><em>Ez egy automatikus értesítés a Runion rendszertől.</em></p>
                                    <p style="margin: 5px 0; padding: 0; font-weight: bold; font-size: 16px; color: #00aaff; font-family: Arial, Helvetica, sans-serif;">RUNION Csapata</p>
                                </td>
                            </tr>
                            
                        </table>
                        <!-- End Email Card -->
                    </td>
                </tr>
            </table>
            <!-- End Main Container -->
        </body>
        </html>
    `;
}
