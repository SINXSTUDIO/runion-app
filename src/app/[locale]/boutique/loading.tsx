import { Skeleton } from '@/components/ui/skeleton';

export default function BoutiqueLoading() {
    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Hero / Header Skeleton */}
                <div className="text-center mb-16 relative">
                    <Skeleton className="h-20 md:h-28 w-3/4 mx-auto mb-4" />
                    <Skeleton className="h-6 w-2/3 mx-auto" />

                    {/* Decorative Elements */}
                    <div className="absolute top-1/2 left-0 w-24 h-1 bg-accent/20 hidden md:block" />
                    <div className="absolute top-1/2 right-0 w-24 h-1 bg-accent/20 hidden md:block" />
                </div>

                {/* Product Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-20">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden">
                            {/* Product Image */}
                            <Skeleton className="h-64 w-full rounded-none" />

                            {/* Product Details */}
                            <div className="p-4 space-y-3">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                                <div className="flex justify-between items-center pt-2">
                                    <Skeleton className="h-6 w-20" />
                                    <Skeleton className="h-10 w-24" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Info Section Skeleton */}
                <div className="mt-20 border-t border-white/10 pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-zinc-900/50 p-6 rounded-lg border border-white/5">
                            <Skeleton className="w-12 h-12 rounded-full mb-4" />
                            <Skeleton className="h-5 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
