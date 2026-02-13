'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { deleteSponsor, updateSponsorOrder, duplicateSponsor } from '@/actions/sponsors';
import SponsorForm from '@/components/secretroom75/SponsorForm';
import { Plus, Trash2, Edit2, GripVertical, Copy, Handshake } from 'lucide-react';
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

interface SortableSponsorItemProps {
    sponsor: any;
    onEdit: (s: any) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
}

function SortableSponsorItem({ sponsor, onEdit, onDelete, onDuplicate }: SortableSponsorItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: sponsor.id });

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
            className={`bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl flex items-center justify-between group hover:border-accent/30 transition-all duration-300 ${isDragging ? "opacity-50 border-accent scale-[1.02]" : ""}`}
        >
            <div className="flex items-center gap-6">
                <div
                    className="text-zinc-700 cursor-grab active:cursor-grabbing hover:text-white transition-colors p-2 -ml-2 rounded-lg hover:bg-zinc-800"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="w-5 h-5" />
                </div>
                <div className="w-24 h-16 bg-white rounded-lg flex items-center justify-center p-2 relative overflow-hidden shadow-inner">
                    <img
                        src={sponsor.logoUrl}
                        alt={sponsor.name}
                        className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                    {!sponsor.active && (
                        <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="bg-red-600 text-[8px] text-white px-2 py-0.5 rounded-full font-black uppercase">Inaktív</span>
                        </div>
                    )}
                </div>
                <div>
                    <h4 className="text-lg font-bold text-white group-hover:text-accent transition-colors">{sponsor.name}</h4>
                    <div className="flex items-center gap-4 mt-1">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Sorrend: {sponsor.order}</span>
                        {sponsor.active ? (
                            <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-black">Aktív</span>
                        ) : (
                            <span className="text-[10px] text-red-500 uppercase tracking-widest font-black">Rejtett</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onDuplicate(sponsor.id)}
                    className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                    title="Duplikálás"
                >
                    <Copy className="w-4 h-4" />
                </button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(sponsor)}
                    className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300"
                >
                    <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(sponsor.id)}
                    className="bg-red-500/10 border-red-500/20 hover:bg-red-500 text-red-500 hover:text-white"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

export default function SponsorListClient({ initialSponsors }: { initialSponsors: any[] }) {
    const [sponsors, setSponsors] = useState(initialSponsors);
    const [editingSponsor, setEditingSponsor] = useState<any>(null);
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
            setSponsors((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                const updates = newItems.map((item, index) => item.id);

                // Optimistically update
                const updatedItems = newItems.map((item, index) => ({ ...item, order: index }));

                updateSponsorOrder(updates);

                return updatedItems;
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Biztosan törölni szeretnéd ezt a támogatót?')) {
            const result = await deleteSponsor(id);
            if (result.success) {
                setSponsors(sponsors.filter(s => s.id !== id));
            }
        }
    };

    const handleDuplicate = async (id: string) => {
        if (window.confirm('Biztosan duplikálni szeretnéd ezt a támogatót?')) {
            const result = await duplicateSponsor(id);
            if (result.success) {
                window.location.reload();
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 font-black uppercase italic tracking-tighter"
                >
                    <Plus className="w-5 h-5" />
                    Új Támogató Hozzáadása
                </Button>
            </div>

            {(isAdding || editingSponsor) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <SponsorForm
                        sponsor={editingSponsor}
                        onClose={() => {
                            setIsAdding(false);
                            setEditingSponsor(null);
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
                <div className="grid grid-cols-1 gap-4">
                    {sponsors.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
                            <Handshake className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
                            <p className="text-zinc-500 italic">Még nincsenek támogatók hozzáadva.</p>
                        </div>
                    ) : (
                        <SortableContext
                            items={sponsors.map(s => s.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {sponsors.map((sponsor) => (
                                <SortableSponsorItem
                                    key={sponsor.id}
                                    sponsor={sponsor}
                                    onEdit={setEditingSponsor}
                                    onDelete={handleDelete}
                                    onDuplicate={handleDuplicate}
                                />
                            ))}
                        </SortableContext>
                    )}
                </div>
            </DndContext>
        </div>
    );
}
