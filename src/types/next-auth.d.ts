import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface User {
        id: string;
        role?: string;
        firstName?: string | null;
        lastName?: string | null;
        phoneNumber?: string | null;
        birthDate?: Date | string | null;
        clubName?: string | null;
        tshirtSize?: string | null;
        city?: string | null;
        zipCode?: string | null;
        address?: string | null;
        emergencyContactPhone?: string | null;
        createdAt?: Date | string | null;
        tokenVersion?: number;
        fiveTrialsId?: string | null;
    }

    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: User & DefaultSession["user"]
    }
}

import { JWT } from "next-auth/jwt"

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        id?: string;
        role?: string;
        firstName?: string | null;
        lastName?: string | null;
        image?: string | null;
        tokenVersion?: number;
    }
}
