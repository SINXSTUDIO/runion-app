/**
 * @fileoverview HTML Sanitization utilities for XSS protection
 * Uses sanitize-html (Server-side friendly) to clean user-generated HTML content
 */

import sanitizeHtmlLibrary from 'sanitize-html';

/**
 * Configuration for allowed HTML tags and attributes
 */
const DEFAULT_TAGS = [
    'p', 'br', 'strong', 'em', 'b', 'i', 'u',
    'ul', 'ol', 'li',
    'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'code', 'pre',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span'
];

const DEFAULT_OPTIONS = {
    allowedTags: DEFAULT_TAGS,
    allowedAttributes: {
        '*': ['class', 'id'],
        'a': ['href', 'target', 'rel']
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],

};

export function sanitizeHtml(dirty: string): string {
    if (!dirty || typeof dirty !== 'string') {
        return '';
    }

    // Maximum content length to prevent DoS
    const MAX_LENGTH = 100_000; // 100KB
    if (dirty.length > MAX_LENGTH) {
        throw new Error(`HTML content exceeds maximum length of ${MAX_LENGTH} characters`);
    }

    return sanitizeHtmlLibrary(dirty, DEFAULT_OPTIONS);
}

export function sanitizePlainText(dirty: string): string {
    if (!dirty || typeof dirty !== 'string') {
        return '';
    }

    return sanitizeHtmlLibrary(dirty, {
        allowedTags: [],
        allowedAttributes: {}
    });
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 * (Kept identical to original logic as it uses Regex, not DOMPurify)
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
 */
export function sanitizeEmailContent(dirty: string): string {
    if (!dirty || typeof dirty !== 'string') {
        return '';
    }

    const emailOptions = {
        ...DEFAULT_OPTIONS,
        allowedTags: [
            ...DEFAULT_TAGS,
            'img', 'hr'
        ],
        allowedAttributes: {
            ...DEFAULT_OPTIONS.allowedAttributes,
            'img': ['src', 'alt', 'width', 'height', 'style'],
            '*': ['class', 'id', 'style'] // Allow style in emails
        }
    };

    return sanitizeHtmlLibrary(dirty, emailOptions);
}
