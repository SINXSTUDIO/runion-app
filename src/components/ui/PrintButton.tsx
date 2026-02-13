'use client';

import { Button } from '@/components/ui/Button';
import { Printer } from 'lucide-react';

export default function PrintButton() {
    return (
        <div className="mt-8 text-center print:hidden">
            <Button
                onClick={() => window.print()}
                className="bg-black text-white px-6 py-3 font-bold uppercase tracking-widest hover:bg-cyan-600 transition-colors rounded gap-2"
            >
                <Printer className="w-4 h-4" />
                Nyomtatás / PDF Mentés
            </Button>
            <p className="text-xs text-gray-400 mt-2">Nyomja meg a gombot (vagy Ctrl+P), és válassza a "Mentés PDF-ként" lehetőséget.</p>
        </div>
    );
}
