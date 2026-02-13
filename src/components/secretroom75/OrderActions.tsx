'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Trash2, Mail, Edit, CheckCircle } from 'lucide-react';
import { deleteOrder, resendOrderEmail } from '@/actions/admin-orders';
import { markMembershipAsPaid } from '@/actions/memberships';
import EditOrderModal from './EditOrderModal';

interface OrderActionsProps {
    order: any; // We trust the serialization from parent
}

export default function OrderActions({ order }: OrderActionsProps) {
    const [isPending, startTransition] = useTransition();
    const [showEdit, setShowEdit] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Biztosan törölni szeretnéd ezt a rendelést? Ez a művelet nem visszavonható.')) return;

        startTransition(async () => {
            const result = await deleteOrder(order.id);
            if (!result.success) toast.error(result.message);
        });
    };

    const handleResendEmail = async () => {
        if (!confirm('Újraküldöd a visszaigazoló emailt?')) return;

        startTransition(async () => {
            const result = await resendOrderEmail(order.id);
            toast.info(result.message);
        });
    };

    const handleMarkPaid = async () => {
        if (!confirm('Biztosan fizetettnek jelölöd ezt a tagsági rendelést? Ez aktiválja a tagságot és emailt küld.')) return;

        startTransition(async () => {
            const result = await markMembershipAsPaid(order.id);
            if (result.success) {
                toast.success('Sikeresen fizetettnek jelölve és aktiválva.');
            } else {
                toast.error(result.error);
            }
        });
    };

    const isMembershipOrder = order.items.some((item: any) => item.size === 'MEMBERSHIP');
    const isPaid = order.status === 'PAID';

    return (
        <div className="flex gap-2 relative">
            {isMembershipOrder && !isPaid && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkPaid}
                    disabled={isPending}
                    className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                    title="Tagság Fizetettnek Jelölése"
                >
                    <CheckCircle className="w-4 h-4" />
                </Button>
            )}
            <Button
                variant="ghost"
                size="sm"
                onClick={handleResendEmail}
                disabled={isPending}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                title="Email újraküldése"
            >
                <Mail className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEdit(true)}
                disabled={isPending}
                className="text-amber-400 hover:text-amber-300 hover:bg-amber-900/20"
                title="Szerkesztés"
            >
                <Edit className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                title="Rendelés törlése"
            >
                <Trash2 className="w-4 h-4" />
            </Button>

            {showEdit && (
                <EditOrderModal
                    order={order}
                    isOpen={showEdit}
                    onClose={() => setShowEdit(false)}
                />
            )}
        </div>
    );
}
