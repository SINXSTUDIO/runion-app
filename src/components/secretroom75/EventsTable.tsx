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
        <tr ref={setNodeRef} style={style} className="hover:bg-zinc-800/50">
            <td className="p-4">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-zinc-500 hover:text-accent transition-colors"
                >
                    <GripVertical className="w-5 h-5" />
                </button>
            </td>
            <td className="p-4 font-bold">
                {event.title}
                <div className="text-xs text-gray-500 font-normal mt-1">{event.slug}</div>
            </td>
            <td className="p-4 text-gray-400">{new Date(event.eventDate).toLocaleDateString()}</td>
            <td className="p-4 text-gray-400">{event.location}</td>
            <td className="p-4">
                <span
                    className={`px-2 py-1 rounded text-xs font-bold ${event.status === 'PUBLISHED'
                        ? 'bg-green-500/20 text-green-500'
                        : event.status === 'DRAFT'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : 'bg-red-500/20 text-red-500'
                        }`}
                >
                    {event.status}
                </span>
            </td>
            <td className="p-4">
                <div className="flex gap-2">
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
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 border-blue-500/20"
                            title="Duplikálás"
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                    </form>
                    <Link href={`/secretroom75/events/${event.id}/edit`}>
                        <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
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
                            className="text-red-500 hover:bg-red-500/10 border-red-500/20"
                        >
                            <Trash2 className="w-4 h-4" />
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
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-950 text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="p-4 w-12"></th>
                            <th className="p-4">Esemény</th>
                            <th className="p-4">Dátum</th>
                            <th className="p-4">Helyszín</th>
                            <th className="p-4">Státusz</th>
                            <th className="p-4">Művelet</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
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
        </DndContext>
    );
}
