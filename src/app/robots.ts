import { MetadataRoute } from 'next';

/**
 * Robots.txt Configuration
 * Optimized for search engines and AI crawlers
 */
export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://runion.hu';

    return {
        rules: [
            // Default rule for all crawlers
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/secretroom75/', // Admin area
                    '/dashboard/',    // User dashboard
                    '/api/',          // API routes
                    '/invoices/',     // Private invoices
                    '/_next/',        // Next.js internals
                    '/static/',       // Static assets (handled by CDN)
                ],
            },

            // OpenAI GPT (ChatGPT, GPT-4)
            {
                userAgent: 'GPTBot',
                allow: '/',
                disallow: [
                    '/secretroom75/',
                    '/dashboard/',
                    '/invoices/',
                ],
                crawlDelay: 1, // Be nice to AI crawlers
            },

            // ChatGPT browsing mode
            {
                userAgent: 'ChatGPT-User',
                allow: '/',
                disallow: [
                    '/secretroom75/',
                    '/dashboard/',
                    '/invoices/',
                ],
            },

            // Anthropic Claude
            {
                userAgent: 'Claude-Web',
                allow: '/',
                disallow: [
                    '/secretroom75/',
                    '/dashboard/',
                    '/invoices/',
                ],
            },

            // Google Bard / Gemini
            {
                userAgent: 'Google-Extended',
                allow: '/',
                disallow: [
                    '/secretroom75/',
                    '/dashboard/',
                    '/invoices/',
                ],
            },

            // Perplexity AI
            {
                userAgent: 'PerplexityBot',
                allow: '/',
                disallow: [
                    '/secretroom75/',
                    '/dashboard/',
                    '/invoices/',
                ],
            },

            // Common AI/ML crawlers
            {
                userAgent: 'CCBot', // Common Crawl (used by many AI models)
                allow: '/',
                disallow: [
                    '/secretroom75/',
                    '/dashboard/',
                    '/invoices/',
                ],
            },

            // Bad bots - block completely
            {
                userAgent: [
                    'SemrushBot',     // SEO tool crawler
                    'AhrefsBot',      // SEO tool crawler
                    'MJ12bot',        // Majestic SEO
                    'DotBot',         // Moz crawler
                ],
                disallow: '/',
            },
        ],

        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
