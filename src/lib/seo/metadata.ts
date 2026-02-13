import { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://runion.hu';

/**
 * SEO Metadata Generator - Dynamic metadata for all pages
 */

interface MetadataOptions {
    title: string;
    description: string;
    keywords?: string[];
    image?: string;
    locale?: string;
    type?: 'website' | 'article' | 'product';
    noIndex?: boolean;
    canonical?: string;
}

/**
 * Generate complete metadata for a page
 */
export function generateMetadata({
    title,
    description,
    keywords = [],
    image = `${BASE_URL}/og-image.jpg`,
    locale = 'hu',
    type = 'website',
    noIndex = false,
    canonical,
}: MetadataOptions): Metadata {
    const fullTitle = `${title} | RUNION`;

    return {
        title: fullTitle,
        description: description.substring(0, 160), // SEO optimal length
        keywords: keywords.join(', '),

        // Open Graph (Facebook, LinkedIn)
        openGraph: {
            title: fullTitle,
            description: description,
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            type: type === 'product' ? 'website' : type, // OpenGraph doesn't support 'product' in Next.js
            locale: locale,
            siteName: 'RUNION',
            url: canonical || BASE_URL,
        },

        // Twitter Card
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description: description,
            images: [image],
            creator: '@runion',
        },

        // Canonical URL & Alternates
        alternates: canonical ? {
            canonical: canonical,
            languages: {
                'hu': canonical.replace(/\/(en|de)\//, '/hu/'),
                'en': canonical.replace(/\/(hu|de)\//, '/en/'),
                'de': canonical.replace(/\/(hu|en)\//, '/de/'),
            },
        } : undefined,

        // Robots
        robots: noIndex ? {
            index: false,
            follow: false,
        } : {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },

        // Additional
        category: 'Sports',
    };
}

/**
 * Generate Event-specific metadata
 */
export function generateEventMetadata(event: {
    title: string;
    description: string;
    location: string;
    slug: string;
    coverImage?: string;
    eventDate: Date;
}, locale: string = 'hu'): Metadata {
    const eventYear = new Date(event.eventDate).getFullYear();

    return generateMetadata({
        title: event.title,
        description: event.description,
        keywords: [
            'futóverseny',
            'futás',
            'maraton',
            'félmaraton',
            'nevezés',
            event.location,
            `${eventYear}`,
            'trail running',
            'road race',
        ],
        image: event.coverImage || `${BASE_URL}/og-image.jpg`,
        locale,
        type: 'website',
        canonical: `${BASE_URL}/${locale}/races/${event.slug}`,
    });
}

/**
 * Generate Product-specific metadata (Boutique)
 */
export function generateProductMetadata(product: {
    name: string;
    description: string;
    slug: string;
    images?: string[];
    price: number;
}, locale: string = 'hu'): Metadata {
    return generateMetadata({
        title: product.name,
        description: product.description,
        keywords: [
            'futófelszerelés',
            'sportruházat',
            'running gear',
            'webshop',
            product.name,
        ],
        image: product.images?.[0] || `${BASE_URL}/og-image.jpg`,
        locale,
        type: 'product',
        canonical: `${BASE_URL}/${locale}/boutique/${product.slug}`,
    });
}

/**
 * Default homepage metadata
 */
export const homeMetadata = generateMetadata({
    title: 'Futóversenyek központi nevezési platformja',
    description: 'Nevezz egyszerűen a kedvenc futóversenyeidre! Magyarország legnagyobb futó közösségének platformja. Maratonok, félmaratonok, trail futások.',
    keywords: [
        'futóverseny',
        'futás',
        'nevezés',
        'maraton',
        'félmaraton',
        'trail running',
        'ultra',
        'Budapest',
        'Balaton',
        'Magyarország',
    ],
    locale: 'hu',
    canonical: BASE_URL,
});
