import RegisterForm from '@/components/auth/RegisterForm';
import { Card } from '@/components/ui/Card';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
    const t = useTranslations('Auth.Register');

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-black">
            {/* Left Side - Form */}
            <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">

                {/* Back Link */}
                <div className="absolute top-6 left-6 lg:top-10 lg:left-10 z-10">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-white transition-colors group">
                        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                        RUNION
                    </Link>
                </div>

                <div className="w-full max-w-md mx-auto space-y-8 py-12 lg:py-0">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black font-heading tracking-tight italic text-white uppercase">
                            {t('title').split(' ').map((word, i) => (
                                <span key={i} className={i % 2 !== 0 ? 'text-accent' : ''}>{word} </span>
                            ))}
                        </h1>
                        <p className="text-zinc-400 text-lg">
                            {t('subtitle')}
                        </p>
                    </div>

                    <RegisterForm />

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-900" />
                        </div>
                    </div>

                    <div className="text-center space-y-4">
                        <p className="text-sm text-zinc-500">
                            {t('hasAccount')}{' '}
                            <Link href="/login" className="font-bold text-white hover:text-accent transition-colors">
                                {t('loginLink')}
                            </Link>
                        </p>

                        {/* Secured by Sinx Software Studio */}
                        <div className="pt-8 flex justify-center">
                            <a
                                href="https://sinxstudio.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs text-zinc-600 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800 hover:border-zinc-700 hover:text-zinc-500 transition-colors"
                            >
                                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                                <span>Secured by <span className="font-bold text-zinc-400">Sinx Szoftverstúdió</span></span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden md:block relative w-full h-full overflow-hidden">
                <div className="absolute inset-0 bg-accent/5 z-10 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent z-20"></div>

                {/* Image from Unsplash - High quality runner image */}
                <div
                    className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-10000 hover:scale-110 ease-linear transform"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2600&auto=format&fit=crop')" }}
                />

                {/* Quote Overlay */}
                <div className="absolute bottom-20 left-20 right-20 z-30 space-y-4">
                    <div className="w-12 h-1 bg-accent"></div>
                    <blockquote className="text-3xl font-bold text-white italic font-heading leading-tight">
                        "Minden kezdet nehéz, de a célvonal átlépése minden métert megér."
                    </blockquote>
                    <cite className="block text-zinc-400 font-mono text-sm not-italic mt-4">
                        — RUNION Team
                    </cite>
                </div>
            </div>
        </div>
    );
}
