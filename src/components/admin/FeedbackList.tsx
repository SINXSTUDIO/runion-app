'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { respondToFeedback } from '@/actions/feedback-actions';

type FeedbackWithUser = any; // Replace with proper type from Prisma

export function FeedbackList({ initialFeedbacks }: { initialFeedbacks: FeedbackWithUser[] }) {
    const [feedbacks, setFeedbacks] = useState(initialFeedbacks);
    const [selectedFeedback, setSelectedFeedback] = useState<FeedbackWithUser | null>(null);
    const [responseText, setResponseText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRespond = async () => {
        if (!selectedFeedback) return;
        setLoading(true);
        try {
            const result = await respondToFeedback(selectedFeedback.id, responseText);
            if (result.success) {
                toast.success('Válasz elküldve!');
                // Update local state
                setFeedbacks(feedbacks.map(f => f.id === selectedFeedback.id ? { ...f, status: 'RESOLVED', adminResponse: responseText } : f));
                setSelectedFeedback(null);
                setResponseText('');
            } else {
                toast.error('Hiba történt a válasz küldésekor.');
            }
        } catch (error) {
            toast.error('Váratlan hiba történt.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Függőben</Badge>;
            case 'IN_PROGRESS': return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Folyamatban</Badge>;
            case 'RESOLVED': return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Megoldva</Badge>;
            case 'CLOSED': return <Badge variant="outline" className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20">Lezárva</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'BUG': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'FEATURE': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            default: return <MessageSquare className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="grid gap-4">
            {feedbacks.length === 0 ? (
                <div className="text-center p-8 text-zinc-500">
                    Nincs megjeleníthető visszajelzés.
                </div>
            ) : (
                feedbacks.map((feedback) => (
                    <Card key={feedback.id} className="bg-zinc-900/50 border-white/10">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-base font-medium text-white flex items-center gap-2">
                                    {getTypeIcon(feedback.type)}
                                    {feedback.subject}
                                </CardTitle>
                                <p className="text-sm text-zinc-400">
                                    {feedback.user.lastName} {feedback.user.firstName} ({feedback.user.email})
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {getStatusBadge(feedback.status)}
                                <span className="text-xs text-zinc-500">
                                    {format(new Date(feedback.createdAt), 'yyyy. MM. dd. HH:mm')}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mt-2 text-sm text-zinc-300 whitespace-pre-wrap bg-black/20 p-3 rounded-md">
                                {feedback.message}
                            </div>

                            {feedback.adminResponse && (
                                <div className="mt-4 border-l-2 border-accent pl-4 py-1">
                                    <p className="text-xs text-accent font-bold mb-1">Admin Válasz:</p>
                                    <p className="text-sm text-zinc-300">{feedback.adminResponse}</p>
                                </div>
                            )}

                            {!feedback.adminResponse && (
                                <div className="mt-4 flex justify-end">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" onClick={() => setSelectedFeedback(feedback)}>
                                                Válasz küldése
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Válasz a visszajelzésre</DialogTitle>
                                                <DialogDescription>
                                                    A válaszod értesítésként fog megjelenni a felhasználónak.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="py-4 space-y-4">
                                                <div className="bg-zinc-900 p-3 rounded-md border border-white/10">
                                                    <p className="text-xs text-zinc-500 mb-1">Felhasználó üzenete:</p>
                                                    <p className="text-sm text-zinc-300 italic">{selectedFeedback?.message}</p>
                                                </div>
                                                <Textarea
                                                    placeholder="Írd ide a választ..."
                                                    value={responseText}
                                                    onChange={(e) => setResponseText(e.target.value)}
                                                    rows={5}
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button onClick={handleRespond} disabled={loading}>
                                                    {loading ? 'Küldés...' : 'Válasz elküldése'}
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}
