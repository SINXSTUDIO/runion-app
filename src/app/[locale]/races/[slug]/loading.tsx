import { type FC } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const EventDetailsLoading: FC = () => {
    return (
        <div className="min-h-screen bg-black text-white pt-28 pb-20">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Breadcrumb Skeleton */}
                <div className="mb-8">
                    <Skeleton className="h-4 w-64" />
                </div>

                {/* Cover Image Skeleton */}
                <Skeleton className="h-96 w-full rounded-3xl mb-8" />

                {/* Title and Meta */}
                <div className="mb-12">
                    <Skeleton className="h-12 md:h-16 w-3/4 mb-4" />
                    <div className="flex flex-wrap gap-4 mb-6">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-6 w-36" />
                    </div>
                    <Skeleton className="h-24 w-full" />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Event Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description Section */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
                            <Skeleton className="h-8 w-48 mb-4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>

                        {/* Distances Section */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                            <Skeleton className="h-8 w-32 mb-6" />
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="bg-black/50 border border-zinc-700 rounded-xl p-4">
                                        <div className="flex justify-between items-center">
                                            <Skeleton className="h-6 w-32" />
                                            <Skeleton className="h-6 w-24" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Registration Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-zinc-900 to-black border border-accent/20 rounded-2xl p-6 sticky top-24">
                            <Skeleton className="h-8 w-full mb-6" />
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-28" />
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </div>
                            <Skeleton className="h-12 w-full mt-6" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EventDetailsLoading;
