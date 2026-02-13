'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { logError } from '@/lib/logger';

export async function secretAuthenticate(prevState: string | undefined, formData: FormData) {
    try {
        const locale = formData.get('locale') || 'hu';
        await signIn('credentials', {
            ...Object.fromEntries(formData),
            redirectTo: `/${locale}/secretroom75/events`,
        });
    } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT') throw error;

        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    await logError(error, 'Secret Login - Invalid Credentials');
                    return 'Helytelen adatok. Ezt a próbálkozást naplóztuk.';
                default:
                    await logError(error, 'Secret Login - Auth Error');
                    return 'Hiba történt a belépés során.';
            }
        }
        await logError(error, 'Secret Login - Unexpected Error');
        throw error;
    }
}
