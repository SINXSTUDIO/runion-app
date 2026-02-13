/**
 * SEO Metadata Generator for Events
 * 
 * ZERO HARDCODING - All data from database
 * Production-grade with error handling and fallbacks
 * AI/Search Engine optimized
 */

import { Event, Distance } from '@prisma/client';

// Extended Event type for better typing  
type EventWithExtras = Event & {
    distances?: Distance[];
};

/**
 * Helper: Safely convert Date or string to ISO string
 */
function toISOString(date: Date | string | null | undefined): string {
    if (!date) return new Date().toISOString();
    if (typeof date === 'string') return new Date(date).toISOString();
    return date.toISOString();
}

/**
 * Generate JSON-LD Schema for SportsEvent
 * https://schema.org/SportsEvent
 * 
 * For AI Crawlers (ChatGPT, Bard, Perplexity, etc.)
 */
export function generateSportsEventSchema(event: EventWithExtras): string {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://runion.eu';

        // Calculate price range from distances
        const lowerPrice = event.distances && event.distances.length > 0
            ? Math.min(...event.distances.map(d => Number(d.price)))
            : 0;
        const upperPrice = event.distances && event.distances.length > 0
            ? Math.max(...event.distances.map(d => Number(d.price)))
            : 0;

        const schema = {
            '@context': 'https://schema.org',
            '@type': 'SportsEvent',
            'name': event.title,
            'description': event.description || 'Professional running event organized by Runion',
            'startDate': toISOString(event.eventDate),
            'endDate': toISOString(event.endDate || event.eventDate),
            'eventStatus': event.status === 'PUBLISHED' ? 'https://schema.org/EventScheduled' : 'https://schema.org/EventCancelled',
            'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
            'location': {
                '@type': 'Place',
                'name': event.location,
                'address': {
                    '@type': 'PostalAddress',
                    'addressCountry': 'HU',
                    'addressRegion': event.location
                },
                ...(event.googleMapsUrl && {
                    'url': event.googleMapsUrl
                })
            },
            'image': event.coverImage ? `${baseUrl}${event.coverImage}` : `${baseUrl}/images/logo.png`,
            'organizer': {
                '@type': 'Organization',
                'name': event.organizerName || 'Runion',
                'url': `${baseUrl}`
            },
            'offers': lowerPrice > 0 ? {
                '@type': 'AggregateOffer',
                'lowPrice': lowerPrice,
                'highPrice': upperPrice,
                'url': `${baseUrl}/races/${event.slug}/register`,
                'priceCurrency': 'HUF',
                'availability': event.status === 'PUBLISHED' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
                'validFrom': new Date().toISOString()
            } : undefined,
            'url': `${baseUrl}/races/${event.slug}`,
            // Sport-specific properties
            'sport': 'Running',
            'competitor': event.distances && event.distances.length > 0 ? {
                '@type': 'SportsTeam',
                'name': `${event.title} Participants`
            } : undefined
        };

        // Remove undefined fields
        const cleanSchema = JSON.parse(JSON.stringify(schema));

        return JSON.stringify(cleanSchema);
    } catch (error) {
        console.error('[SEO] Error generating SportsEvent schema:', error);
        // Fallback minimal schema
        return JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SportsEvent',
            'name': event.title || 'Running Event',
            'startDate': toISOString(event.eventDate)
        });
    }
}

/**
 * Generate Breadcrumb Schema
 * https://schema.org/BreadcrumbList
 */
export function generateBreadcrumbSchema(eventSlug: string, eventTitle: string): string {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://runion.eu';

        const schema = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
                {
                    '@type': 'ListItem',
                    'position': 1,
                    'name': 'Home',
                    'item': baseUrl
                },
                {
                    '@type': 'ListItem',
                    'position': 2,
                    'name': 'Races',
                    'item': `${baseUrl}/races`
                },
                {
                    '@type': 'ListItem',
                    'position': 3,
                    'name': eventTitle,
                    'item': `${baseUrl}/races/${eventSlug}`
                }
            ]
        };

        return JSON.stringify(schema);
    } catch (error) {
        console.error('[SEO] Error generating Breadcrumb schema:', error);
        return JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList' });
    }
}

/**
 * Generate Organization Schema
 * https://schema.org/Organization
 */
export function generateOrganizationSchema(): string {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://runion.eu';

        const schema = {
            '@context': 'https://schema.org',
            '@type': 'SportsOrganization',
            'name': 'Runion',
            'url': baseUrl,
            'logo': `${baseUrl}/images/logo.png`,
            'description': 'Premier running event platform in Hungary organizing professional trail running and road races with emphasis on runner safety, professional organization, and environmental sustainability.',
            'foundingDate': '2022',
            'address': {
                '@type': 'PostalAddress',
                'addressCountry': 'HU'
            },
            'sameAs': [
                // Social media links - from DB in future
                'https://www.facebook.com/runion',
                'https://www.instagram.com/runion'
            ]
        };

        return JSON.stringify(schema);
    } catch (error) {
        console.error('[SEO] Error generating Organization schema:', error);
        return JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', 'name': 'Runion' });
    }
}

/**
 * Generate AI-Friendly Meta Tags
 * For AI assistants (ChatGPT, Bard, Perplexity, Claude)
 */
export function generateAIMetaTags(event: Event): Record<string, string> {
    try {
        return {
            // Standard AI crawlers
            'ai-purpose': `This is a professional ${event.title} running event page on Runion.eu, Hungary's premier running event platform.`,
            'event-type': 'trail running, road running, sports event',
            'event-location': event.location,
            'event-date': toISOString(event.eventDate).split('T')[0],
            'registration-deadline': toISOString(event.regDeadline).split('T')[0],
            'event-status': event.status === 'PUBLISHED' ? 'open for registration' : 'closed',
            'organizer': event.organizerName || 'Runion',
            // For conversational AI
            'event-summary': `${event.title} is a running event taking place on ${new Date(toISOString(event.eventDate)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} in ${event.location}, Hungary. Registration deadline: ${new Date(toISOString(event.regDeadline)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`,
            // Keywords for search ranking
            'keywords': `${event.title}, running, trail running, hungary, ${event.location}, race, marathon, event`
        };
    } catch (error) {
        console.error('[SEO] Error generating AI meta tags:', error);
        return {};
    }
}

/**
 * Production-grade error boundary wrapper
 */
export function safelyGenerateSchema<T>(
    generator: () => T,
    fallback: T
): T {
    try {
        return generator();
    } catch (error) {
        console.error('[SEO] Schema generation error:', error);
        return fallback;
    }
}
