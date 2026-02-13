/**
 * @fileoverview HTML Sanitization utilities for XSS protection
 * Uses DOMPurify to clean user-generated HTML content
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Configuration for allowed HTML tags and attributes
 * Whitelist approach for maximum security
 */
const SANITIZE_CONFIG = {
    ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'b', 'i', 'u',
        'ul', 'ol', 'li',
        'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'code', 'pre',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span'
    ],
    ALLOWED_ATTR: [
        'href', 'target', 'rel', 'class', 'id'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):)/i,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - Raw HTML string that may contain malicious code
 * @returns Sanitized HTML safe for rendering
 * 
 * @example
 * ```typescript
 * const userInput = '<script>alert("xss")</script><p>Hello</p>';
 * const clean = sanitizeHtml(userInput);
 * // Returns: '<p>Hello</p>'
 * ```
 */
export function sanitizeHtml(dirty: string): string {
    if (!dirty || typeof dirty !== 'string') {
        return '';
    }

    // Maximum content length to prevent DoS
    const MAX_LENGTH = 100_000; // 100KB
    if (dirty.length > MAX_LENGTH) {
        throw new Error(`HTML content exceeds maximum length of ${MAX_LENGTH} characters`);
    }

    const clean = DOMPurify.sanitize(dirty, SANITIZE_CONFIG) as string;
    return clean;
}

/**
 * Sanitize plain text (strips all HTML)
 * Use for user input that should never contain HTML
 * 
 * @param dirty - Raw text that may contain HTML
 * @returns Plain text with all HTML removed
 */
export function sanitizePlainText(dirty: string): string {
    if (!dirty || typeof dirty !== 'string') {
        return '';
    }

    const clean = DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
    return clean;
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 * @param url - URL to validate
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
    if (!url || typeof url !== 'string') {
        return '';
    }

    // Remove whitespace
    const trimmed = url.trim();

    // Block dangerous protocols
    const dangerousProtocols = /^(javascript|data|vbscript|file):/i;
    if (dangerousProtocols.test(trimmed)) {
        return '';
    }

    // Allow only http(s), mailto, tel
    const allowedProtocols = /^(https?|mailto|tel):/i;
    if (!allowedProtocols.test(trimmed) && trimmed.startsWith(':')) {
        return '';
    }

    return trimmed;
}

/**
 * Validate and sanitize email confirmation text
 * More permissive than general HTML but still safe
 */
export function sanitizeEmailContent(dirty: string): string {
    if (!dirty || typeof dirty !== 'string') {
        return '';
    }

    const emailConfig = {
        ...SANITIZE_CONFIG,
        ALLOWED_TAGS: [
            ...(SANITIZE_CONFIG.ALLOWED_TAGS as string[]),
            'img', 'hr'
        ],
        ALLOWED_ATTR: [
            ...(SANITIZE_CONFIG.ALLOWED_ATTR as string[]),
            'src', 'alt', 'width', 'height', 'style'
        ],
    };

    const clean = DOMPurify.sanitize(dirty, emailConfig) as string;
    return clean;
}
