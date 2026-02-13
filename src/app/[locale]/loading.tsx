import { type FC } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const HomeLoading: FC = () => {
    return (
        <div className="min-h-screen bg-black">
            {/* Hero Section Skeleton */}
            <div className="relative h-screen flex items-center justify-center">
                <div className="container mx-auto px-4 text-center">
                    <Skeleton className="h-20 md:h-28 w-3/4 mx-auto mb-6" />
                    <Skeleton className="h-6 w-2/3 mx-auto mb-4" />
                    <Skeleton className="h-6 w-1/2 mx-auto mb-8" />
                    <Skeleton className="h-14 w-48 mx-auto" />
                </div>
            </div>

            {/* Events Section Skeleton */}
            <div className="py-20 bg-gradient-to-b from-black to-zinc-900">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <Skeleton className="h-12 w-64 mx-auto mb-4" />
                        <Skeleton className="h-5 w-96 mx-auto" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                                <Skeleton className="h-48 w-full rounded-none" />
                                <div className="p-6 space-y-3">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                    <Skeleton className="h-10 w-full mt-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Newsletter Section Skeleton */}
            <div className="py-20 bg-zinc-900">
                <div className="container mx-auto px-4 max-w-3xl text-center">
                    <Skeleton className="h-10 w-64 mx-auto mb-4" />
                    <Skeleton className="h-5 w-96 mx-auto mb-8" />
                    <div className="flex gap-4 max-w-md mx-auto">
                        <Skeleton className="h-12 flex-1" />
                        <Skeleton className="h-12 w-32" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeLoading;
