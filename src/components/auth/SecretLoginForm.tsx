'use client';

import { useActionState } from 'react';
import { secretAuthenticate } from '@/actions/secret-auth';
import { Button } from '@/components/ui/Button';
import { useParams } from 'next/navigation';

export default function SecretLoginForm() {
    const params = useParams();
    const locale = params.locale as string;
    const [errorMessage, dispatch, isPending] = useActionState(secretAuthenticate, undefined);

    return (
        <form action={dispatch} className="space-y-4">
            <input type="hidden" name="locale" value={locale} />
            <div>
                <label className="block text-xs font-mono text-gray-500 uppercase mb-1" htmlFor="email">Identity (Email)</label>
                <input
                    className="w-full p-2 bg-black border border-accent/20 rounded focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-white font-mono"
                    id="email"
                    type="email"
                    name="email"
                    required
                    placeholder="agent@runion.eu"
                />
            </div>
            <div>
                <label className="block text-xs font-mono text-gray-500 uppercase mb-1" htmlFor="password">Access Key (Password)</label>
                <input
                    className="w-full p-2 bg-black border border-accent/20 rounded focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-white font-mono"
                    id="password"
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                />
            </div>

            <div className="text-red-500 text-xs font-mono min-h-[16px] animate-pulse">
                {errorMessage && <span>[ERROR]: {errorMessage}</span>}
            </div>

            <Button
                type="submit"
                variant="primary"
                className="w-full h-12 rounded-xl font-bold uppercase tracking-tighter shadow-lg"
                disabled={isPending}
            >
                {isPending ? 'Authenticating...' : 'Secure Login'}
            </Button>
        </form>
    );
}
