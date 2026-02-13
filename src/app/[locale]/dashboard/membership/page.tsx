
import { getMembershipTiers, purchaseMembership } from '@/actions/memberships';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { getLocale, getTranslations } from 'next-intl/server';
import MembershipClient from './MembershipClient';

export default async function MembershipPage() {
    const session = await auth();
    const locale = await getLocale();
    const t = await getTranslations('Dashboard.Membership');

    if (!session?.user?.email) return null;

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { membershipTier: true }
    });

    const tiers = await getMembershipTiers();

    // Simplify tiers for client
    const serializedTiers = (tiers as any[]).map((tier: any) => {
        let name = tier.name;
        let description = tier.description;

        if (locale === 'en' && tier.nameEn) name = tier.nameEn;
        if (locale === 'de' && tier.nameDe) name = tier.nameDe;

        if (locale === 'en' && tier.descriptionEn) description = tier.descriptionEn;
        if (locale === 'de' && tier.descriptionDe) description = tier.descriptionDe;

        return {
            id: tier.id,
            name,
            price: Number(tier.price),
            description,
            discountPercentage: Number(tier.discountPercentage),
            durationMonths: tier.durationMonths
        };
    });

    const serializedUser = {
        membershipTierId: user?.membershipTierId,
        membershipTierName: locale === 'en' && user?.membershipTier?.nameEn ? user.membershipTier.nameEn : (locale === 'de' && user?.membershipTier?.nameDe ? user.membershipTier.nameDe : user?.membershipTier?.name),
        membershipExpiresAt: user?.membershipExpiresAt ? user.membershipExpiresAt.toISOString() : null,
        // Pre-fill billing
        billingName: user?.billingName || user?.firstName + ' ' + user?.lastName,
        billingZip: user?.billingZipCode || user?.zipCode || '',
        billingCity: user?.billingCity || user?.city || '',
        billingAddress: user?.billingAddress || user?.address || '',
        billingTaxNumber: user?.taxNumber || ''
    };

    const sellers = await prisma.seller.findMany({
        where: { active: true }
    });

    return (
        <MembershipClient
            user={serializedUser}
            tiers={serializedTiers}
            sellers={sellers}
            translations={{
                title: t('title', { default: 'Tagság Kezelés' }),
                currentStatus: t('currentStatus', { default: 'Jelenlegi Státusz' }),
                noMembership: t('noMembership', { default: 'Nincs aktív tagságod' }),
                activeUntil: t('activeUntil', { default: 'Érvényes eddig:' }),
                availablePlans: t('availablePlans', { default: 'Elérhető Csomagok' }),
                buy: t('buy', { default: 'Megvásárolom' }),
                renew: t('renew', { default: 'Megújítom' }),
                month: t('month', { default: 'hónap' }),
                billingDetails: t('billingDetails', { default: 'Számlázási Adatok' }),
                confirmPurchase: t('confirmPurchase', { default: 'Vásárlás Megerősítése' }),
                successTitle: t('successTitle', { default: 'Sikeres Rendelés!' }),
                successMessage: t('successMessage', { default: 'A díjbekérőt elküldtük e-mailben. Kérlek utald át az összeget a tagság aktiválásához.' }),
                back: t('back', { default: 'Vissza' }),
                processing: t('processing', { default: 'Feldolgozás...' }),
                cancel: t('cancel', { default: 'Tagság Megszüntetése' }),
                confirmCancel: t('confirmCancel', { default: 'Biztosan meg akarod szüntetni a tagságot?' }),
                selectSeller: t('selectSeller', { default: 'Számlakibocsátó (Kedvezményezett)' })
            }}
        />
    );
}
