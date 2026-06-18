import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
// import { EventStatus } from '@prisma/client';
import { handleError } from '@/lib/error-handler';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://runion.hu';

/**
 * Dynamic Sitemap Generation
 * Automatically includes all published events and static pages
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const locales = ['hu', 'en', 'de'];
    
    // Define all static subpages with their metadata
    const subPages = [
        { path: 'races', changeFrequency: 'daily' as const, priority: 0.8 },
        { path: 'boutique', changeFrequency: 'weekly' as const, priority: 0.7 },
        { path: 'about', changeFrequency: 'monthly' as const, priority: 0.6 },
        { path: 'contact', changeFrequency: 'monthly' as const, priority: 0.6 },
        { path: 'privacy', changeFrequency: 'monthly' as const, priority: 0.3 },
        { path: 'terms', changeFrequency: 'monthly' as const, priority: 0.3 },
        { path: 'transfer', changeFrequency: 'monthly' as const, priority: 0.4 },
    ];

    // Static pages (high priority)
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        // Locale homepages
        ...locales.map(locale => ({
            url: `${BASE_URL}/${locale}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: locale === 'hu' ? 1.0 : 0.9,
        })),
        // All subpages for all locales
        ...subPages.flatMap(page => 
            locales.map(locale => ({
                url: `${BASE_URL}/${locale}/${page.path}`,
                lastModified: new Date(),
                changeFrequency: page.changeFrequency,
                priority: locale === 'hu' ? page.priority : page.priority - 0.1,
            }))
        )
    ];

    try {
        // Fetch all published events
        const events = await prisma.event.findMany({
            where: {
                status: 'PUBLISHED',
            },
            select: {
                slug: true,
                updatedAt: true,
                eventDate: true,
            },
            orderBy: {
                eventDate: 'desc',
            },
        });

        // Generate event pages for all locales
        const eventPages: MetadataRoute.Sitemap = events.flatMap(event => {
            // Higher priority for upcoming events
            const isUpcoming = new Date(event.eventDate) > new Date();
            const priority = isUpcoming ? 0.9 : 0.6;

            return [
                {
                    url: `${BASE_URL}/hu/races/${event.slug}`,
                    lastModified: event.updatedAt,
                    changeFrequency: 'weekly' as const,
                    priority,
                },
                {
                    url: `${BASE_URL}/en/races/${event.slug}`,
                    lastModified: event.updatedAt,
                    changeFrequency: 'weekly' as const,
                    priority: priority - 0.1,
                },
                {
                    url: `${BASE_URL}/de/races/${event.slug}`,
                    lastModified: event.updatedAt,
                    changeFrequency: 'weekly' as const,
                    priority: priority - 0.1,
                },
            ];
        });

        // Fetch boutique products (if any)
        const products = await prisma.product.findMany({
            where: {
                active: true, // Use 'active' instead of 'published'
            },
            select: {
                id: true,
                slug: true,
                updatedAt: true,
            },
        }).catch(() => []); // Graceful fallback if Product model doesn't exist yet

        const productPages: MetadataRoute.Sitemap = products.flatMap(product => {
            const productKey = product.slug || product.id;
            return [
                {
                    url: `${BASE_URL}/hu/boutique/${productKey}`,
                    lastModified: product.updatedAt,
                    changeFrequency: 'weekly' as const,
                    priority: 0.6,
                },
                {
                    url: `${BASE_URL}/en/boutique/${productKey}`,
                    lastModified: product.updatedAt,
                    changeFrequency: 'weekly' as const,
                    priority: 0.5,
                },
                {
                    url: `${BASE_URL}/de/boutique/${productKey}`,
                    lastModified: product.updatedAt,
                    changeFrequency: 'weekly' as const,
                    priority: 0.5,
                },
            ];
        });

        return [...staticPages, ...eventPages, ...productPages];
    } catch (error) {
        console.error('Sitemap generation failed:', error);
        // Return static pages as fallback to prevent build failure
        return staticPages;
    }
}
