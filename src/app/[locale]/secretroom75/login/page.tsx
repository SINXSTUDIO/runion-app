import SecretLoginForm from '@/components/auth/SecretLoginForm';
import { Card } from '@/components/ui/Card';
import { Shield } from 'lucide-react';

export default function SecretLoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,254,0.08)_0,rgba(0,0,0,1)_70%)]" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

            {/* Main Card */}
            <Card className="max-w-md w-full p-10 bg-zinc-900/40 backdrop-blur-2xl border border-white/5 shadow-2xl relative z-10 rounded-2xl mx-4">
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 border border-white/5 flex items-center justify-center shadow-inner">
                            <Shield className="w-8 h-8 text-accent drop-shadow-[0_0_10px_rgba(0,242,254,0.5)]" />
                        </div>
                    </div>

                    <h1 className="text-4xl font-black font-heading italic tracking-tighter mb-2">
                        <span className="text-white">RUN</span>
                        <span className="text-accent">ION</span>
                    </h1>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">
                        Admin Portal
                    </p>
                </div>

                <div className="space-y-6">
                    <SecretLoginForm />
                </div>
            </Card>

            {/* Footer */}
            <div className="absolute bottom-6 w-full text-center z-20 pb-4">
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1 font-mono">Developed by</p>
                <a
                    href="https://sinxstudio.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-bold font-heading italic tracking-tighter text-lg hover:text-accent transition-colors block mb-1"
                >
                    SINX SZOFTVERSÚDIÓ
                </a>
            </div>
        </div>
    );
}
