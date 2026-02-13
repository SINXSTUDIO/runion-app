'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormField, FormFieldType } from '@/lib/types/form';
import { Button } from '@/components/ui/Button';
import { GripVertical, Trash2, Plus, Save, Check, ArrowLeft } from 'lucide-react';
import { updateEventFormConfig } from '@/actions/events';
import { Link } from '@/i18n/routing';

// Sortable Item Component
function SortableItem(props: { id: string; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="mb-4">
            <div className="flex items-start gap-4 bg-zinc-900 border border-zinc-700 p-4 rounded-xl shadow-sm">
                <button {...listeners} className="mt-4 cursor-grab active:cursor-grabbing text-zinc-500 hover:text-white">
                    <GripVertical className="w-6 h-6" />
                </button>
                {props.children}
            </div>
        </div>
    );
}

interface FormBuilderProps {
    eventId: string;
    initialConfig?: FormField[];
}

import { useTranslations } from 'next-intl';

export default function FormBuilder({ eventId, initialConfig = [] }: FormBuilderProps) {
    const t = useTranslations('FormBuilder');
    const [fields, setFields] = useState<FormField[]>(initialConfig);
    const [saving, setSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setFields((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over?.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }

    const addField = () => {
        const newField: FormField = {
            id: `field_${Date.now()}`,
            type: 'text',
            label: t('defaultLabel'),
            required: false,
            options: []
        };
        setFields([...fields, newField]);
    };

    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const saveForm = async () => {
        setSaving(true);
        try {
            await updateEventFormConfig(eventId, { fields });
            toast.success(t('saved'));
        } catch (error) {
            console.error('Failed to save form:', error);
            toast.error('Error saving form');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-black min-h-screen text-white">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <Link href={`/secretroom75/events/${eventId}/edit`} className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h2 className="text-2xl font-bold font-heading uppercase text-accent">{t('title')}</h2>
                </div>
                <Button onClick={saveForm} disabled={saving} className="bg-accent text-black hover:bg-accent/80 font-bold px-8">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? t('saving') : t('save')}
                </Button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                    {fields.map((field) => (
                        <SortableItem key={field.id} id={field.id}>
                            <div className="flex-1 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Label & Type */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-500 uppercase font-bold">{t('field.label')}</label>
                                        <input
                                            value={field.label}
                                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                                            className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-xl text-white focus:outline-none focus:border-accent"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-500 uppercase font-bold">{t('field.type')}</label>
                                        <select
                                            value={field.type}
                                            onChange={(e) => updateField(field.id, { type: e.target.value as FormFieldType })}
                                            className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-xl text-white focus:outline-none focus:border-accent"
                                        >
                                            <option value="text">{t('types.text')}</option>
                                            <option value="email">{t('types.email')}</option>
                                            <option value="tel">{t('types.tel')}</option>
                                            <option value="zip">{t('types.zip')}</option>
                                            <option value="number">{t('types.number')}</option>
                                            <option value="date">{t('types.date')}</option>
                                            <option value="checkbox">{t('types.checkbox')}</option>
                                            <option value="select">{t('types.select')}</option>
                                            <option value="gender">{t('types.gender')}</option>
                                            <option value="radio">{t('types.radio')}</option>
                                            <option value="textarea">{t('types.textarea')}</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Options (only for select/radio) */}
                                {(field.type === 'select' || field.type === 'radio') && (
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-500 uppercase font-bold">{t('field.options')}</label>
                                        <input
                                            placeholder={t('field.optionsPlaceholder')}
                                            value={field.options?.join(', ') || ''}
                                            onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                                            className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-xl text-sm text-zinc-300 focus:outline-none focus:border-accent font-mono"
                                        />
                                    </div>
                                )}

                                {/* Settings (Required, Description) */}
                                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${field.required ? 'bg-accent border-accent text-black' : 'border-zinc-700 bg-transparent'}`}>
                                            {field.required && <Check className="w-3.5 h-3.5" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={field.required}
                                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                        />
                                        <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">{t('field.required')}</span>
                                    </label>

                                    <button onClick={() => removeField(field.id)} className="text-zinc-500 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </SortableItem>
                    ))}
                </SortableContext>
            </DndContext>

            <Button onClick={addField} variant="outline" className="w-full py-8 border-dashed border-2 border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:text-white hover:border-accent hover:bg-zinc-900/50 transition-all rounded-2xl group">
                <Plus className="w-6 h-6 mr-2 transition-transform group-hover:scale-110" />
                <span className="text-lg font-bold">{t('newField')}</span>
            </Button>
        </div>
    );
}
