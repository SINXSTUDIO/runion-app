
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { submitChangeRequest } from '@/actions/requests';
import { Button } from '@/components/ui/Button';
import { Check, Loader2, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TransferFormState {
    success: boolean;
    message: string;
    errors?: {
        name?: string[];
        email?: string[];
        phone?: string[];
        birthDate?: string[];
        address?: string[];
        city?: string[];
        zipCode?: string[];
        fromEvent?: string[];
        toEvent?: string[];
        [key: string]: string[] | undefined;
    };
}

const initialState: TransferFormState = {
    success: false,
    message: '',
    errors: {} as TransferFormState['errors']
};

function SubmitButton() {
    const { pending } = useFormStatus();
    const t = useTranslations('ChangeRequest');

    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full h-14 text-lg font-black uppercase italic tracking-tighter"
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('submitting')}
                </>
            ) : (
                <>
                    <Send className="mr-2 h-5 w-5" /> {t('submit')}
                </>
            )}
        </Button>
    );
}

interface TransferFormProps {
    cancellationEnabled: boolean;
    initialData?: {
        name?: string | null;
        email?: string | null;
        phone?: string | null;
        birthDate?: Date | null;
        address?: string | null;
        city?: string | null;
        zipCode?: string | null;
    };
}

export default function TransferForm({ cancellationEnabled, initialData }: TransferFormProps) {
    const [state, formAction] = useFormState(submitChangeRequest, initialState);
    const t = useTranslations('ChangeRequest');

    if (state?.success) {
        return (
            <div className="bg-emerald-900/20 border border-emerald-500/50 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{t('successTitle')}</h3>
                <p className="text-emerald-400 text-lg mb-6">{state.message}</p>
                <p className="text-zinc-400">{t('successMessage')}</p>
                <div className="mt-8">
                    <Button variant="outline" onClick={() => window.location.reload()}>{t('newRequest')}</Button>
                </div>
            </div>
        );
    }

    return (
        <form action={formAction} className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 md:p-10 shadow-2xl">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Type Selection */}
                <div className="md:col-span-2">
                    <label className="block text-zinc-400 text-sm font-bold uppercase tracking-wider mb-3">{t('typeLabel')}</label>
                    <div className="flex flex-wrap gap-4">
                        <label className="flex-1 min-w-[140px] cursor-pointer">
                            <input type="radio" name="type" value="TRANSFER" defaultChecked className="peer sr-only" />
                            <div className="h-full p-4 rounded-xl bg-black border-2 border-zinc-800 peer-checked:border-accent peer-checked:bg-accent/10 transition-all text-center">
                                <span className="font-bold text-white block">{t('types.transfer.title')}</span>
                                <span className="text-xs text-zinc-500">{t('types.transfer.desc')}</span>
                            </div>
                        </label>

                        {cancellationEnabled && (
                            <label className="flex-1 min-w-[140px] cursor-pointer">
                                <input type="radio" name="type" value="CANCELLATION" className="peer sr-only" />
                                <div className="h-full p-4 rounded-xl bg-black border-2 border-zinc-800 peer-checked:border-red-500 peer-checked:bg-red-500/10 transition-all text-center">
                                    <span className="font-bold text-white block">{t('types.cancellation.title')}</span>
                                    <span className="text-xs text-zinc-500">{t('types.cancellation.desc')}</span>
                                </div>
                            </label>
                        )}

                        <label className="flex-1 min-w-[140px] cursor-pointer">
                            <input type="radio" name="type" value="MODIFICATION" className="peer sr-only" />
                            <div className="h-full p-4 rounded-xl bg-black border-2 border-zinc-800 peer-checked:border-blue-500 peer-checked:bg-blue-500/10 transition-all text-center">
                                <span className="font-bold text-white block">{t('types.modification.title')}</span>
                                <span className="text-xs text-zinc-500">{t('types.modification.desc')}</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Personal Info */}
                <div>
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">{t('fields.name')}</label>
                    <input name="name" type="text" required defaultValue={initialData?.name || ''} placeholder={t('fields.namePlaceholder')} className="w-full bg-black border border-zinc-800 focus:border-accent rounded-lg p-3 text-white outline-none transition-colors" />
                    {(state.errors as any)?.name && <p className="text-red-500 text-xs mt-1">{(state.errors as any).name[0]}</p>}
                </div>

                <div>
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">{t('fields.phone')}</label>
                    <input name="phone" type="tel" required defaultValue={initialData?.phone || ''} placeholder="+36..." className="w-full bg-black border border-zinc-800 focus:border-accent rounded-lg p-3 text-white outline-none transition-colors" />
                    {(state.errors as any)?.phone && <p className="text-red-500 text-xs mt-1">{(state.errors as any).phone[0]}</p>}
                </div>

                <div>
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">{t('fields.email')}</label>
                    <input name="email" type="email" required defaultValue={initialData?.email || ''} placeholder="pelda@email.hu" className="w-full bg-black border border-zinc-800 focus:border-accent rounded-lg p-3 text-white outline-none transition-colors" />
                    {(state.errors as any)?.email && <p className="text-red-500 text-xs mt-1">{(state.errors as any).email[0]}</p>}
                </div>

                <div>
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">{t('fields.birthDate')}</label>
                    <input
                        name="birthDate"
                        type="date"
                        required
                        defaultValue={initialData?.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : ''}
                        className="w-full bg-black border border-zinc-800 focus:border-accent rounded-lg p-3 text-white outline-none transition-colors"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">{t('fields.address')}</label>
                    <input name="address" type="text" required defaultValue={initialData?.address || ''} placeholder={t('fields.addressPlaceholder')} className="w-full bg-black border border-zinc-800 focus:border-accent rounded-lg p-3 text-white outline-none transition-colors" />
                </div>

                <div>
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">{t('fields.city')}</label>
                    <input name="city" type="text" required defaultValue={initialData?.city || ''} className="w-full bg-black border border-zinc-800 focus:border-accent rounded-lg p-3 text-white outline-none transition-colors" />
                </div>

                <div>
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">{t('fields.zipCode')}</label>
                    <input name="zipCode" type="text" required defaultValue={initialData?.zipCode || ''} className="w-full bg-black border border-zinc-800 focus:border-accent rounded-lg p-3 text-white outline-none transition-colors" />
                </div>

                {/* Request Details */}
                <div className="md:col-span-2 border-t border-zinc-800 my-4"></div>

                <div className="md:col-span-2">
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">{t('fields.fromEvent')}</label>
                    <input name="fromEvent" type="text" required placeholder={t('fields.fromEventPlaceholder')} className="w-full bg-black border border-zinc-800 focus:border-accent rounded-lg p-3 text-white outline-none transition-colors" />
                    {(state.errors as any)?.fromEvent && <p className="text-red-500 text-xs mt-1">{(state.errors as any).fromEvent[0]}</p>}
                </div>

                <div className="md:col-span-2">
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">{t('fields.toEvent')}</label>
                    <input name="toEvent" type="text" placeholder={t('fields.toEventPlaceholder')} className="w-full bg-black border border-zinc-800 focus:border-accent rounded-lg p-3 text-white outline-none transition-colors" />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">{t('fields.comment')}</label>
                    <textarea name="comment" rows={3} className="w-full bg-black border border-zinc-800 focus:border-accent rounded-lg p-3 text-white outline-none transition-colors" placeholder={t('fields.commentPlaceholder')}></textarea>
                </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-4 mb-8 bg-black/40 p-4 rounded-xl border border-zinc-800">
                <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative mt-1">
                        <input type="checkbox" name="termsAccepted" required className="peer sr-only" />
                        <div className="w-5 h-5 border-2 border-zinc-600 rounded bg-transparent peer-checked:bg-accent peer-checked:border-accent transition-colors"></div>
                        <Check className="w-3.5 h-3.5 text-black absolute top-0.5 left-0.5 opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                        {t.rich('fields.terms', {
                            link: (chunks) => <a href="/terms" target="_blank" className="text-accent hover:underline font-bold relative z-10">{chunks}</a>
                        })}
                    </span>
                </label>

                <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative mt-1">
                        <input type="checkbox" name="privacyAccepted" required className="peer sr-only" />
                        <div className="w-5 h-5 border-2 border-zinc-600 rounded bg-transparent peer-checked:bg-accent peer-checked:border-accent transition-colors"></div>
                        <Check className="w-3.5 h-3.5 text-black absolute top-0.5 left-0.5 opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                        {t.rich('fields.privacy', {
                            link: (chunks) => <a href="/privacy" target="_blank" className="text-accent hover:underline font-bold relative z-10">{chunks}</a>
                        })}
                    </span>
                </label>
            </div>

            {state?.message && !state.success && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 text-center">
                    {state.message}
                </div>
            )}

            <SubmitButton />

        </form>
    );
}
