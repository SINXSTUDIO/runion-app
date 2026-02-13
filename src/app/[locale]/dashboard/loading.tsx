import { type FC } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardLoading: FC = () => {
    return (
        <div className="min-h-screen bg-black text-white pt-28 pb-20">
            <div className="container mx-auto px-4">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 border-b border-zinc-800 pb-8">
                    <div className="w-full">
                        <Skeleton className="h-12 md:h-16 w-2/3 mb-2" />
                        <Skeleton className="h-5 w-1/2" />
                    </div>
                    <div className="flex gap-4">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Registrations Skeleton */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Skeleton className="h-6 w-6" />
                            <Skeleton className="h-8 w-48" />
                        </div>
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <Skeleton className="h-6 w-3/4 mb-2" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                        <Skeleton className="h-6 w-20" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar: Stats Skeleton */}
                    <div className="space-y-6">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                            <Skeleton className="h-6 w-32 mb-4" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/50 p-4 rounded-xl border border-zinc-800 text-center">
                                    <Skeleton className="h-8 w-12 mx-auto mb-1" />
                                    <Skeleton className="h-3 w-16 mx-auto" />
                                </div>
                                <div className="bg-black/50 p-4 rounded-xl border border-zinc-800 text-center">
                                    <Skeleton className="h-8 w-12 mx-auto mb-1" />
                                    <Skeleton className="h-3 w-16 mx-auto" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardLoading;
