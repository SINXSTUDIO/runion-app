'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

// --- ABOUT PAGE ---

export async function getAboutPage() {
    return await prisma.aboutPage.findFirst();
}

export async function updateAboutPage(data: any) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        return { message: 'Nincs jogosultságod.' };
    }

    try {
        const existing = await prisma.aboutPage.findFirst();
        if (existing) {
            await prisma.aboutPage.update({
                where: { id: existing.id },
                data: {
                    title: data.title,
                    description: data.description,
                    founderName: data.founderName,
                    founderRole: data.founderRole,
                    image1Url: data.image1Url,
                    image2Url: data.image2Url,
                }
            });
        } else {
            await prisma.aboutPage.create({
                data: {
                    title: data.title,
                    description: data.description,
                    founderName: data.founderName,
                    founderRole: data.founderRole,
                    image1Url: data.image1Url,
                    image2Url: data.image2Url,
                }
            });
        }
        revalidatePath('/[locale]/about', 'page');
        revalidatePath('/[locale]/secretroom75', 'layout');
        return { success: true, message: 'Rólunk oldal frissítve!' };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Hiba történt a mentéskor.' };
    }
}

// --- COMPANIES (CONTACT) ---

export async function getCompanies() {
    return await prisma.seller.findMany({
        orderBy: { order: 'asc' }
    });
}

export async function upsertCompany(data: any) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        return { message: 'Nincs jogosultságod.' };
    }

    try {
        if (data.id) {
            await prisma.seller.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    address: data.address,
                    phone: data.phone,
                    email: data.email,
                    taxNumber: data.taxNumber,
                    regNumber: data.regNumber,
                    representative: data.representative,
                    iban: data.iban,
                    active: data.active
                }
            });
        } else {
            const maxOrder = await prisma.seller.aggregate({ _max: { order: true } });
            const nextOrder = (maxOrder._max.order || 0) + 1;

            await prisma.seller.create({
                data: {
                    name: data.name,
                    address: data.address,
                    phone: data.phone,
                    email: data.email,
                    taxNumber: data.taxNumber,
                    regNumber: data.regNumber,
                    representative: data.representative,
                    iban: data.iban,
                    active: data.active ?? true,
                    order: nextOrder
                }
            });
        }
        revalidatePath('/[locale]/contact', 'page');
        revalidatePath('/[locale]/secretroom75/contact', 'page');
        return { success: true, message: 'Cégadatok mentve!' };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Hiba történt a mentéskor.' };
    }
}

export async function deleteCompany(id: string) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') return { message: 'Unauthorized' };

    try {
        await prisma.seller.delete({ where: { id } });
        revalidatePath('/[locale]/contact', 'page');
        revalidatePath('/[locale]/secretroom75/contact', 'page');
        return { success: true };
    } catch (e) {
        return { success: false, message: 'Hiba a törléskor' };
    }
}

export async function updateCompanyOrder(items: { id: string, order: number }[]) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') return { message: 'Unauthorized' };

    try {
        for (const item of items) {
            await prisma.seller.update({
                where: { id: item.id },
                data: { order: item.order }
            });
        }
        revalidatePath('/[locale]/contact', 'page');
        revalidatePath('/[locale]/secretroom75/contact', 'page');
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}

// --- FAQs (CONTACT) ---

export async function getFAQs() {
    return await prisma.fAQ.findMany({
        orderBy: { order: 'asc' }
    });
}

export async function upsertFAQ(data: any) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        return { message: 'Nincs jogosultságod.' };
    }

    try {
        if (data.id) {
            await prisma.fAQ.update({
                where: { id: data.id },
                data: {
                    question: data.question,
                    questionEn: data.questionEn,
                    questionDe: data.questionDe,
                    answer: data.answer,
                    answerEn: data.answerEn,
                    answerDe: data.answerDe,
                    active: data.active
                }
            });
        } else {
            const maxOrder = await prisma.fAQ.aggregate({ _max: { order: true } });
            const nextOrder = (maxOrder._max.order || 0) + 1;

            await prisma.fAQ.create({
                data: {
                    question: data.question,
                    questionEn: data.questionEn,
                    questionDe: data.questionDe,
                    answer: data.answer,
                    answerEn: data.answerEn,
                    answerDe: data.answerDe,
                    active: data.active ?? true,
                    order: nextOrder
                }
            });
        }
        revalidatePath('/[locale]/contact', 'page');
        revalidatePath('/[locale]/secretroom75/contact', 'page');
        return { success: true, message: 'GYIK mentve!' };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Hiba történt a mentéskor.' };
    }
}

export async function deleteFAQ(id: string) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') return { message: 'Unauthorized' };

    try {
        await prisma.fAQ.delete({ where: { id } });
        revalidatePath('/[locale]/contact', 'page');
        revalidatePath('/[locale]/secretroom75/contact', 'page');
        return { success: true };
    } catch (e) {
        return { success: false, message: 'Hiba a törléskor' };
    }
}


export async function updateFAQOrder(items: { id: string, order: number }[]) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') return { message: 'Unauthorized' };

    try {
        for (const item of items) {
            await prisma.fAQ.update({
                where: { id: item.id },
                data: { order: item.order }
            });
        }
        revalidatePath('/[locale]/contact', 'page');
        revalidatePath('/[locale]/secretroom75/contact', 'page');
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}

export async function importFAQs(jsonContent: string) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        return { success: false, message: 'Nincs jogosultságod.' };
    }

    try {
        const faqs = JSON.parse(jsonContent);
        if (!Array.isArray(faqs)) {
            return { success: false, message: 'Érvénytelen JSON formátum (nem tömb).' };
        }

        // Get current max order
        const maxOrderWrapper = await prisma.fAQ.aggregate({ _max: { order: true } });
        let nextOrder = (maxOrderWrapper._max.order || 0) + 1;

        let count = 0;
        for (const item of faqs) {
            if (!item.question || !item.answer) continue; // Skip invalid items

            await prisma.fAQ.create({
                data: {
                    question: item.question,
                    questionEn: item.questionEn,
                    questionDe: item.questionDe,
                    answer: item.answer,
                    answerEn: item.answerEn,
                    answerDe: item.answerDe,
                    active: true,
                    order: nextOrder++
                }
            });
            count++;
        }

        revalidatePath('/[locale]/contact', 'page');
        revalidatePath('/[locale]/secretroom75/contact', 'page');
        return { success: true, message: `${count} kérdés sikeresen importálva!` };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Hiba történt az importáláskor.' };
    }
}

