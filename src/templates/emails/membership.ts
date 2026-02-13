
export const MEMBERSHIP_EMAIL_TRANSLATIONS = {
    hu: {
        orderSubject: 'Új tagsági rendelés érkezett',
        activationSubject: 'Tagság Aktiválva!',
        orderTitle: 'Új tagsági rendelés érkezett!',
        orderNumber: 'Rendelésszám:',
        amount: 'Összeg:',
        customerDetails: 'Vevő adatai:',
        name: 'Név:',
        email: 'Email:',
        phone: 'Telefon:',
        notProvided: 'Nincs megadva',
        activationBody: 'Köszönjük! A tagságod sikeresen aktiváltuk eddig:',
        activationTitle: 'Tagság Sikeresen Aktiválva',
        greeting: 'Kedves',
        systemNotification: 'Ez egy automatikus értesítés a Runion rendszertől.'
    },
    en: {
        orderSubject: 'New Membership Order Received',
        activationSubject: 'Membership Activated!',
        orderTitle: 'New Membership Order Received!',
        orderNumber: 'Order Number:',
        amount: 'Amount:',
        customerDetails: 'Customer Details:',
        name: 'Name:',
        email: 'Email:',
        phone: 'Phone:',
        notProvided: 'Not provided',
        activationBody: 'Thank you! Your membership has been successfully activated until:',
        activationTitle: 'Membership Successfully Activated',
        greeting: 'Dear',
        systemNotification: 'This is an automated notification from the Runion system.'
    },
    de: {
        orderSubject: 'Neue Mitgliedschaftsbestellung erhalten',
        activationSubject: 'Mitgliedschaft Aktiviert!',
        orderTitle: 'Neue Mitgliedschaftsbestellung erhalten!',
        orderNumber: 'Bestellnummer:',
        amount: 'Betrag:',
        customerDetails: 'Kundendaten:',
        name: 'Name:',
        email: 'Email:',
        phone: 'Telefon:',
        notProvided: 'Nicht angegeben',
        activationBody: 'Vielen Dank! Deine Mitgliedschaft wurde erfolgreich aktiviert bis:',
        activationTitle: 'Mitgliedschaft erfolgreich aktiviert',
        greeting: 'Hallo',
        systemNotification: 'Dies ist eine automatische Benachrichtigung vom Runion-System.'
    }
} as const;

export type MembershipLocale = keyof typeof MEMBERSHIP_EMAIL_TRANSLATIONS;

export function generateMembershipOrderEmailHtml(
    user: any,
    orderNumber: string,
    grandTotal: number,
    locale: string = 'hu'
) {
    const t = MEMBERSHIP_EMAIL_TRANSLATIONS[locale as MembershipLocale] || MEMBERSHIP_EMAIL_TRANSLATIONS.hu;

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h3 style="color: #333;">${t.orderTitle}</h3>
            <p><strong>${t.orderNumber}</strong> #${orderNumber}</p>
            <p><strong>${t.amount}</strong> ${grandTotal.toLocaleString()} Ft</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <h4 style="color: #666;">${t.customerDetails}</h4>
            <p><strong>${t.name}</strong> ${user.firstName} ${user.lastName}</p>
            <p><strong>${t.email}</strong> ${user.email}</p>
            <p><strong>${t.phone}</strong> ${user.phoneNumber || t.notProvided}</p>
            <div style="margin-top: 30px; font-size: 12px; color: #999;">
                ${t.systemNotification}
            </div>
        </div>
    `;
}

export function generateMembershipActivationEmailHtml(
    orderNumber: string,
    endDate: Date,
    userName: string,
    locale: string = 'hu'
) {
    const t = MEMBERSHIP_EMAIL_TRANSLATIONS[locale as MembershipLocale] || MEMBERSHIP_EMAIL_TRANSLATIONS.hu;

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9;">
            <h2 style="color: #00cc66;">${t.activationTitle}</h2>
            <p style="font-size: 16px;">${t.greeting} <strong>${userName}</strong>!</p>
            <p style="font-size: 16px;">${t.activationBody} <strong>${endDate.toLocaleDateString(locale === 'hu' ? 'hu-HU' : (locale === 'de' ? 'de-DE' : 'en-US'))}</strong></p>
            <div style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 12px; color: #999;">
                ${t.systemNotification}
            </div>
        </div>
    `;
}

export function getMembershipEmailSubject(type: 'ORDER' | 'ACTIVATION', orderNumber: string, locale: string = 'hu'): string {
    const t = MEMBERSHIP_EMAIL_TRANSLATIONS[locale as MembershipLocale] || MEMBERSHIP_EMAIL_TRANSLATIONS.hu;
    if (type === 'ORDER') {
        return `${t.orderSubject} - ${orderNumber}`; // Usually for admins, might want to keep it simple or localized
    } else {
        return `${t.activationSubject} - ${orderNumber}`;
    }
}
