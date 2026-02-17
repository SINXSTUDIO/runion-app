'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { createFeedback, getMyFeedbacks } from '@/actions/feedback-actions';
import { toast } from 'sonner';
import { MessageSquarePlus, Loader2, History, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Feedback, FeedbackStatus, FeedbackType } from '@prisma/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';

export function FeedbackModal({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<FeedbackType>('OTHER');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [activeTab, setActiveTab] = useState('new');

    const fetchFeedbacks = async () => {
        const data = await getMyFeedbacks();
        if (data) {
            setFeedbacks(data as Feedback[]);
        }
    };

    useEffect(() => {
        if (open) {
            fetchFeedbacks();
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await createFeedback({ type, subject, message });
            if (result.success) {
                toast.success('Visszajelzés elküldve! Köszönjük.');
                setSubject('');
                setMessage('');
                setType('OTHER');
                fetchFeedbacks();
                setActiveTab('history');
            } else {
                toast.error('Hiba történt a küldés során.');
            }
        } catch (error) {
            toast.error('Váratlan hiba történt.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: FeedbackStatus) => {
        switch (status) {
            case 'PENDING': return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'IN_PROGRESS': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
            case 'RESOLVED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'CLOSED': return <XCircle className="w-4 h-4 text-zinc-500" />;
            default: return <AlertCircle className="w-4 h-4 text-zinc-500" />;
        }
    };

    const getStatusLabel = (status: FeedbackStatus) => {
        switch (status) {
            case 'PENDING': return 'Feldolgozásra vár';
            case 'IN_PROGRESS': return 'Folyamatban';
            case 'RESOLVED': return 'Megoldva';
            case 'CLOSED': return 'Lezárva';
            default: return status;
        }
    };

    const getTypeLabel = (type: FeedbackType) => {
        switch (type) {
            case 'BUG': return 'Hiba';
            case 'FEATURE': return 'Javaslat';
            case 'OTHER': return 'Egyéb';
            default: return type;
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" className="gap-2">
                        <MessageSquarePlus className="h-4 w-4" />
                        Visszajelzés
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col p-4 sm:p-6 rounded-xl">
                <DialogHeader>
                    <DialogTitle>Visszajelzések</DialogTitle>
                    <DialogDescription>
                        Küldj hibajelentést, javaslatot, vagy kövesd nyomon korábbi üzeneteidet.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="new">Új Visszajelzés</TabsTrigger>
                        <TabsTrigger value="history">Előzmények</TabsTrigger>
                    </TabsList>

                    <TabsContent value="new" className="flex-1 overflow-y-auto p-1">
                        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="type">Típus</Label>
                                <Select onValueChange={(v) => setType(v as FeedbackType)} defaultValue="OTHER">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Válassz típust" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BUG">Hiba bejelentés</SelectItem>
                                        <SelectItem value="FEATURE">Fejlesztési javaslat</SelectItem>
                                        <SelectItem value="OTHER">Egyéb észrevétel</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="subject">Tárgy</Label>
                                <Input
                                    id="subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Röviden a témáról"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="message">Üzenet</Label>
                                <Textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Írd le részletesen az észrevételed..."
                                    className="min-h-[150px]"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    Mégse
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Küldés
                                </Button>
                            </div>
                        </form>
                    </TabsContent>

                    <TabsContent value="history" className="flex-1 overflow-y-auto p-1 space-y-4">
                        {feedbacks.length === 0 ? (
                            <div className="text-center py-12 text-zinc-500">
                                <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Még nem küldtél visszajelzést.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 pb-4">
                                {feedbacks.map((item) => (
                                    <div key={item.id} className="bg-zinc-900/50 border border-white/10 rounded-lg p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={cn(
                                                        "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                                                        item.type === 'BUG' ? "bg-red-500/20 text-red-400" :
                                                            item.type === 'FEATURE' ? "bg-blue-500/20 text-blue-400" :
                                                                "bg-zinc-500/20 text-zinc-400"
                                                    )}>
                                                        {getTypeLabel(item.type)}
                                                    </span>
                                                    <span className="text-xs text-zinc-500">
                                                        {format(new Date(item.createdAt), "yyyy. MM. dd. HH:mm", { locale: hu })}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-white text-sm">{item.subject}</h4>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/20 border border-white/5">
                                                {getStatusIcon(item.status)}
                                                <span className="text-[10px] font-medium text-zinc-400 uppercase">
                                                    {getStatusLabel(item.status)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bg-black/20 p-3 rounded text-sm text-zinc-300 whitespace-pre-wrap">
                                            {item.message}
                                        </div>

                                        {item.adminResponse && (
                                            <div className="bg-accent/10 border border-accent/20 p-3 rounded text-sm relative mt-2">
                                                <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-accent text-zinc-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                                    Admin Válasz
                                                </div>
                                                <p className="text-accent/90 whitespace-pre-wrap font-medium">
                                                    {item.adminResponse}
                                                </p>
                                                <div className="flex items-center gap-1 mt-2 text-[10px] text-accent/60">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Megválaszolva
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
