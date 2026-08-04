'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { logError } from '@/lib/logger';

export async function secretAuthenticate(prevState: string | undefined, formData: FormData) {
    const locale = (formData.get('locale') as string) || 'hu';
    const email = (formData.get('email') as string)?.trim();
    const password = formData.get('password') as string;

    if (!email || !password) {
        return 'Kérjük adja meg az e-mail címet és a jelszót!';
    }

    try {
        await signIn('credentials', {
            email,
            password,
            redirectTo: `/${locale}/secretroom75`,
        });
    } catch (error: any) {
        const isRedirect =
            error?.digest?.startsWith('NEXT_REDIRECT') ||
            error?.message?.includes('NEXT_REDIRECT') ||
            error?.cause?.err?.message?.includes('NEXT_REDIRECT');

        if (isRedirect) {
            throw error;
        }

        const errorMsg = String(error?.cause?.err?.message || error?.message || error);

        if (errorMsg.includes('Too many')) {
            return 'Túl sok próbálkozás. Kérjük próbáld újra 15 perc múlva!';
        }

        if (error instanceof AuthError || errorMsg.includes('CredentialsSignin') || errorMsg.includes('Invalid credentials')) {
            await logError(error, 'Secret Login - Invalid Credentials');
            return 'Helytelen e-mail cím vagy jelszó.';
        }

        await logError(error, 'Secret Login - Unexpected Error');
        return 'Helytelen e-mail cím vagy jelszó. Kérjük ellenőrizd az adataidat!';
    }

    redirect(`/${locale}/secretroom75`);
}
