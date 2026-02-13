import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { Home, Compass } from 'lucide-react';

export default function NotFound() {
    const t = useTranslations('NotFoundPage');

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-accent/5 rounded-full blur-[150px] animate-pulse-slow" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-blue-600/5 rounded-full blur-[150px] animate-pulse-slow delay-1000" />
            </div>

            <div className="relative z-10 text-center max-w-2xl mx-auto">
                <div className="mb-8 relative inline-block">
                    <h1 className="text-[12rem] md:text-[18rem] font-black italic text-transparent bg-clip-text bg-zinc-900 leading-none select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Compass className="w-32 h-32 md:w-48 md:h-48 text-accent animate-spin-slow opacity-80" />
                    </div>
                </div>

                <h2 className="text-3xl md:text-5xl font-black italic text-white mb-6">
                    {t('title')}
                </h2>

                <p className="text-xl text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
                    {t('description')}
                </p>

                <Link href="/">
                    <Button variant="primary" size="lg" className="h-14 px-8 text-lg font-bold rounded-full group">
                        <Home className="w-5 h-5 mr-2 group-hover:-translate-y-1 transition-transform" />
                        {t('button')}
                    </Button>
                </Link>
            </div>
        </div>
    );
}
