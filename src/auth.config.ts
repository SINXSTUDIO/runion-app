import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = /^\/([a-z]{2}\/)?dashboard/.test(nextUrl.pathname);

            const isOnSecretBase = /^\/([a-z]{2}\/)?secretroom75/.test(nextUrl.pathname);
            const isSecretLoginPage = /^\/([a-z]{2}\/)?secretroom75\/login/.test(nextUrl.pathname);

            // 1. Allow access to Secret Login Page explicitly
            if (isSecretLoginPage) {
                return true;
            }

            // 2. Protect Secret Base (Admin area)
            if (isOnSecretBase) {
                if (isLoggedIn) return true;

                // Redirect to secret login with locale preservation
                const pathParts = nextUrl.pathname.split('/');
                const locale = ['hu', 'en', 'de'].includes(pathParts[1]) ? pathParts[1] : 'hu';
                return Response.redirect(new URL(`/${locale}/secretroom75/login`, nextUrl));
            }

            // 3. Protect User Dashboard
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirects to standard /login
            }

            return true;
        },
        async session({ session, token }: any) {
            if (token && session.user) {
                session.user.role = token.role as string;
                session.user.id = (token.id || token.sub) as string;
                session.user.firstName = token.firstName as string;
                session.user.lastName = token.lastName as string;
                session.user.image = token.image as string;
                session.user.tokenVersion = token.tokenVersion as number;
            }
            return session;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
