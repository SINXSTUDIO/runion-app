'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { deleteFeature, updateFeatureOrder, duplicateFeature } from '@/actions/features';
import FeatureForm from '@/components/secretroom75/FeatureForm';
import { Plus, Trash2, Edit2, Copy, GripVertical, LayoutGrid } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableFeatureItemProps {
    feature: any;
    onEdit: (f: any) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    renderIcon: (name: string) => React.ReactNode;
}

function SortableFeatureItem({ feature, onEdit, onDelete, onDuplicate, renderIcon }: SortableFeatureItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: feature.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
        position: 'relative' as const,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-zinc-900 border ${feature.active ? 'border-zinc-800' : 'border-red-900/30 opacity-80'} p-6 rounded-2xl relative group transition-all hover:border-zinc-700 ${isDragging ? "opacity-50 border-accent scale-[1.02]" : ""}`}
        >
            {!feature.active && (
                <div className="absolute top-4 right-16 px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase rounded border border-red-500/20">
                    Inaktív
                </div>
            )}

            <div className="flex items-start gap-4 mb-4">
                <div
                    className="p-3 bg-black rounded-xl cursor-grab active:cursor-grabbing hover:bg-zinc-800 transition-colors"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="w-6 h-6 text-zinc-600 mb-1 mx-auto" />
                    {renderIcon(feature.iconName)}
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-white line-clamp-1">{feature.title}</h3>
                    <p className="text-zinc-500 text-sm line-clamp-2 mt-1">{feature.description}</p>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                    Sorrend: {feature.order}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onDuplicate(feature.id)}
                        className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Duplikálás"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onEdit(feature)}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Szerkesztés"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(feature.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Törlés"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function FeatureListClient({ initialFeatures }: { initialFeatures: any[] }) {
    const [features, setFeatures] = useState(initialFeatures);
    const [editingFeature, setEditingFeature] = useState<any>(null);
    const [isAdding, setIsAdding] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setFeatures((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                const updates = newItems.map((item, index) => item.id); // Optimized action takes array of IDs

                // Optimistically update
                const updatedItems = newItems.map((item, index) => ({ ...item, order: index }));

                // Send update to server (assuming feature orders are 0-based index or just sequential)
                updateFeatureOrder(updates);

                return updatedItems;
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Biztosan törölni szeretnéd ezt a jellemzőt?')) {
            const result = await deleteFeature(id);
            if (result.success) {
                setFeatures(features.filter(f => f.id !== id));
            }
        }
    };

    const handleDuplicate = async (id: string) => {
        // Optimistic UI update could be tricky for creation logic, so just wait for server
        if (window.confirm('Biztosan duplikálni szeretnéd ezt a jellemzőt?')) {
            const result = await duplicateFeature(id);
            if (result.success) {
                window.location.reload();
            }
        }
    };

    // Helper to render icon by name
    const renderIcon = (iconName: string) => {
        const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
        return <IconComponent className="w-8 h-8 text-accent" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 font-black uppercase italic tracking-tighter"
                >
                    <Plus className="w-5 h-5" />
                    Új Feature Hozzáadása
                </Button>
            </div>

            {(isAdding || editingFeature) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <FeatureForm
                        feature={editingFeature}
                        onClose={() => {
                            setIsAdding(false);
                            setEditingFeature(null);
                            window.location.reload();
                        }}
                    />
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
                            <LayoutGrid className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                            <p className="text-zinc-500 italic">Még nincsenek jellemzők hozzáadva.</p>
                        </div>
                    ) : (
                        <SortableContext
                            items={features.map(f => f.id)}
                            strategy={verticalListSortingStrategy} // Or rectSortingStrategy if grid
                        >
                            {features.map((feature) => (
                                <SortableFeatureItem
                                    key={feature.id}
                                    feature={feature}
                                    onEdit={setEditingFeature}
                                    onDelete={handleDelete}
                                    onDuplicate={handleDuplicate}
                                    renderIcon={renderIcon}
                                />
                            ))}
                        </SortableContext>
                    )}
                </div>
            </DndContext>
        </div>
    );
}
