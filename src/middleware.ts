import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const handleI18n = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default auth((req) => {
    // 1. Security Headers
    // We let next-intl handle the routing and response generation first
    const response = handleI18n(req as unknown as NextRequest);

    // 2. Add Security Headers to the response
    const cspDirectives = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: blob: https:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
    ];

    response.headers.set('Content-Security-Policy', cspDirectives.join('; '));
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    if (process.env.NODE_ENV === 'production') {
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    response.headers.delete('X-Powered-By');

    return response;
});

export const config = {
    // Matcher from original + typical next-intl matcher + auth routes
    matcher: ['/', '/(hu|en|de)/:path*', '/((?!_next|.*\\..*).*)']
};
