"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import PartnerForm from "@/components/secretroom75/PartnerForm";
import { deletePartner, updatePartnerOrder, duplicatePartner } from "@/actions/partners";
import { Edit2, Trash2, GripVertical, Plus, Handshake, Copy } from "lucide-react";
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

interface SortablePartnerItemProps {
    partner: any;
    onEdit: (p: any) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
}

function SortablePartnerItem({ partner, onEdit, onDelete, onDuplicate }: SortablePartnerItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: partner.id });

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
                        src={partner.logoUrl}
                        alt={partner.name}
                        className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                    {!partner.active && (
                        <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="bg-red-600 text-[8px] text-white px-2 py-0.5 rounded-full font-black uppercase">Inaktív</span>
                        </div>
                    )}
                </div>
                <div>
                    <h4 className="text-lg font-bold text-white group-hover:text-accent transition-colors">{partner.name}</h4>
                    <div className="flex items-center gap-4 mt-1">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Sorrend: {partner.order}</span>
                        {partner.active ? (
                            <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-black">Aktív</span>
                        ) : (
                            <span className="text-[10px] text-red-500 uppercase tracking-widest font-black">Rejtett</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onDuplicate(partner.id)}
                    className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                    title="Duplikálás"
                >
                    <Copy className="w-4 h-4" />
                </button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(partner)}
                    className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300"
                >
                    <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(partner.id)}
                    className="bg-red-500/10 border-red-500/20 hover:bg-red-500 text-red-500 hover:text-white"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

export default function PartnerListClient({ initialPartners }: { initialPartners: any[] }) {
    const [partners, setPartners] = useState(initialPartners);
    const [editingPartner, setEditingPartner] = useState<any>(null);
    const [showForm, setShowForm] = useState(false);

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
            setPartners((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Prepare updates with new order indices
                const updates = newItems.map((item, index) => ({
                    id: item.id,
                    order: index + 1
                }));

                // Optimistically update local state orders for visual feedback
                const updatedItems = newItems.map((item, index) => ({ ...item, order: index + 1 }));

                // Send update to server
                updatePartnerOrder(updates);

                return updatedItems;
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Biztosan törölni szeretnéd ezt a partnert?")) {
            const res = await deletePartner(id);
            if (res.success) {
                setPartners(partners.filter(p => p.id !== id));
            }
        }
    };

    const handleDuplicate = async (id: string) => {
        if (confirm("Biztosan duplikálni szeretnéd ezt a partnert?")) {
            const res = await duplicatePartner(id);
            if (res.success) {
                window.location.reload();
            }
        }
    };

    return (
        <div className="space-y-6">
            {!showForm && !editingPartner && (
                <div className="flex justify-end">
                    <Button
                        onClick={() => setShowForm(true)}
                        className="font-black uppercase italic tracking-tighter bg-accent hover:bg-accent/80 text-black px-8 py-6 rounded-full shadow-[0_0_20px_rgba(0,242,254,0.3)]"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Új Partner Hozzáadása
                    </Button>
                </div>
            )}

            {(showForm || editingPartner) && (
                <div className="mb-12">
                    <PartnerForm
                        partner={editingPartner}
                        onClose={() => {
                            setShowForm(false);
                            setEditingPartner(null);
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
                    {partners.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
                            <Handshake className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
                            <p className="text-zinc-500">Még nincsenek partnerek felvéve.</p>
                        </div>
                    ) : (
                        <SortableContext
                            items={partners.map(p => p.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {partners.map((partner) => (
                                <SortablePartnerItem
                                    key={partner.id}
                                    partner={partner}
                                    onEdit={setEditingPartner}
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
