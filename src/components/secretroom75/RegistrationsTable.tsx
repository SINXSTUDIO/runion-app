'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Download, Upload, Loader2, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { importRegistrationPayments, deleteRegistration } from '@/actions/registrations';
import { useRouter } from 'next/navigation';

interface Registration {
    id: string;
    createdAt: Date;
    registrationStatus: string;
    paymentStatus: string;
    paymentMethod: string;
    finalPrice: number | null;
    distance: { name: string; price: number };
    user: {
        firstName: string | null;
        lastName: string | null;
        email: string;
        clubName: string | null;
        phoneNumber: string | null;
        birthDate: Date | null;
        gender: string | null;
        tshirtSize: string | null;
    };
    formData: any;
}

interface RegistrationsTableProps {
    registrations: Registration[];
    eventTitle: string;
    formConfig?: any[]; // FormConfig fields to dynamically export
}

export default function RegistrationsTable({ registrations, eventTitle, formConfig = [] }: RegistrationsTableProps) {
    const router = useRouter();
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        // Known keys to exclude from dynamic fields (because they are handled explicitly)
        const ignoredKeys = new Set(['billingDetails', 'termsAccepted', 'privacyAccepted', 'comment', 'website', 'website_field', 'tshirtSize']);

        // Extract all unique form field keys from registrations
        const dynamicFieldKeys = new Set<string>();
        registrations.forEach(reg => {
            const formData = reg.formData || {};
            if (formData && typeof formData === 'object') {
                Object.keys(formData).forEach(key => {
                    if (!ignoredKeys.has(key)) {
                        dynamicFieldKeys.add(key);
                    }
                });
            }
        });

        // Build dynamic headers from formConfig if available
        const dynamicHeaders = Array.from(dynamicFieldKeys).map(key => {
            const configField = formConfig.find(f => f.id === key);
            return configField?.label || key;
        });

        // Generate CSV with fixed + dynamic columns
        const headers = [
            'ID',
            'Vezetéknév',
            'Keresztnév',
            'Email',
            'Telefon',
            'Szül. dátum',
            'Nem',
            'Egyesület',
            'Póló méret',
            'Táv',
            'Végösszeg',
            'Fizetési Státusz',
            'Fizetés módja',
            'Reg. dátuma',
            // Billing Data
            'Számlázási Név',
            'Számlázási Irányítószám',
            'Számlázási Város',
            'Számlázási Utca, hsz.',
            'Adószám',
            // Legal
            'ÁSZF',
            'Adatvédelmi',
            // Extra
            'Megjegyzés',
            // Dynamic
            ...dynamicHeaders
        ];

        const rows = registrations.map(reg => {
            const formData = reg.formData || {};
            const billing = formData.billingDetails || {};

            const formatDate = (d: Date | null | undefined) => {
                if (!d) return '';
                try {
                    return new Date(d).toISOString().split('T')[0];
                } catch { return ''; }
            };

            const translateGender = (g: string | null) => {
                if (g === 'MALE') return 'Férfi';
                if (g === 'FEMALE') return 'Nő';
                return g || '';
            };

            const formatBool = (b: any) => (b === true || b === 'true') ? 'Igen' : 'Nem';

            const dynamicValues = Array.from(dynamicFieldKeys).map(key => {
                const value = formData[key];
                if (value === null || value === undefined) return '';
                if (typeof value === 'object') return JSON.stringify(value);
                return `"${String(value).replace(/"/g, '""')}"`;
            });

            return [
                reg.id,
                reg.user.lastName || '',
                reg.user.firstName || '',
                reg.user.email,
                reg.user.phoneNumber || '',
                formatDate(reg.user.birthDate),
                translateGender(reg.user.gender),
                reg.user.clubName || '',
                reg.user.tshirtSize || formData.tshirtSize || '',
                reg.distance.name,
                reg.finalPrice || reg.distance.price,
                reg.paymentStatus,
                reg.paymentMethod,
                formatDate(reg.createdAt),
                // Billing
                billing.name || '',
                billing.zip || '',
                billing.city || '',
                billing.address || '',
                billing.taxNumber || '',
                // Legal - Default to true (Igen) if undefined, as acceptance is mandatory for registration
                formatBool(formData.termsAccepted !== false),
                formatBool(formData.privacyAccepted !== false),
                // Extra
                formData.comment || '',
                // Dynamic
                ...dynamicValues
            ].map(cell => {
                if (cell === null || cell === undefined) return '';
                return `"${String(cell).replace(/"/g, '""')}"`;
            });
        });

        const csvContent = '\uFEFF' + [
            headers.join(';'),
            ...rows.map(row => row.join(';'))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const dateStr = new Date().toISOString().split('T')[0];
        const safeTitle = eventTitle.replace(/[^a-z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ]/gi, '_').replace(/_+/g, '_');
        link.setAttribute('download', `${safeTitle}_${dateStr}.csv`);

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setImportResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await importRegistrationPayments(formData);
            setImportResult(result);
            if (result.success) {
                router.refresh();
            }
        } catch (error) {
            setImportResult({ success: false, message: 'Hiba történt a fájl feldolgozása közben.' });
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div>
            <div className="flex justify-end gap-3 mb-4">
                <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                <Button
                    variant="outline"
                    className="gap-2 bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
                    onClick={handleImportClick}
                    disabled={isImporting}
                >
                    {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    CSV Importálás (Fizetések)
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleExport}>
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>
            </div>

            {importResult && (
                <div className={`p-4 rounded-xl mb-4 flex items-center gap-3 ${importResult.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {importResult.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p>{importResult.message}</p>
                </div>
            )}

            <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 uppercase text-xs text-gray-500 font-bold">
                            <tr>
                                <th className="p-4">Nevező</th>
                                <th className="p-4">Táv</th>
                                <th className="p-4">Dátum</th>
                                <th className="p-4">Státusz</th>
                                <th className="p-4">Fizetés</th>
                                <th className="p-4">Műveletek</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {registrations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-zinc-500 italic">
                                        Még nincsenek nevezések erre a versenyre.
                                    </td>
                                </tr>
                            ) : (
                                registrations.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-white">{reg.user.lastName} {reg.user.firstName}</div>
                                            <div className="text-xs text-gray-500">{reg.user.email}</div>
                                            {(reg.user.clubName) && <div className="text-xs text-accent mt-0.5">{reg.user.clubName}</div>}
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-white/10 px-2 py-1 rounded text-xs font-bold text-white">
                                                {reg.distance.name}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-400">
                                            {new Date(reg.createdAt).toLocaleDateString('hu-HU')}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${reg.registrationStatus === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' :
                                                reg.registrationStatus === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                                                    reg.registrationStatus === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-zinc-500/20 text-zinc-400'
                                                }`}>
                                                {reg.registrationStatus}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${reg.paymentStatus === 'PAID' ? 'bg-green-500/20 text-green-400' :
                                                reg.paymentStatus === 'UNPAID' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {reg.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                                                    Részletek
                                                </Button>
                                                <form action={async () => {
                                                    if (confirm('Biztosan törölni szeretnéd ezt a nevezést? Ez a művelet nem visszavonható!')) {
                                                        const result = await deleteRegistration(reg.id);
                                                        if (!result.success) alert(result.message);
                                                    }
                                                }}>
                                                    <Button variant="ghost" size="sm" type="submit" className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
