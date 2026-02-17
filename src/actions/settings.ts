'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth-checks';

/**
 * Retrieves global system settings.
 * Creates default settings if they don't exist.
 */
export async function getSettings() {
    try {
        let settings = await prisma.globalSettings.findFirst();

        if (!settings) {
            settings = await prisma.globalSettings.create({
                data: {
                    maintenanceMode: false,
                    shopEnabled: true,
                },
            });
        }

        return settings;
    } catch (error) {
        console.error('CRITICAL: Failed to fetch or create global settings:', error);
        // Fallback to default settings to prevent site crash during schema mismatch
        return {
            id: 'default-fallback',
            maintenanceMode: false,
            shopEnabled: true,
            cancellationEnabled: false,
            // Add other critical fields as null/undefined to satisfy type signature if needed
            // casting as any to bypass strict type checks for missing fields
        } as any;
    }
}

/**
 * Toggles the system-wide maintenance mode.
 */
export async function toggleMaintenance(newState: boolean) {
    try {
        await requireAdmin();
        const settings = await getSettings();

        if (!settings) {
            throw new Error("Settings could not be initialized.");
        }

        await prisma.globalSettings.update({
            where: { id: settings.id },
            data: { maintenanceMode: newState },
        });

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Failed to toggle maintenance mode:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Toggles the shop enabled status.
 */
export async function toggleShop(newState: boolean) {
    try {
        await requireAdmin();
        const settings = await getSettings();

        if (!settings) {
            throw new Error("Settings could not be initialized.");
        }

        await prisma.globalSettings.update({
            where: { id: settings.id },
            data: { shopEnabled: newState },
        });

        revalidatePath('/boutique');
        return { success: true };
    } catch (error) {
        console.error('Failed to toggle shop status:', error);
        return { success: false, error: String(error) };
    }
}


/**
 * Toggles the cancellation request enabled status.
 */
export async function toggleCancellation(newState: boolean) {
    try {
        await requireAdmin();
        const settings = await getSettings();

        if (!settings) {
            throw new Error("Settings could not be initialized.");
        }

        await prisma.globalSettings.update({
            where: { id: settings.id },
            data: { cancellationEnabled: newState },
        });

        revalidatePath('/[locale]/transfer', 'page');
        return { success: true };
    } catch (error) {
        console.error('Failed to toggle cancellation status:', error);
        return { success: false, error: String(error) };
    }
}

export async function updateShopSettings(data: {
    shopEmail?: string;
    shopBeneficiaryName?: string;
    shopBankName?: string;
    shopBankAccountNumber?: string;
    shopShippingCost?: number;
    shopFreeShippingThreshold?: number;
    shopNote?: string;
    shopTaxNumber?: string;
    shopAddress?: string;
    shopLogoUrl?: string;
    feature1Title?: string;
    feature1TitleEn?: string;
    feature1TitleDe?: string;
    feature1Desc?: string;
    feature1DescEn?: string;
    feature1DescDe?: string;
    feature1Icon?: string;
    feature2Title?: string;
    feature2TitleEn?: string;
    feature2TitleDe?: string;
    feature2Desc?: string;
    feature2DescEn?: string;
    feature2DescDe?: string;
    feature2Icon?: string;
    feature3Title?: string;
    feature3TitleEn?: string;
    feature3TitleDe?: string;
    feature3Desc?: string;
    feature3DescEn?: string;
    feature3DescDe?: string;
    feature3Icon?: string;
}) {
    try {
        await requireAdmin();
        const settings = await getSettings();

        if (!settings) throw new Error("Settings not found");

        await prisma.globalSettings.update({
            where: { id: settings.id },
            data: {
                shopEmail: data.shopEmail,
                shopBeneficiaryName: data.shopBeneficiaryName,
                shopBankName: data.shopBankName,
                shopBankAccountNumber: data.shopBankAccountNumber,
                shopShippingCost: data.shopShippingCost,
                shopFreeShippingThreshold: data.shopFreeShippingThreshold,
                shopNote: data.shopNote,
                shopTaxNumber: data.shopTaxNumber,
                shopAddress: data.shopAddress,
                shopLogoUrl: data.shopLogoUrl,
                feature1Title: data.feature1Title,
                feature1TitleEn: data.feature1TitleEn,
                feature1TitleDe: data.feature1TitleDe,
                feature1Desc: data.feature1Desc,
                feature1DescEn: data.feature1DescEn,
                feature1DescDe: data.feature1DescDe,
                feature1Icon: data.feature1Icon,
                feature2Title: data.feature2Title,
                feature2TitleEn: data.feature2TitleEn,
                feature2TitleDe: data.feature2TitleDe,
                feature2Desc: data.feature2Desc,
                feature2DescEn: data.feature2DescEn,
                feature2DescDe: data.feature2DescDe,
                feature2Icon: data.feature2Icon,
                feature3Title: data.feature3Title,
                feature3TitleEn: data.feature3TitleEn,
                feature3TitleDe: data.feature3TitleDe,
                feature3Desc: data.feature3Desc,
                feature3DescEn: data.feature3DescEn,
                feature3DescDe: data.feature3DescDe,
                feature3Icon: data.feature3Icon,
            }
        });

        revalidatePath('/secretroom75/shop-settings');
        return { success: true };
    } catch (error) {
        console.error('Failed to update shop settings:', error);
        return { success: false, error: String(error) };
    }
}

export async function updateMembershipSeller(sellerId: string, notificationEmail?: string) {
    try {
        await requireAdmin();
        const settings = await getSettings();
        if (!settings) throw new Error("Settings not found");

        await prisma.globalSettings.update({
            where: { id: settings.id },
            data: {
                membershipSellerId: sellerId || null,
                membershipNotificationEmail: notificationEmail || null
            }
        });
        revalidatePath('/[locale]/secretroom75/memberships');
        return { success: true };
    } catch (error) {
        console.error('Failed to update membership seller:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update settings' };
    }
}

export async function updateTransferSettings(data: {
    transferInfoHu?: string;
    transferInfoEn?: string;
    transferInfoDe?: string;
    transferBeneficiary?: string;
    transferBankName?: string;
    transferBankAccountNumber?: string;
    transferNote?: string;
    transferEmail?: string;
    transferSellerId?: string;
    featuredEventId?: string;
    featuredEventActive?: boolean;
    featuredEventTitleHU?: string;
    featuredEventTitleEN?: string;
    featuredEventTitleDE?: string;
    featuredEventDescriptionHU?: string;
    featuredEventDescriptionEN?: string;
    featuredEventDescriptionDE?: string;
    featuredEventButtonHU?: string;
    featuredEventButtonEN?: string;
    featuredEventButtonDE?: string;
}) {
    try {
        await requireAdmin();
        const settings = await getSettings();
        if (!settings) throw new Error("Settings not found");

        const updateData: any = {
            transferInfoHu: data.transferInfoHu,
            transferInfoEn: data.transferInfoEn,
            transferInfoDe: data.transferInfoDe,
            transferBeneficiary: data.transferBeneficiary,
            transferBankName: data.transferBankName,
            transferBankAccountNumber: data.transferBankAccountNumber,
            transferNote: data.transferNote,
            transferEmail: data.transferEmail,
            transferSellerId: data.transferSellerId,
            featuredEventActive: data.featuredEventActive,
            featuredEventTitleHU: data.featuredEventTitleHU,
            featuredEventTitleEN: data.featuredEventTitleEN,
            featuredEventTitleDE: data.featuredEventTitleDE,
            featuredEventDescriptionHU: data.featuredEventDescriptionHU,
            featuredEventDescriptionEN: data.featuredEventDescriptionEN,
            featuredEventDescriptionDE: data.featuredEventDescriptionDE,
            featuredEventButtonHU: data.featuredEventButtonHU,
            featuredEventButtonEN: data.featuredEventButtonEN,
            featuredEventButtonDE: data.featuredEventButtonDE,
        };

        // Fix: If featuredEventId is an empty string, set it to null to avoid Prisma validation error for UUID
        if (data.featuredEventId && data.featuredEventId.trim() !== "") {
            updateData.featuredEventId = data.featuredEventId;
        } else {
            updateData.featuredEventId = null;
        }

        await prisma.globalSettings.update({
            where: { id: settings.id },
            data: updateData
        });

        revalidatePath('/[locale]/transfer');
        revalidatePath('/[locale]/secretroom75/settings');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Failed to update transfer settings:', error);
        return { success: false, error: String(error) };
    }
}
