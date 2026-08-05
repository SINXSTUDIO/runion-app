import { type FC } from 'react';
import { SkeletonEventCard } from '@/components/ui/skeleton';

const RacesLoading: FC = () => {
    return (
        <div className="min-h-screen bg-black text-white pt-28 pb-20">
            {/* Header Section Skeleton */}
            <div className="container mx-auto px-4 mb-16">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                    <div className="w-full">
                        {/* Title Skeleton */}
                        <div className="h-16 md:h-20 w-3/4 bg-white/10 animate-pulse rounded-md mb-4" />
                        {/* Subtitle Skeleton */}
                        <div className="h-6 w-full max-w-2xl bg-white/10 animate-pulse rounded-md mb-2" />
                        <div className="h-6 w-2/3 max-w-xl bg-white/10 animate-pulse rounded-md" />
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-zinc-800 mb-8" />
            </div>

            {/* Event Grid Skeleton */}
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
                    <SkeletonEventCard />
                    <SkeletonEventCard />
                    <SkeletonEventCard />
                    <SkeletonEventCard />
                    <SkeletonEventCard />
                    <SkeletonEventCard />
                </div>
            </div>
        </div>
    );
};

export default RacesLoading;
