"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { useFormState } from "react-dom";
import { InputHTMLAttributes, forwardRef, useEffect, useState } from "react";
import { createEvent, updateEvent } from "@/actions/events";
import { ImageUpload } from "../ui/ImageUpload";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Plus, Trash2, MapPin, Building2, Globe, Languages, Save, Info, Clock, DollarSign, List, Gift, Heart, Coffee, Utensils, Timer, Camera, Mic, Facebook, Map as MapIcon, ChevronRight, Users, Rocket, ShoppingBag, MessageSquare } from "lucide-react";

// Reusing schema validation on client side for immediate feedback
const eventSchema = z.object({
    title: z.string().min(3, "A címnek legalább 3 karakternek kell lennie"),
    slug: z.string().min(3, "Az URL azonosítónak (slug) legalább 3 karakternek kell lennie"),
    eventDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Érvénytelen dátum formátum",
    }),
    endDate: z.string().optional().nullable(),
    regDeadline: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Érvénytelen dátum formátum",
    }),
    location: z.string().min(3, "A helyszín megadása kötelező"),
    googleMapsUrl: z.string().optional(),
    websiteUrl: z.string().optional(),
    organizerName: z.string().optional(),
    notificationEmail: z.string().email("Érvénytelen email formátum").optional().or(z.literal('')),
    extraOrganizers: z.string().optional(),
    showCountdown: z.boolean().default(true),
    description: z.string().min(10, "A leírásnak legalább 10 karakternek kell lennie"),
    coverImage: z.string().optional(),
    ogImage: z.string().optional(),
    ogDescription: z.string().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED']).default('DRAFT'),
    paymentReminderEnabled: z.boolean().default(true),
});

type EventFormProps = {
    event?: any; // If present, we are in edit mode
    sellers?: any[]; // List of available sellers
};

export default function EventForm({ event, sellers = [] }: EventFormProps) {
    // We use server actions, but also react-hook-form for client validation
    // To combine them, we can use a hidden form submission or just stick to standard form action
    // However, to get validation errors from server, we need useFormState.

    // For simplicity in this iteration, we'll use standard form action with useFormState for server feedback
    // and basic browser validation or simple client checks.

    const [state, formAction] = useFormState(event ? updateEvent.bind(null, event.id) : createEvent, {
        message: "",
        type: ""
    });

    const [coverImage, setCoverImage] = useState(event?.coverImage || "");
    const [ogImage, setOgImage] = useState(event?.ogImage || "");
    const [extras, setExtras] = useState<any[]>(event?.extras || []);

    // New states
    const [extraLocations, setExtraLocations] = useState<any[]>(event?.extraLocations || []);
    const [extraOrganizersJson, setExtraOrganizersJson] = useState<any[]>(event?.extraOrganizersJson || []);

    // Bank details state
    const [sellerId, setSellerId] = useState(event?.sellerId || '');
    const [beneficiaryName, setBeneficiaryName] = useState(event?.seller?.name || event?.beneficiaryName || '');
    const [bankName, setBankName] = useState(event?.seller?.bankName || event?.bankName || '');
    const [bankAccountNumber, setBankAccountNumber] = useState(event?.seller?.bankAccountNumber || event?.bankAccountNumber || '');
    const [bankAccountNumberEuro, setBankAccountNumberEuro] = useState(event?.seller?.bankAccountNumberEuro || event?.bankAccountNumberEuro || '');
    const [ibanEuro, setIbanEuro] = useState(event?.seller?.ibanEuro || event?.ibanEuro || '');
    const [selectedTemplate, setSelectedTemplate] = useState<string>(event?.sellerId || '');

    // Infopack state
    const [infopack, setInfopack] = useState<any>(event?.infopack || {
        importantInfo: '',
        importantMessage: '',
        onSitePrices: [],
        schedule: [],
        distances: [],
        included: [],
        raceCategories: [],
        exhibitors: '',
        surpriseRun: { title: '', description: '', prize: '' },
        practicalInfo: [],
        gpsTracks: [],
        socialLinks: [],
        footerSpeakers: '',
        footerPhotographers: '',
        footerOrganizers: ''
    });

    const handleSellerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedSellerId = e.target.value;
        setSellerId(selectedSellerId);
        setSelectedTemplate(selectedSellerId);

        if (!selectedSellerId || selectedSellerId === 'custom') {
            // Custom mode - clear fields for manual input
            setBeneficiaryName('');
            setBankName('');
            setBankAccountNumber('');
            return;
        }

        // Get Seller from database
        const seller = sellers.find(s => s.id === selectedSellerId);
        if (seller) {
            setBeneficiaryName(seller.name);
            setBankName(seller.bankName || '');
            setBankAccountNumber(seller.bankAccountNumber || '');
            setBankAccountNumberEuro(seller.bankAccountNumberEuro || '');
            setIbanEuro(seller.ibanEuro || '');
        }
    };

    return (
        <form action={formAction} className="space-y-8 max-w-4xl bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
            {/* Alapvető adatok */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">Alapvető Adatok</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Esemény Neve (HU)</label>
                        <input
                            name="title"
                            defaultValue={event?.title}
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                            required
                            onChange={(e) => {
                                // Auto-generate slug from title
                                const title = e.target.value;
                                const slug = title.toLowerCase()
                                    .replace(/\s+/g, '-')
                                    .replace(/[^\w-]+/g, '')
                                    .replace(/--+/g, '-')
                                    .replace(/^-+/, '')
                                    .replace(/-+$/, '');

                                // Find slug input and update it
                                const slugInput = document.querySelector('input[name="slug"]') as HTMLInputElement;
                                if (slugInput) slugInput.value = slug;
                            }}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Esemény Neve (EN)</label>
                        <input
                            name="titleEn"
                            defaultValue={event?.titleEn}
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-zinc-300 focus:border-accent focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Esemény Neve (DE)</label>
                        <input
                            name="titleDe"
                            defaultValue={event?.titleDe}
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-zinc-300 focus:border-accent focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2 font-mono text-zinc-500">URL Azonosító (Slug)</label>
                        <input
                            name="slug"
                            defaultValue={event?.slug}
                            placeholder="pl. schiller-szzerelmes-fured"
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none font-mono text-sm"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Időpontok */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">Dátum és Időpont</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Kezdés Időpontja</label>
                        <input
                            type="datetime-local"
                            name="eventDate"
                            defaultValue={event?.eventDate ? new Date(event.eventDate).toISOString().slice(0, 16) : ''}
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Befejezés (Opcionális)</label>
                        <input
                            type="datetime-local"
                            name="endDate"
                            defaultValue={event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : ''}
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                        />
                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Multi-day eseményekhez</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Nevezési Határidő</label>
                        <input
                            type="datetime-local"
                            name="regDeadline"
                            defaultValue={event?.regDeadline ? new Date(event.regDeadline).toISOString().slice(0, 16) : ''}
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                            required
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-8">
                        <input
                            type="checkbox"
                            name="showCountdown"
                            id="showCountdown"
                            defaultChecked={event ? event.showCountdown : true}
                            className="w-5 h-5 rounded border-zinc-800 bg-black text-accent focus:ring-accent"
                        />
                        <label htmlFor="showCountdown" className="text-sm font-medium text-gray-300">Visszaszámláló megjelenítése</label>
                    </div>
                </div>
            </div>

            {/* Helyszín és Elérhetőség */}
            <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-accent" />
                        Helyszínek
                    </h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setExtraLocations([...extraLocations, { id: Date.now().toString(), name: '', googleMapsUrl: '' }])}
                        className="text-xs h-8 border-accent text-accent hover:bg-accent hover:text-black"
                    >
                        + Új Helyszín
                    </Button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Elsődleges Helyszín Neve</label>
                        <input
                            name="location"
                            defaultValue={event?.location}
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2 font-mono text-zinc-500">Elsődleges Google Maps URL</label>
                        <div className="flex gap-2">
                            <input
                                name="googleMapsUrl"
                                defaultValue={event?.googleMapsUrl}
                                placeholder="https://goo.gl/maps/..."
                                className="flex-1 bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none font-mono text-sm"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    const locationInput = document.querySelector('input[name="location"]') as HTMLInputElement;
                                    const googleMapsUrlInput = document.querySelector('input[name="googleMapsUrl"]') as HTMLInputElement;
                                    if (locationInput && googleMapsUrlInput && locationInput.value) {
                                        // Generate Google Maps Search URL
                                        const encodedLocation = encodeURIComponent(locationInput.value);
                                        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
                                        googleMapsUrlInput.value = mapsUrl;
                                    }
                                }}
                                className="px-4 whitespace-nowrap border-accent text-accent hover:bg-accent hover:text-black"
                            >
                                🗺️ Generate
                            </Button>
                        </div>
                    </div>

                    {/* Extra Locations */}
                    {extraLocations.length > 0 && (
                        <div className="space-y-4 pt-4">
                            <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">További Helyszínek</h4>
                            {extraLocations.map((loc, index) => (
                                <div key={loc.id || index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-black/30 border border-zinc-800 rounded-xl relative group">
                                    <button
                                        type="button"
                                        onClick={() => setExtraLocations(extraLocations.filter((_, i) => i !== index))}
                                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Helyszín neve</label>
                                        <input
                                            value={loc.name}
                                            onChange={(e) => {
                                                const newLocs = [...extraLocations];
                                                newLocs[index].name = e.target.value;
                                                setExtraLocations(newLocs);
                                            }}
                                            placeholder="pl. Parkoló"
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white focus:border-accent focus:outline-none text-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Google Maps URL</label>
                                        <div className="flex gap-2">
                                            <input
                                                value={loc.googleMapsUrl}
                                                onChange={(e) => {
                                                    const newLocs = [...extraLocations];
                                                    newLocs[index].googleMapsUrl = e.target.value;
                                                    setExtraLocations(newLocs);
                                                }}
                                                placeholder="https://goo.gl..."
                                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white focus:border-accent focus:outline-none font-mono text-xs"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    if (loc.name) {
                                                        const encodedLocation = encodeURIComponent(loc.name);
                                                        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
                                                        const newLocs = [...extraLocations];
                                                        newLocs[index].googleMapsUrl = mapsUrl;
                                                        setExtraLocations(newLocs);
                                                    }
                                                }}
                                                className="px-3 text-xs whitespace-nowrap border-accent text-accent hover:bg-accent hover:text-black"
                                            >
                                                🗺️
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <input type="hidden" name="extraLocations" value={JSON.stringify(extraLocations)} />

                    <div className="pt-4 border-t border-zinc-800/50">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Esemény Weboldala (Honlap)</label>
                        <input
                            name="websiteUrl"
                            defaultValue={event?.websiteUrl}
                            placeholder="https://..."
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Kiegészítők (Extras) */}
            <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                    <h3 className="text-xl font-bold text-white">Választható Kiegészítők</h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setExtras([...extras, { id: Date.now().toString(), name: '', nameEn: '', nameDe: '', price: 0, priceEur: 0 }])}
                        className="text-xs h-8 border-accent text-accent hover:bg-accent hover:text-black"
                    >
                        + Új Termék
                    </Button>
                </div>

                {extras.length === 0 ? (
                    <p className="text-zinc-500 text-sm italic">Nincsenek kiegészítők hozzáadva.</p>
                ) : (
                    <div className="space-y-4">
                        {extras.map((extra, index) => (
                            <div key={extra.id} className="bg-black/40 p-4 rounded-xl border border-zinc-800 relative group space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Megnevezés (HU)</label>
                                        <textarea
                                            rows={2}
                                            value={extra.name}
                                            onChange={(e) => {
                                                const newExtras = [...extras];
                                                newExtras[index].name = e.target.value;
                                                setExtras(newExtras);
                                            }}
                                            placeholder="pl. Póló"
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white focus:border-accent focus:outline-none text-sm resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Angol (EN)</label>
                                        <textarea
                                            rows={2}
                                            value={extra.nameEn || ''}
                                            onChange={(e) => {
                                                const newExtras = [...extras];
                                                newExtras[index].nameEn = e.target.value;
                                                setExtras(newExtras);
                                            }}
                                            placeholder="e.g. T-Shirt"
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-zinc-300 focus:border-accent focus:outline-none text-sm resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Német (DE)</label>
                                        <textarea
                                            rows={2}
                                            value={extra.nameDe || ''}
                                            onChange={(e) => {
                                                const newExtras = [...extras];
                                                newExtras[index].nameDe = e.target.value;
                                                setExtras(newExtras);
                                            }}
                                            placeholder="z.B. T-Shirt"
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-zinc-300 focus:border-accent focus:outline-none text-sm resize-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Ár (HUF)</label>
                                        <input
                                            type="number"
                                            value={extra.price}
                                            onChange={(e) => {
                                                const newExtras = [...extras];
                                                newExtras[index].price = parseInt(e.target.value) || 0;
                                                setExtras(newExtras);
                                            }}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white focus:border-accent focus:outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Ár (EUR)</label>
                                        <input
                                            type="number"
                                            value={extra.priceEur || 0}
                                            onChange={(e) => {
                                                const newExtras = [...extras];
                                                newExtras[index].priceEur = parseInt(e.target.value) || 0;
                                                setExtras(newExtras);
                                            }}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white focus:border-accent focus:outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setExtras(extras.filter((_, i) => i !== index))}
                                            className="w-full text-red-500 hover:bg-red-500/10 h-[38px]"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" /> Törlés
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <input type="hidden" name="extras" value={JSON.stringify(extras)} />
            </div>

            {/* Szervezők */}
            <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-accent" />
                        Szervezők
                    </h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setExtraOrganizersJson([...extraOrganizersJson, { id: Date.now().toString(), name: '' }])}
                        className="text-xs h-8 border-accent text-accent hover:bg-accent hover:text-black"
                    >
                        + Új Szervező
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Fő Szervező Neve</label>
                        <input
                            name="organizerName"
                            defaultValue={event?.organizerName}
                            placeholder="pl. BAC Egyesület"
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2 font-mono text-zinc-500">További Szervezők (Sima szöveg)</label>
                        <input
                            name="extraOrganizers"
                            defaultValue={event?.extraOrganizers}
                            placeholder="Egyesület X, Cég Y"
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-zinc-300 focus:border-accent focus:outline-none"
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Értesítési Email (Nevezések ide jönnek)</label>
                    <input
                        name="notificationEmail"
                        type="email"
                        defaultValue={event?.notificationEmail || ''}
                        placeholder="pl. info@szervezo.hu"
                        className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                    />
                </div>

                {/* Extra Organizers List */}
                {extraOrganizersJson.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Dinamikus Szervező Lista</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {extraOrganizersJson.map((org, index) => (
                                <div key={org.id || index} className="flex gap-2 items-center bg-black/30 p-3 rounded-xl border border-zinc-800 group">
                                    <div className="flex-1">
                                        <input
                                            value={org.name}
                                            onChange={(e) => {
                                                const newOrgs = [...extraOrganizersJson];
                                                newOrgs[index].name = e.target.value;
                                                setExtraOrganizersJson(newOrgs);
                                            }}
                                            placeholder="Szervező neve"
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white focus:border-accent focus:outline-none text-sm"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setExtraOrganizersJson(extraOrganizersJson.filter((_, i) => i !== index))}
                                        className="p-1.5 text-zinc-500 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <input type="hidden" name="extraOrganizersJson" value={JSON.stringify(extraOrganizersJson)} />
            </div>

            {/* Banki Információk */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <h3 className="text-xl font-bold text-white">Banki Információk (Kedvezményezett)</h3>
                </div>

                <div className="space-y-4">
                    {/* Seller Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Szervező / Kedvezményezett Kiválasztása</label>
                        <select
                            name="sellerId"
                            value={sellerId}
                            onChange={handleSellerChange}
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                        >
                            <option value="">Válassz szervezetet...</option>
                            {sellers.length > 0 && (
                                <optgroup label="Adatbázisban tárolt szervezetek">
                                    {sellers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </optgroup>
                            )}
                            <option value="custom">--- Egyéni megadás ---</option>
                        </select>
                        <p className="text-xs text-zinc-500 mt-1">Válaszd ki a szervezetet vagy add meg egyénileg az adatokat</p>
                    </div>

                    {/* Manual Bank Details (visible if custom or no selection) */}
                    {(sellerId === 'custom' || !sellerId) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-zinc-800/30 rounded-xl border border-zinc-700">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Kedvezményezett Neve</label>
                                <input
                                    name="beneficiaryName"
                                    value={beneficiaryName}
                                    onChange={(e) => setBeneficiaryName(e.target.value)}
                                    placeholder="pl. Balatonfüredi Atlétikai Klub"
                                    className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Bank Neve</label>
                                <input
                                    name="bankName"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    placeholder="pl. OTP Bank"
                                    className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Bankszámlaszám (HUF)</label>
                                <input
                                    name="bankAccountNumber"
                                    value={bankAccountNumber}
                                    onChange={(e) => setBankAccountNumber(e.target.value)}
                                    placeholder="11700000-00000000-00000000"
                                    className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none font-mono"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-400 mb-2">IBAN (EUR)</label>
                                <input
                                    name="ibanEuro"
                                    value={ibanEuro}
                                    onChange={(e) => setIbanEuro(e.target.value)}
                                    placeholder="HU00 0000 0000 0000 0000 0000 0000"
                                    className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none font-mono"
                                />
                            </div>
                        </div>
                    )}

                    {/* Display selected seller info (read-only preview) */}
                    {sellerId && sellerId !== 'custom' && (
                        <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl">
                            <p className="text-xs text-zinc-500 uppercase font-bold mb-2">Kiválasztott kedvezményezett adatai:</p>
                            <div className="space-y-1 text-sm">
                                <p><span className="text-zinc-400">Név:</span> <span className="text-white font-bold">{beneficiaryName}</span></p>
                                <p><span className="text-zinc-400">Bank:</span> <span className="text-white">{bankName}</span></p>
                                <p><span className="text-zinc-400">Számlaszám (HUF):</span> <span className="text-accent font-mono">{bankAccountNumber}</span></p>
                                {ibanEuro && (
                                    <p><span className="text-zinc-400">IBAN (EUR):</span> <span className="text-accent font-mono">{ibanEuro}</span></p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tartalom és Megjelenés */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-white border-b border-zinc-800 pb-2 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-accent" />
                    Tartalom és Megjelenés
                </h3>

                <div className="space-y-4">
                    <div>
                        <ImageUpload
                            label="Borítókép"
                            value={coverImage}
                            onChange={setCoverImage}
                            description="Fő borítókép az esemény oldalához"
                        />
                        <input type="hidden" name="coverImage" value={coverImage} />
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                <Languages className="w-4 h-4" />
                                Leírás (HU)
                            </label>
                            <textarea
                                name="description"
                                defaultValue={event?.description}
                                rows={6}
                                className="w-full bg-black border border-zinc-800 rounded-lg p-4 text-white focus:border-accent focus:outline-none leading-relaxed"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-500 mb-2 flex items-center gap-2">
                                <Languages className="w-4 h-4" />
                                Leírás (EN)
                            </label>
                            <textarea
                                name="descriptionEn"
                                defaultValue={event?.descriptionEn}
                                rows={4}
                                className="w-full bg-black border border-zinc-800 rounded-lg p-4 text-zinc-300 focus:border-accent focus:outline-none text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-500 mb-2 flex items-center gap-2">
                                <Languages className="w-4 h-4" />
                                Leírás (DE)
                            </label>
                            <textarea
                                name="descriptionDe"
                                defaultValue={event?.descriptionDe}
                                rows={4}
                                className="w-full bg-black border border-zinc-800 rounded-lg p-4 text-zinc-300 focus:border-accent focus:outline-none text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Státusz</label>
                        <select
                            name="status"
                            defaultValue={event?.status || 'DRAFT'}
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                        >
                            <option value="DRAFT">Vázlat (Draft)</option>
                            <option value="PUBLISHED">Publikus</option>
                            <option value="COMPLETED">Lezárult</option>
                            <option value="CANCELLED">Törölve</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Email Konfiguráció */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">Visszaigazoló Email Beállítások</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Egyedi Visszaigazoló Üzenet (Opcionális)</label>
                    <textarea
                        name="confirmationEmailText"
                        defaultValue={event?.confirmationEmailText}
                        rows={8}
                        className="w-full bg-black border border-zinc-800 rounded-lg p-4 text-white focus:border-accent focus:outline-none leading-relaxed font-mono text-sm"
                        placeholder="Ide írhatsz egyedi utasításokat, amelyek a visszaigazoló emailben a fizetési adatok után jelennek meg."
                    />
                    <div className="mt-2 text-xs text-zinc-500 space-y-1">
                        <p>ℹ️ Ez a szöveg hozzáadódik a standard visszaigazoló emailhez.</p>
                        <p>💡 Tipp: Használj sortöréseket a tagoláshoz.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/50">
                    <input
                        type="checkbox"
                        name="paymentReminderEnabled"
                        id="paymentReminderEnabled"
                        defaultChecked={event ? event.paymentReminderEnabled : true}
                        className="w-5 h-5 rounded border-zinc-800 bg-black text-accent focus:ring-accent"
                    />
                    <div>
                        <label htmlFor="paymentReminderEnabled" className="text-sm font-medium text-gray-300">Automatikus fizetési emlékeztető küldése</label>
                        <p className="text-xs text-zinc-500">Ha bekapcsolva van, a rendszer 3 nap nemfizetés után emlékeztetőt küld.</p>
                    </div>
                </div>
            </div>

            {/* Social Meta (Facebook) */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">Social Meta (Facebook)</h3>
                <div className="space-y-4">
                    <div className="space-y-4">
                        <ImageUpload
                            label="Megosztási Kép (OG Image)"
                            value={ogImage}
                            onChange={setOgImage}
                            description="Ajánlott méret: 1200x630px. WebP formátumba optimalizálva."
                        />
                        <input type="hidden" name="ogImage" value={ogImage} />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-400">Megosztási Leírás (OG Description)</label>
                            <button
                                type="button"
                                onClick={() => {
                                    // Get title and location from the form
                                    const titleInput = document.querySelector('[name="title"]') as HTMLInputElement;
                                    const locationInput = document.querySelector('[name="location"]') as HTMLInputElement;
                                    const ogDescTextarea = document.querySelector('[name="ogDescription"]') as HTMLTextAreaElement;

                                    if (titleInput && ogDescTextarea) {
                                        const title = titleInput.value.trim();
                                        const location = locationInput?.value.trim() || '';

                                        // Generate SEO-friendly description
                                        let autoText = '';
                                        if (title) {
                                            autoText = `${title}`;
                                            if (location) {
                                                autoText += ` - ${location}`;
                                            }
                                            autoText += ' | Futóverseny・Running Event・Laufevent | Nevezés online az RUNION platformon';
                                        }

                                        if (autoText) {
                                            // Limit to 160 characters for optimal SEO
                                            const finalText = autoText.substring(0, 157) + (autoText.length > 157 ? '...' : '');
                                            ogDescTextarea.value = finalText;
                                            // Trigger change event for React
                                            ogDescTextarea.dispatchEvent(new Event('input', { bubbles: true }));
                                        }
                                    }
                                }}
                                className="text-xs bg-accent/20 hover:bg-accent/30 text-accent px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                            >
                                <Globe className="w-3 h-3" />
                                Automatikus kitöltés
                            </button>
                        </div>
                        <textarea
                            name="ogDescription"
                            defaultValue={event?.ogDescription || ''}
                            rows={3}
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                            placeholder="Futóverseny・Running Event・Laufevent・Automated SEO Description"
                        />
                        <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-wider flex items-center gap-2">
                            <span>📱 Social Media Preview</span>
                            <span className="text-accent">•</span>
                            <span>🤖 AI-Friendly</span>
                            <span className="text-accent">•</span>
                            <span>🔍 SEO Optimized</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Infópakk Szekció */}
            <div className="space-y-6 pt-8 border-t-2 border-accent/20">
                <div className="flex items-center gap-3">
                    <Info className="w-8 h-8 text-accent" />
                    <h3 className="text-2xl font-black italic uppercase text-white">Infópakk Részletek</h3>
                </div>
                <p className="text-sm text-zinc-500">Itt adhatod meg az eseményhez tartozó technikai információkat, menetrendet és árakat.</p>

                {/* Fontos információ */}
                <div className="bg-zinc-800/20 p-6 rounded-2xl border border-zinc-800">
                    <label className="block text-sm font-bold text-accent mb-2 uppercase italic">Fontos Információ (Alert Box)</label>
                    <textarea
                        value={infopack.importantInfo}
                        onChange={(e) => setInfopack({ ...infopack, importantInfo: e.target.value })}
                        rows={3}
                        className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-accent focus:outline-none"
                        placeholder="pl. ‼️LESZ HELYSZÍNI NEVEZÉS‼️..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Helyszíni árak */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-accent" />
                                Helyszíni Nevezés
                            </h4>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const onSitePrices = [...(infopack.onSitePrices || []), { name: '', price: '' }];
                                    setInfopack({ ...infopack, onSitePrices });
                                }}
                                className="text-[10px] h-7 border-accent/50 text-accent hover:bg-accent hover:text-black"
                            >
                                + Új Ár
                            </Button>
                        </div>
                        {(infopack.onSitePrices || []).map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-2 items-center bg-black/40 p-3 rounded-xl border border-zinc-800 relative group">
                                <input
                                    value={item.name}
                                    onChange={(e) => {
                                        const onSitePrices = [...infopack.onSitePrices];
                                        onSitePrices[idx].name = e.target.value;
                                        setInfopack({ ...infopack, onSitePrices });
                                    }}
                                    placeholder="Futam"
                                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white focus:border-accent focus:outline-none text-xs"
                                />
                                <input
                                    value={item.price}
                                    onChange={(e) => {
                                        const onSitePrices = [...infopack.onSitePrices];
                                        onSitePrices[idx].price = e.target.value;
                                        setInfopack({ ...infopack, onSitePrices });
                                    }}
                                    placeholder="Ár"
                                    className="w-24 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-accent font-bold focus:border-accent focus:outline-none text-xs"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const onSitePrices = infopack.onSitePrices.filter((_: any, i: number) => i !== idx);
                                        setInfopack({ ...infopack, onSitePrices });
                                    }}
                                    className="p-1 text-zinc-500 hover:text-red-500"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Menetrend */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                <Clock className="w-4 h-4 text-accent" />
                                Menetrend
                            </h4>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const schedule = [...(infopack.schedule || []), { time: '', title: '', desc: '' }];
                                    setInfopack({ ...infopack, schedule });
                                }}
                                className="text-[10px] h-7 border-accent/50 text-accent hover:bg-accent hover:text-black"
                            >
                                + Új Rajt
                            </Button>
                        </div>
                        {(infopack.schedule || []).map((item: any, idx: number) => (
                            <div key={idx} className="bg-black/40 p-3 rounded-xl border border-zinc-800 relative group space-y-2">
                                <div className="flex gap-2">
                                    <input
                                        value={item.time}
                                        onChange={(e) => {
                                            const schedule = [...infopack.schedule];
                                            schedule[idx].time = e.target.value;
                                            setInfopack({ ...infopack, schedule });
                                        }}
                                        placeholder="09:00"
                                        className="w-16 bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-accent font-bold focus:border-accent focus:outline-none text-xs"
                                    />
                                    <input
                                        value={item.title}
                                        onChange={(e) => {
                                            const schedule = [...infopack.schedule];
                                            schedule[idx].title = e.target.value;
                                            setInfopack({ ...infopack, schedule });
                                        }}
                                        placeholder="Cím"
                                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-white font-bold focus:border-accent focus:outline-none text-xs uppercase"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const schedule = infopack.schedule.filter((_: any, i: number) => i !== idx);
                                            setInfopack({ ...infopack, schedule });
                                        }}
                                        className="p-1 text-zinc-500 hover:text-red-500"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                                <input
                                    value={item.desc}
                                    onChange={(e) => {
                                        const schedule = [...infopack.schedule];
                                        schedule[idx].desc = e.target.value;
                                        setInfopack({ ...infopack, schedule });
                                    }}
                                    placeholder="Megjegyzés"
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-1.5 text-zinc-400 focus:border-accent focus:outline-none text-[10px]"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pálya és Távok */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <MapIcon className="w-4 h-4 text-accent" />
                            Pálya és Távok
                        </h4>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const distances = [...(infopack.distances || []), { name: '', detail: '' }];
                                setInfopack({ ...infopack, distances });
                            }}
                            className="text-[10px] h-7 border-accent/50 text-accent hover:bg-accent hover:text-black"
                        >
                            + Új Táv
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(infopack.distances || []).map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-2 items-center bg-black/40 p-3 rounded-xl border border-zinc-800">
                                <input
                                    value={item.name}
                                    onChange={(e) => {
                                        const distances = [...infopack.distances];
                                        distances[idx].name = e.target.value;
                                        setInfopack({ ...infopack, distances });
                                    }}
                                    placeholder="Táv megnevezése"
                                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white focus:border-accent focus:outline-none text-xs font-bold"
                                />
                                <input
                                    value={item.detail}
                                    onChange={(e) => {
                                        const distances = [...infopack.distances];
                                        distances[idx].detail = e.target.value;
                                        setInfopack({ ...infopack, distances });
                                    }}
                                    placeholder="Részlet (pl. 14 kör)"
                                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-zinc-400 focus:border-accent focus:outline-none text-xs"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const distances = infopack.distances.filter((_: any, i: number) => i !== idx);
                                        setInfopack({ ...infopack, distances });
                                    }}
                                    className="p-1 text-zinc-500 hover:text-red-500"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mit tartalmaz a díj? */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <Gift className="w-4 h-4 text-accent" />
                            Mit tartalmaz a nevezési díj?
                        </h4>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const included = [...(infopack.included || []), { text: '', icon: 'Heart' }];
                                setInfopack({ ...infopack, included });
                            }}
                            className="text-[10px] h-7 border-accent/50 text-accent hover:bg-accent hover:text-black"
                        >
                            + Új Elem
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(infopack.included || []).map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-2 items-center bg-black/40 p-3 rounded-xl border border-zinc-800">
                                <select
                                    value={item.icon}
                                    onChange={(e) => {
                                        const included = [...infopack.included];
                                        included[idx].icon = e.target.value;
                                        setInfopack({ ...infopack, included });
                                    }}
                                    className="bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-accent text-xs"
                                >
                                    <option value="Timer">Mérő</option>
                                    <option value="Gift">Ajándék</option>
                                    <option value="Heart">Szív</option>
                                    <option value="Coffee">Kávé</option>
                                    <option value="Utensils">Étel</option>
                                    <option value="Camera">Kamera</option>
                                    <option value="ArrowRight">Nyíl</option>
                                </select>
                                <input
                                    value={item.text}
                                    onChange={(e) => {
                                        const included = [...infopack.included];
                                        included[idx].text = e.target.value;
                                        setInfopack({ ...infopack, included });
                                    }}
                                    placeholder="Elem neve"
                                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white focus:border-accent focus:outline-none text-xs"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const included = infopack.included.filter((_: any, i: number) => i !== idx);
                                        setInfopack({ ...infopack, included });
                                    }}
                                    className="p-1 text-zinc-500 hover:text-red-500"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Meglepetésfutam */}
                <div className="bg-red-500/5 p-6 rounded-2xl border border-red-500/20 space-y-4">
                    <h4 className="text-sm font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Meglepetésfutam Szekció
                    </h4>
                    <div className="space-y-3">
                        <input
                            value={infopack.surpriseRun?.title}
                            onChange={(e) => setInfopack({ ...infopack, surpriseRun: { ...infopack.surpriseRun, title: e.target.value } })}
                            placeholder="Cím (pl. Meglepetésfutam 14:30-kor!)"
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none text-sm font-bold"
                        />
                        <textarea
                            value={infopack.surpriseRun?.description}
                            onChange={(e) => setInfopack({ ...infopack, surpriseRun: { ...infopack.surpriseRun, description: e.target.value } })}
                            rows={3}
                            placeholder="Leírás"
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-zinc-400 focus:border-red-500 focus:outline-none text-sm"
                        />
                        <input
                            value={infopack.surpriseRun?.prize}
                            onChange={(e) => setInfopack({ ...infopack, surpriseRun: { ...infopack.surpriseRun, prize: e.target.value } })}
                            placeholder="Nyeremény szöveg"
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-red-400 focus:border-red-500 focus:outline-none text-xs italic"
                        />
                    </div>
                </div>

                {/* Versenyszámok részletei és Rajtlisták */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <Rocket className="w-4 h-4 text-accent" />
                            Versenyszámok Leírása és Rajtlisták
                        </h4>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const raceCategories = [...(infopack.raceCategories || []), { title: '', description: '', startList: '' }];
                                setInfopack({ ...infopack, raceCategories });
                            }}
                            className="text-[10px] h-7 border-accent/50 text-accent hover:bg-accent hover:text-black"
                        >
                            + Új Kategória
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {(infopack.raceCategories || []).map((cat: any, idx: number) => (
                            <div key={idx} className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800 space-y-4 relative group">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const raceCategories = infopack.raceCategories.filter((_: any, i: number) => i !== idx);
                                        setInfopack({ ...infopack, raceCategories });
                                    }}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-lg"
                                >
                                    ×
                                </button>
                                <input
                                    value={cat.title}
                                    onChange={(e) => {
                                        const raceCategories = [...infopack.raceCategories];
                                        raceCategories[idx].title = e.target.value;
                                        setInfopack({ ...infopack, raceCategories });
                                    }}
                                    placeholder="Versenyszám neve (pl. Szerelmes páros - Együtt futunk)"
                                    className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-accent font-black italic uppercase tracking-tighter text-base focus:border-accent focus:outline-none"
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Leírás / Részletek</Label>
                                        <textarea
                                            value={cat.description}
                                            onChange={(e) => {
                                                const raceCategories = [...infopack.raceCategories];
                                                raceCategories[idx].description = e.target.value;
                                                setInfopack({ ...infopack, raceCategories });
                                            }}
                                            rows={4}
                                            placeholder="Miről szól ez a futam? Hány kör? Frissítés?"
                                            className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-zinc-300 text-sm focus:border-accent focus:outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Rajtlista (Opcionális)</Label>
                                        <textarea
                                            value={cat.startList}
                                            onChange={(e) => {
                                                const raceCategories = [...infopack.raceCategories];
                                                raceCategories[idx].startList = e.target.value;
                                                setInfopack({ ...infopack, raceCategories });
                                            }}
                                            rows={4}
                                            placeholder="Ide másolhatod a rajtlistát..."
                                            className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-zinc-500 text-sm font-mono focus:border-accent focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Kiállítók */}
                <div className="space-y-4">
                    <Label className="text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-accent" /> Kiállítók a Versenyközpontban
                    </Label>
                    <textarea
                        value={infopack.exhibitors}
                        onChange={(e) => setInfopack({ ...infopack, exhibitors: e.target.value })}
                        rows={3}
                        placeholder="pl. HAMMER NUTRITION, SCHILLER, BEMER..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:border-accent focus:outline-none text-sm"
                    />
                </div>

                {/* Tudnivalók */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <Info className="w-4 h-4 text-accent" />
                            Praktikus Tudnivalók
                        </h4>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const practicalInfo = [...(infopack.practicalInfo || []), { category: '', detail: '', icon: 'Info' }];
                                setInfopack({ ...infopack, practicalInfo });
                            }}
                            className="text-[10px] h-7 border-accent/50 text-accent hover:bg-accent hover:text-black"
                        >
                            + Új Infó
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {(infopack.practicalInfo || []).map((item: any, idx: number) => (
                            <div key={idx} className="bg-black/40 p-4 rounded-xl border border-zinc-800 relative group space-y-3">
                                <div className="flex gap-4">
                                    <select
                                        value={item.icon}
                                        onChange={(e) => {
                                            const practicalInfo = [...infopack.practicalInfo];
                                            practicalInfo[idx].icon = e.target.value;
                                            setInfopack({ ...infopack, practicalInfo });
                                        }}
                                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-accent text-xs"
                                    >
                                        <option value="Info">Info</option>
                                        <option value="Car">Parkolás</option>
                                        <option value="Users">Helyszín</option>
                                        <option value="Banknote">Fizetés</option>
                                    </select>
                                    <input
                                        value={item.category}
                                        onChange={(e) => {
                                            const practicalInfo = [...infopack.practicalInfo];
                                            practicalInfo[idx].category = e.target.value;
                                            setInfopack({ ...infopack, practicalInfo });
                                        }}
                                        placeholder="Kategória"
                                        className="w-48 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-accent font-bold focus:border-accent focus:outline-none text-xs"
                                    />
                                    <input
                                        value={item.detail}
                                        onChange={(e) => {
                                            const practicalInfo = [...infopack.practicalInfo];
                                            practicalInfo[idx].detail = e.target.value;
                                            setInfopack({ ...infopack, practicalInfo });
                                        }}
                                        placeholder="Részletek"
                                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-white focus:border-accent focus:outline-none text-xs"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const practicalInfo = infopack.practicalInfo.filter((_: any, i: number) => i !== idx);
                                            setInfopack({ ...infopack, practicalInfo });
                                        }}
                                        className="p-2 text-zinc-500 hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* GPS Tracks */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label className="text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2">
                            <MapIcon className="w-4 h-4 text-accent" /> GPS Track-ek (AllTrails, Strava, stb.)
                        </Label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setInfopack({ ...infopack, gpsTracks: [...(infopack.gpsTracks || []), { name: '', url: '' }] })}
                            className="text-xs border-zinc-700 bg-zinc-800/50"
                        >
                            Hozzáadás
                        </Button>
                    </div>
                    {infopack.gpsTracks?.map((item: any, idx: number) => (
                        <div key={idx} className="bg-black/40 p-4 rounded-xl border border-zinc-800 space-y-3 relative group">
                            <button
                                type="button"
                                onClick={() => {
                                    const newList = [...infopack.gpsTracks];
                                    newList.splice(idx, 1);
                                    setInfopack({ ...infopack, gpsTracks: newList });
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                            >
                                ×
                            </button>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    placeholder="Név (pl. STRAVA)"
                                    value={item.name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const newList = [...infopack.gpsTracks];
                                        newList[idx].name = e.target.value;
                                        setInfopack({ ...infopack, gpsTracks: newList });
                                    }}
                                    className="bg-zinc-900 border-zinc-800"
                                />
                                <Input
                                    placeholder="URL"
                                    value={item.url}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const newList = [...infopack.gpsTracks];
                                        newList[idx].url = e.target.value;
                                        setInfopack({ ...infopack, gpsTracks: newList });
                                    }}
                                    className="bg-zinc-900 border-zinc-800"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label className="text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2">
                            <Facebook className="w-4 h-4 text-accent" /> Közösségi Linkek (Facebook, Esemény, stb.)
                        </Label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setInfopack({ ...infopack, socialLinks: [...(infopack.socialLinks || []), { name: '', url: '' }] })}
                            className="text-xs border-zinc-700 bg-zinc-800/50"
                        >
                            Hozzáadás
                        </Button>
                    </div>
                    {infopack.socialLinks?.map((item: any, idx: number) => (
                        <div key={idx} className="bg-black/40 p-4 rounded-xl border border-zinc-800 space-y-3 relative group">
                            <button
                                type="button"
                                onClick={() => {
                                    const newList = [...infopack.socialLinks];
                                    newList.splice(idx, 1);
                                    setInfopack({ ...infopack, socialLinks: newList });
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                            >
                                ×
                            </button>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    placeholder="Név (pl. Facebook Esemény)"
                                    value={item.name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const newList = [...infopack.socialLinks];
                                        newList[idx].name = e.target.value;
                                        setInfopack({ ...infopack, socialLinks: newList });
                                    }}
                                    className="bg-zinc-900 border-zinc-800"
                                />
                                <Input
                                    placeholder="URL"
                                    value={item.url}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const newList = [...infopack.socialLinks];
                                        newList[idx].url = e.target.value;
                                        setInfopack({ ...infopack, socialLinks: newList });
                                    }}
                                    className="bg-zinc-900 border-zinc-800"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Details */}
                <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 space-y-6 mt-8">
                    <h3 className="text-xl font-black italic uppercase flex items-center gap-3">
                        <div className="w-2 h-8 bg-accent rounded-full" />
                        Lábléc Információk
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <Label className="text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2">
                                <Mic className="w-4 h-4 text-accent" /> Szpíkerek
                            </Label>
                            <Input
                                placeholder="pl. Marton Zsolt Mazsi, Kaiser Tomi"
                                value={infopack.footerSpeakers}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInfopack({ ...infopack, footerSpeakers: e.target.value })}
                                className="bg-zinc-900 border-zinc-800"
                            />
                        </div>
                        <div className="space-y-4">
                            <Label className="text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2">
                                <Camera className="w-4 h-4 text-accent" /> Fotósok
                            </Label>
                            <Input
                                placeholder="pl. Pápai Henrietta, Poelz Anita"
                                value={infopack.footerPhotographers}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInfopack({ ...infopack, footerPhotographers: e.target.value })}
                                className="bg-zinc-900 border-zinc-800"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2">
                            <Users className="w-4 h-4 text-accent" /> Rendezők (Lábléc szöveg)
                        </Label>
                        <Input
                            placeholder="pl. Balatonfüredi Atlétikai Club, BakonyOrszág..."
                            value={infopack.footerOrganizers}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInfopack({ ...infopack, footerOrganizers: e.target.value })}
                            className="bg-zinc-900 border-zinc-800"
                        />
                    </div>
                </div>

                <input type="hidden" name="infopack" value={JSON.stringify(infopack)} />
            </div>

            {(state as any)?.message && (
                <div className={`p-4 rounded-xl border ${(state as any).type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}>
                    {(state as any).message}
                </div>
            )}

            <div className="flex justify-end gap-4 pt-6 border-t border-zinc-800">
                <Button type="submit" size="lg" className="w-full md:w-auto font-black uppercase italic tracking-tighter">
                    {event ? 'Változtatások Mentése' : 'Esemény Létrehozása'}
                </Button>
            </div>
        </form>
    );
}
