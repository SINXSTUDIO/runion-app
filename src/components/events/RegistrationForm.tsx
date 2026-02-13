"use client";

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { registerForEvent } from '@/actions/event'; // Correct import
import { useState, useEffect, useRef } from 'react';
import { startTransition } from 'react';
import { CreditCard, Landmark } from 'lucide-react';

// Icons wrapper
const CreditCardIcon = ({ className }: { className?: string }) => <CreditCard className={className} />;
const BankIcon = ({ className }: { className?: string }) => <Landmark className={className} />;

// Simplified Input for now if Shadcn Input is missing, or use standard
const FormInput = ({ label, name, type = "text", required = false, ...props }: any) => (
    <div className="space-y-1">
        <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">{label}</label>
        <input
            className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            name={name}
            type={type}
            required={required}
            lang="hu" // Hint for browser to use Hungarian date format
            {...props}
        />
    </div>
);

export default function RegistrationForm({ eventId, distances, defaultDistanceId }: { eventId: string, distances: any[], defaultDistanceId?: string }) {
    const [state, formAction, isPending] = useActionState(registerForEvent, null);

    // ... inside component function ...

    // Show success message if state.success
    if (state?.success) {
        // Use a generic "Sikeres Nevezés".

        return (
            <div className="bg-zinc-900 border border-accent p-8 rounded-2xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent animate-pulse" />

                <div className="mb-6 flex justify-center">
                    <div className="bg-zinc-800 p-4 rounded-full border-2 border-accent shadow-[0_0_20px_rgba(0,242,254,0.3)]">
                        {/* Runner Icon - From User Upload */}
                        <img
                            src="/runners.png"
                            alt="Sikeres Nevezés"
                            className="w-16 h-16 object-contain" // Adjusted size slightly
                        />
                    </div>
                </div>

                <h2 className="text-3xl font-black text-white mb-4 uppercase italic">Sikeres Nevezés!</h2>
                <p className="text-gray-300 mb-6 max-w-md mx-auto">{state.message}</p>

                <div className="p-6 bg-zinc-800/50 rounded-xl text-left inline-block border border-zinc-700 w-full max-w-sm">
                    <p className="font-bold text-white mb-2 uppercase text-xs tracking-wider">Státusz</p>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-green-400 font-bold">Rögzítve</span>
                    </div>

                    {state.invoiceLink && (
                        <div className="animate-in slide-in-from-bottom-2 fade-in duration-500 delay-300">
                            <p className="text-xs text-gray-400 mb-3 text-center">
                                A számla/díjbekérő elkészült:
                            </p>
                            <a href={state.invoiceLink} target="_blank" className="block">
                                <Button className="w-full font-bold bg-white text-black hover:bg-accent hover:text-black transition-all py-4 uppercase tracking-widest gap-2 border-2 border-transparent">
                                    Letöltés
                                </Button>
                            </a>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <form className="space-y-6 bg-black/50 backdrop-blur p-8 rounded-2xl border border-white/10" action={formAction}>
            {state?.message && <p className="text-red-500 font-bold bg-red-900/20 p-3 rounded border border-red-500/50">{state.message}</p>}
            <input type="hidden" name="eventId" value={eventId} />

            <FormInput label="Versenyző Neve" name="name" required placeholder="Teljes név" />
            <FormInput label="Email Cím" name="email" type="email" required placeholder="pelda@email.com" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Születési idő" name="birthDate" type="date" required />
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">Nem</label>
                    <select name="gender" className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-accent">
                        <option value="MALE">Férfi</option>
                        <option value="FEMALE">Nő</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                    <FormInput label="Irányítószám" name="zipCode" required />
                </div>
                <div className="md:col-span-2">
                    <FormInput label="Város" name="city" required />
                </div>
            </div>
            <FormInput label="Cím (Utca, házszám)" name="address" required />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Telefonszám" name="phone" type="tel" required />
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">Póló Méret</label>
                    <select name="tshirtSize" className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-accent">
                        <option value="Female / Női XXS">Female / Női XXS</option>
                        <option value="Female / Női XS">Female / Női XS</option>
                        <option value="Female / Női S">Female / Női S</option>
                        <option value="Female / Női M">Female / Női M</option>
                        <option value="Female / Női L">Female / Női L</option>
                        <option value="Female / Női XL">Female / Női XL</option>
                        <option value="Male / Férfi XS">Male / Férfi XS</option>
                        <option value="Male / Férfi S">Male / Férfi S</option>
                        <option value="Male / Férfi M">Male / Férfi M</option>
                        <option value="Male / Férfi L">Male / Férfi L</option>
                        <option value="Male / Férfi XL">Male / Férfi XL</option>
                        <option value="Male / Férfi XXL">Male / Férfi XXL</option>
                    </select>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-accent uppercase tracking-wider font-bold">Választott Táv</label>
                <select
                    name="distanceId"
                    className="w-full bg-zinc-800 border-2 border-accent text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-accent font-bold"
                    required
                    defaultValue={defaultDistanceId}
                >
                    {distances.map((d) => (
                        <option key={d.id} value={d.id}>{d.name} - {d.price} Ft</option>
                    ))}
                </select>
            </div>

            <div className="border-t border-white/10 pt-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput label="Név" name="emergencyContactName" />
                    <FormInput label="Telefonszám" name="emergencyContactPhone" type="tel" />
                </div>
            </div>

            {/* Billing Details */}
            <div className="border-t border-white/10 pt-6 mt-6">
                <h3 className="text-white font-bold mb-4 uppercase tracking-wider">Számlázási Adatok</h3>

                <div className="mb-4">
                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-zinc-900 rounded-lg border border-zinc-700 hover:border-accent/50 transition-all">
                        <input
                            type="checkbox"
                            name="requestCompanyInvoice"
                            className="w-5 h-5 accent-accent"
                            onChange={(e) => {
                                const el = document.getElementById('taxNumberContainer');
                                if (el) {
                                    if (e.target.checked) el.classList.remove('hidden');
                                    else el.classList.add('hidden');
                                }
                                // Also toggle required attr for Tax Number if possible, 
                                // but we handle validation on server or simple required prop toggle via state if this was controlled.
                                // For uncontrolled, we use JS or just let server validate if checked.
                                const input = document.getElementById('taxNumberInput') as HTMLInputElement;
                                if (input) input.required = e.target.checked;
                            }}
                        />
                        <span className="text-white font-medium">Céges számlát kérek</span>
                    </label>
                </div>

                <div id="taxNumberContainer" className="hidden mb-6 animate-in slide-in-from-top-2">
                    <FormInput
                        id="taxNumberInput"
                        label="Szervezet Adószáma"
                        name="taxNumber"
                        placeholder="xxxxxxxx-x-xx"
                    />
                </div>

                <div className="mb-4">
                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-zinc-900 rounded-lg border border-zinc-700 hover:border-accent/50 transition-all">
                        <input
                            type="checkbox"
                            name="billingSameAsPersonal"
                            className="w-5 h-5 accent-accent"
                            defaultChecked
                            onChange={(e) => {
                                const el = document.getElementById('billingAddressDetails');
                                if (el) {
                                    if (!e.target.checked) el.classList.remove('hidden');
                                    else el.classList.add('hidden');
                                }
                                // Toggle required for billing fields
                                const requiredFields = el?.querySelectorAll('input') || [];
                                requiredFields.forEach((field: any) => field.required = !e.target.checked);
                            }}
                        />
                        <span className="text-white font-medium">Számlázási cím megegyezik a fentivel</span>
                    </label>
                </div>

                <div id="billingAddressDetails" className="hidden space-y-4 animate-in slide-in-from-top-2">
                    <FormInput label="Számlázási Név / Cégnév" name="billingName" placeholder="Név vagy Cégnév" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <FormInput label="Irányítószám" name="billingZip" />
                        </div>
                        <div className="md:col-span-2">
                            <FormInput label="Város" name="billingCity" />
                        </div>
                    </div>
                    <FormInput label="Cím (Utca, házszám)" name="billingAddress" />
                </div>
            </div>

            {/* Payment Methods */}
            <div className="border-t border-white/10 pt-6 mt-6">
                <h3 className="text-white font-bold mb-4 uppercase tracking-wider">Fizetési Mód</h3>
                <div className="grid grid-cols-1 gap-4">
                    <label className="cursor-pointer">
                        <input type="radio" name="paymentMethod" value="TRANSFER" className="peer sr-only" required defaultChecked />
                        <div className="p-4 rounded-xl border-2 border-accent bg-accent/10 transition-all flex items-center gap-3">
                            <BankIcon className="w-6 h-6 text-accent" />
                            <div>
                                <div className="text-white font-bold">Átutalás</div>
                                <div className="text-xs text-gray-400">Díjbekérő alapján</div>
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            {/* HONEYPOT - Anti-spam */}
            <div style={{ display: 'none' }} aria-hidden="true">
                <label htmlFor="website_hp">Website</label>
                <input type="text" name="website_hp" id="website_hp" autoComplete="off" tabIndex={-1} />
            </div>

            <div className="border-t border-white/10 pt-6">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" name="terms" required className="mt-1 w-5 h-5 accent-accent" />
                    <span className="text-sm text-gray-400">
                        Elfogadom az <a href="/privacy" className="text-accent underline">Adatvédelmi Tájékoztatót</a> és a <a href="/terms" className="text-accent underline">Versenykiírást</a>.
                    </span>
                </label>
            </div>

            <Button type="submit" className="w-full text-lg font-bold py-6 uppercase tracking-widest mt-8" disabled={isPending}>
                {isPending ? 'Feldolgozás...' : 'Regisztráció Véglegesítése'}
            </Button>
        </form>
    );
}
