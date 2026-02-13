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
    // Static pages (high priority)
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/hu`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/en`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/de`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/hu/races`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/en/races`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/de/races`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/hu/boutique`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/en/boutique`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/de/boutique`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        },
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
                slug: true,
                updatedAt: true,
            },
        }).catch(() => []); // Graceful fallback if Product model doesn't exist yet

        const productPages: MetadataRoute.Sitemap = products.flatMap(product => [
            {
                url: `${BASE_URL}/hu/boutique/${product.slug}`,
                lastModified: product.updatedAt,
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            },
            {
                url: `${BASE_URL}/en/boutique/${product.slug}`,
                lastModified: product.updatedAt,
                changeFrequency: 'weekly' as const,
                priority: 0.5,
            },
            {
                url: `${BASE_URL}/de/boutique/${product.slug}`,
                lastModified: product.updatedAt,
                changeFrequency: 'weekly' as const,
                priority: 0.5,
            },
        ]);

        return [...staticPages, ...eventPages, ...productPages];
    } catch (error) {
        console.error('Sitemap generation failed:', error);
        // Return static pages as fallback to prevent build failure
        return staticPages;
    }
}
