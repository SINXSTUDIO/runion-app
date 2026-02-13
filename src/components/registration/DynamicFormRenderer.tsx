'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { FormField } from '@/lib/types/form';

interface DynamicFormRendererProps {
    fields: FormField[];
    values: Record<string, any>;
    onChange: (id: string, value: any) => void;
    errors: Record<string, string>;
    userGender?: string | null; // Optional prop to assist with autofill
}

export default function DynamicFormRenderer({ fields, values, onChange, errors, userGender }: DynamicFormRendererProps) {
    const t = useTranslations('Registration.form');

    if (!fields || fields.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            {fields.map((field) => {
                const tKey = field.id; // Usually we would translate label but here we use config label
                // Unless the ID matches known standard fields, then we can override label or use translated
                // But for dynamic form, we mostly rely on FormConfig labels.

                // However, for standard registration fields, we might want to localize if the label matches key
                // Or simply display what is in config.

                // Let's implement a heuristic: if ID is a standard key, use translation. 
                // BUT the config comes from DB/Admin, where admin typed the label. So we should prefer Config Label.
                // Except for 'placeholder' which might be empty in config?

                return (
                    <div key={field.id} className="space-y-2">
                        <label className="block text-sm font-medium text-zinc-400">
                            {field.label} {field.required && <span className="text-accent">*</span>}
                        </label>

                        {field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'number' || field.type === 'zip' ? (
                            <input
                                type={field.type === 'zip' ? 'text' : field.type}
                                value={values[field.id] || ''}
                                onChange={(e) => onChange(field.id, e.target.value)}
                                className={`w-full bg-zinc-900 border ${errors[field.id] ? 'border-red-500' : 'border-zinc-700'} rounded-lg px-4 py-3 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors`}
                                placeholder={field.placeholder}
                            />
                        ) : field.type === 'textarea' ? (
                            <textarea
                                value={values[field.id] || ''}
                                onChange={(e) => onChange(field.id, e.target.value)}
                                className={`w-full bg-zinc-900 border ${errors[field.id] ? 'border-red-500' : 'border-zinc-700'} rounded-lg px-4 py-3 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors min-h-[100px]`}
                                placeholder={field.placeholder}
                            />
                        ) : (field.type === 'select' || field.type === 'gender') ? (
                            <GenderSelectWrapper
                                field={field}
                                value={values[field.id]}
                                onChange={(val) => onChange(field.id, val)}
                                error={errors[field.id]}
                                tKey={field.type === 'gender' ? 'gender' : tKey}
                                userGender={userGender}
                            />
                        ) : field.type === 'checkbox' ? (
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={values[field.id] || false}
                                    onChange={(e) => onChange(field.id, e.target.checked)}
                                    className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-accent focus:ring-accent"
                                />
                                <span className="text-zinc-300">{field.options?.[0] || 'Igen'}</span>
                            </label>
                        ) : field.type === 'date' ? (
                            <input
                                type="date"
                                value={values[field.id] || ''}
                                onChange={(e) => onChange(field.id, e.target.value)}
                                className={`w-full bg-zinc-900 border ${errors[field.id] ? 'border-red-500' : 'border-zinc-700'} rounded-lg px-4 py-3 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors calendar-picker-indicator-white`}
                            />
                        ) : field.type === 'radio' ? (
                            <div className="space-y-2">
                                {field.options?.map((opt, idx) => (
                                    <label key={idx} className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={field.id}
                                            checked={values[field.id] === opt}
                                            onChange={() => onChange(field.id, opt)}
                                            className="w-4 h-4 text-accent bg-zinc-800 border-zinc-600 focus:ring-accent"
                                        />
                                        <span className="text-zinc-300">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        ) : null}

                        {errors[field.id] && (
                            <p className="text-sm text-red-500">{errors[field.id]}</p>
                        )}
                    </div>
                );
            })}
        </div >
    );
}

// Helper component to handle specific select logic (like gender autofill)
function GenderSelectWrapper({ field, value, onChange, error, tKey, userGender }: {
    field: FormField;
    value: string;
    onChange: (val: string) => void;
    error?: string;
    tKey: string;
    userGender?: string | null;
}) {
    // Determine effective options: use field options if present, otherwise default for gender
    const effectiveOptions = React.useMemo(() => {
        if (field.options && field.options.length > 0) return field.options;
        if (tKey === 'gender') return ['Férfi', 'Nő'];
        return [];
    }, [field.options, tKey]);

    // Run autofill effect once on mount if value is empty and it's a gender field
    React.useEffect(() => {
        console.log('Checking gender autofill:', { value, tKey, userGender, effectiveOptions });
        if ((!value || value === '') && tKey === 'gender' && userGender && effectiveOptions.length > 0) {
            const lowerUserGender = userGender.toLowerCase();
            const maleKeywords = ['férfi', 'ferfi', 'male', 'man', 'fiú', 'm'];
            const femaleKeywords = ['nő', 'no', 'female', 'woman', 'lány', 'f'];

            let targetKeywords: string[] = [];
            if (maleKeywords.includes(lowerUserGender)) targetKeywords = ['Férfi', 'férfi', 'Male'];
            else if (femaleKeywords.includes(lowerUserGender)) targetKeywords = ['Nő', 'nő', 'Female'];

            console.log('Target keywords:', targetKeywords);

            // Find the option that matches
            const match = effectiveOptions.find(opt => {
                const optLower = opt.toLowerCase();
                // Check against specific target keywords first (priority)
                if (targetKeywords.length > 0) {
                    return targetKeywords.some(k => optLower.includes(k.toLowerCase())) ||
                        (lowerUserGender === 'male' && optLower.includes('férfi')) ||
                        (lowerUserGender === 'female' && optLower.includes('nő'));
                }
                return false;
            });

            console.log('Match found:', match);

            if (match) {
                onChange(match);
            }
        }
    }, [value, tKey, userGender, effectiveOptions]); // userGender is stable, onChange is stable

    return (
        <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full bg-zinc-900 border ${error ? 'border-red-500' : 'border-zinc-700'} rounded-lg px-4 py-3 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors appearance-none`}
        >
            <option value="">Válassz...</option>
            {effectiveOptions.map((opt, idx) => (
                <option key={idx} value={opt}>{opt}</option>
            ))}
        </select>
    );
}
