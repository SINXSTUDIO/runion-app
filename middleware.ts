console.log("DEBUG: Middleware (Root) is running");
import NextAuth from 'next-auth';
import { authConfig } from './src/auth.config';
import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

const intlMiddleware = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default auth((req) => {
    // Explicitly handle root redirect to ensure next-intl kicks in or we force it
    if (req.nextUrl.pathname === '/') {
        return Response.redirect(new URL('/hu', req.url));
    }
    const response = intlMiddleware(req);
    response.headers.set('x-pathname', req.nextUrl.pathname);
    return response;
});

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
