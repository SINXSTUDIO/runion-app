'use client';

import { Facebook, Link as LinkIcon, Check, Share2 } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonsProps {
    url: string;
    title: string;
    labels?: {
        share?: string;
        copy?: string;
        copied?: string;
    };
}

export function ShareButtons({ url, title, labels }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
    };

    const handleCopy = async () => {
        try {
            if (navigator.share && /mobile/i.test(navigator.userAgent)) {
                try {
                    await navigator.share({
                        title: title,
                        url: url
                    });
                    return;
                } catch (err) {
                    // Fallback to copy if share fails or user cancels
                }
            }

            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const defaultLabels = {
        share: 'Megosztás',
        copy: 'Link',
        copied: 'Másolva'
    };

    const finalLabels = { ...defaultLabels, ...labels };

    return (
        <div className="flex gap-3 w-full">
            <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1877F2] hover:bg-[#1864D1] text-white rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-900/20"
                aria-label="Share on Facebook"
            >
                <Facebook className="w-5 h-5" />
                <span>Facebook</span>
            </button>
            <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95 border border-zinc-700 hover:border-zinc-600"
                aria-label="Copy Link"
            >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
                <span>{copied ? finalLabels.copied : finalLabels.copy}</span>
            </button>
        </div>
    );
}
