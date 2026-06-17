'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2, Copy, GripVertical } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { deleteEvent, duplicateEvent, updateEventsOrder } from '@/actions/events';
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

type Event = {
    id: string;
    slug: string;
    title: string;
    eventDate: Date;
    location: string;
    status: string;
    sortOrder: number;
    registrationsCount: number;
};

type Props = { initialEvents: Event[] };

function SortableEventRow({ event }: { event: Event }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: event.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <tr ref={setNodeRef} style={style} className="hover:bg-white/5 transition-colors border-b border-white/5">
            <td className="p-4 align-middle">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-zinc-500 hover:text-accent transition-colors p-1 rounded hover:bg-zinc-800"
                    aria-label="Drag to reorder"
                >
                    <GripVertical className="w-4 h-4" />
                </button>
            </td>
            <td className="p-4 align-middle">
                <div className="font-bold text-white text-sm sm:text-base">{event.title}</div>
                <div className="text-xs text-zinc-500 font-mono mt-0.5">{event.slug}</div>
            </td>
            <td className="p-4 align-middle text-zinc-400 font-mono text-xs sm:text-sm">
                {new Date(event.eventDate).toLocaleDateString('hu-HU')}
            </td>
            <td className="p-4 align-middle text-zinc-400 text-xs sm:text-sm">{event.location}</td>
            <td className="p-4 align-middle">
                <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${event.status === 'PUBLISHED'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : event.status === 'DRAFT'
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                >
                    {event.status}
                </span>
            </td>
            <td className="p-4 align-middle">
                <div className="flex gap-2 items-center">
                    <form
                        action={async () => {
                            const result = await duplicateEvent(event.id);
                            if (result.success) {
                                window.location.reload();
                            } else {
                                alert('Hiba: ' + (result.error || 'Ismeretlen hiba'));
                            }
                        }}
                    >
                        <Button
                            variant="outline"
                            size="sm"
                            type="submit"
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 border-blue-500/10 h-8 px-2.5 rounded-lg"
                            title="Duplikálás"
                        >
                            <Copy className="w-3.5 h-3.5" />
                        </Button>
                    </form>
                    <Link href={`/secretroom75/events/${event.id}/edit`}>
                        <Button variant="outline" size="sm" className="h-8 px-2.5 rounded-lg border-white/5 hover:bg-zinc-800 hover:text-white">
                            <Edit className="w-3.5 h-3.5" />
                        </Button>
                    </Link>
                    <form
                        action={async () => {
                            if (!confirm('Biztosan törölni akarod ezt az eseményt? Ez a művelet nem vonható vissza!')) {
                                return;
                            }
                            const result = await deleteEvent(event.id);
                            if (result.success) {
                                window.location.reload();
                            } else {
                                alert('Hiba: ' + (result.error || 'Ismeretlen hiba'));
                            }
                        }}
                    >
                        <Button
                            variant="outline"
                            size="sm"
                            type="submit"
                            className="text-red-500 hover:bg-red-500/10 border-red-500/10 h-8 px-2.5 rounded-lg"
                            title="Törlés"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </form>
                </div>
            </td>
        </tr>
    );
}

export default function EventsTable({ initialEvents }: Props) {
    const [events, setEvents] = useState<Event[]>(initialEvents);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = events.findIndex((e) => e.id === active.id);
            const newIndex = events.findIndex((e) => e.id === over.id);

            const newEvents = arrayMove(events, oldIndex, newIndex);
            setEvents(newEvents);

            // Update sortOrder in backend
            const eventOrders = newEvents.map((event, index) => ({
                id: event.id,
                sortOrder: index,
            }));

            await updateEventsOrder(eventOrders);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-950/60 text-zinc-400 uppercase text-xs font-black tracking-widest border-b border-white/5">
                            <tr>
                                <th className="p-4 w-12"></th>
                                <th className="p-4">Esemény</th>
                                <th className="p-4">Dátum</th>
                                <th className="p-4">Helyszín</th>
                                <th className="p-4">Státusz</th>
                                <th className="p-4">Művelet</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <SortableContext
                                items={events.map((e) => e.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {events.map((event) => (
                                    <SortableEventRow key={event.id} event={event} />
                                ))}
                            </SortableContext>
                        </tbody>
                    </table>
                </div>
            </div>
        </DndContext>
    );
}
