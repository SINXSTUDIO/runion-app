/**
 * Structured Data (JSON-LD) Schemas for SEO
 * Google Rich Results & AI Crawler Optimization
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://runion.hu';

/**
 * Organization Schema - Used on homepage
 */
export const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RUNION',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: 'Futóversenyek központi nevezési platformja Magyarországon. Maratonok, félmaratonok, trail futások egyszerű nevezési rendszere.',
    foundingDate: '2024',
    address: {
        '@type': 'PostalAddress',
        addressCountry: 'HU',
    },
    contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        email: 'info@runion.hu',
        availableLanguage: ['Hungarian', 'English', 'German'],
    },
    sameAs: [
        // Add social media links when available
        // 'https://facebook.com/runion',
        // 'https://instagram.com/runion',
    ],
};

/**
 * Event Schema - For race/event pages
 */
export function generateEventSchema(event: {
    title: string;
    description: string;
    slug: string;
    eventDate: Date;
    endDate?: Date | null;
    location: string;
    coverImage?: string;
    distances?: Array<{
        id: string;
        name: string;
        price: number;
        priceEur?: number;
        capacityLimit: number;
        _count?: { registrations: number };
    }>;
    organizer?: {
        clubName?: string;
    } | null;
}) {
    const hasAvailability = event.distances?.some(
        d => !d.capacityLimit || (d._count?.registrations || 0) < d.capacityLimit
    );

    return {
        '@context': 'https://schema.org',
        '@type': 'SportsEvent',
        name: event.title,
        description: event.description,
        startDate: event.eventDate.toISOString(),
        endDate: event.endDate?.toISOString() || event.eventDate.toISOString(),

        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',

        location: {
            '@type': 'Place',
            name: event.location,
            address: {
                '@type': 'PostalAddress',
                addressLocality: event.location,
                addressCountry: 'HU',
            },
        },

        image: event.coverImage ? [event.coverImage] : undefined,

        offers: event.distances?.map(distance => ({
            '@type': 'Offer',
            name: distance.name,
            price: distance.price.toString(),
            priceCurrency: 'HUF',
            availability: !distance.capacityLimit || (distance._count?.registrations || 0) < distance.capacityLimit
                ? 'https://schema.org/InStock'
                : 'https://schema.org/SoldOut',
            validFrom: new Date().toISOString(),
            url: `${BASE_URL}/races/${event.slug}`,
        })),

        organizer: {
            '@type': 'Organization',
            name: event.organizer?.clubName || 'RUNION',
            url: BASE_URL,
        },

        url: `${BASE_URL}/races/${event.slug}`,
    };
}

/**
 * Product Schema - For boutique items
 */
export function generateProductSchema(product: {
    name: string;
    description: string;
    slug: string;
    price: number;
    images?: string[];
    brand?: string;
    inStock?: boolean;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images || [],

        brand: product.brand ? {
            '@type': 'Brand',
            name: product.brand,
        } : undefined,

        offers: {
            '@type': 'Offer',
            price: product.price.toString(),
            priceCurrency: 'HUF',
            availability: product.inStock !== false
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            url: `${BASE_URL}/boutique/${product.slug}`,
        },

        url: `${BASE_URL}/boutique/${product.slug}`,
    };
}

/**
 * Breadcrumb Schema - For navigation
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${BASE_URL}${item.url}`,
        })),
    };
}

/**
 * Website Schema - For homepage
 */
export const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'RUNION',
    url: BASE_URL,
    description: 'Futóversenyek központi nevezési platformja Magyarországon',
    inLanguage: ['hu', 'en', 'de'],
    potentialAction: {
        '@type': 'SearchAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: `${BASE_URL}/races?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
    },
};

/**
 * Helper to inject JSON-LD script into page
 */
export function JsonLd({ data }: { data: object }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
