/**
 * SEO Barrel Export
 * Central import for all SEO utilities
 */

export {
    generateMetadata,
    generateEventMetadata,
    generateProductMetadata,
    homeMetadata,
} from './metadata';

export {
    organizationSchema,
    websiteSchema,
    generateEventSchema,
    generateProductSchema,
    generateBreadcrumbSchema,
    JsonLd,
} from './structured-data';
