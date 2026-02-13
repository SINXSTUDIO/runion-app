'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CopyButtonProps {
    text: string;
    label?: string;
    className?: string;
}

export default function CopyButton({ text, label, className }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <Button
            onClick={handleCopy}
            variant="ghost"
            size="sm"
            className={`h-6 px-2 text-zinc-400 hover:text-white hover:bg-white/10 ${className}`}
            title="Másolás vágólapra"
            type="button"
        >
            {copied ? (
                <Check className="w-3 h-3 text-emerald-500" />
            ) : (
                <Copy className="w-3 h-3" />
            )}
            {label && <span className="ml-2">{label}</span>}
        </Button>
    );
}
