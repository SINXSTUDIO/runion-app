import { Skeleton, SkeletonList } from '@/components/ui/skeleton';

export default function OrdersLoading() {
    return (
        <div className="min-h-screen bg-black text-white pt-28 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Page Header */}
                <div className="mb-8">
                    <Skeleton className="h-10 md:h-12 w-48 mb-2" />
                    <Skeleton className="h-5 w-80" />
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <Skeleton className="h-6 w-32 mb-2" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                                <Skeleton className="h-6 w-20" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
