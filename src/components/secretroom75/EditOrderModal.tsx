'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';
import { updateOrder } from '@/actions/admin-orders';

interface EditOrderModalProps {
    order: any;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditOrderModal({ order, isOpen, onClose }: EditOrderModalProps) {
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState({
        status: order.status,
        paymentMethod: order.paymentMethod,
        shippingName: order.shippingName,
        shippingEmail: order.shippingEmail,
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const result = await updateOrder(order.id, formData);
            if (result.success) {
                alert('Sikeres frissítés!');
                onClose();
            } else {
                alert(result.message);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Rendelés Szerkesztése</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Státusz</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none"
                            >
                                <option value="PENDING">PENDING</option>
                                <option value="PAID">PAID</option>
                                <option value="SHIPPED">SHIPPED</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="CANCELLED">CANCELLED</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Vevő Neve</label>
                            <input
                                type="text"
                                value={formData.shippingName}
                                onChange={(e) => setFormData({ ...formData, shippingName: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Vevő Email</label>
                            <input
                                type="email"
                                value={formData.shippingEmail}
                                onChange={(e) => setFormData({ ...formData, shippingEmail: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Fizetési Mód</label>
                            <select
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none"
                            >
                                <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                                <option value="CARD">CARD</option>
                                <option value="CASH">CASH</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <Button type="button" variant="ghost" onClick={onClose}>
                                Mégse
                            </Button>
                            <Button type="submit" variant="primary" disabled={isPending}>
                                {isPending ? 'Mentés...' : 'Mentés'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
