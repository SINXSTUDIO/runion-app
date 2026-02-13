import { type FC } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const DocumentsLoading: FC = () => {
    return (
        <div className="min-h-screen bg-black text-white pt-28 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Page Header */}
                <div className="mb-8">
                    <Skeleton className="h-10 md:h-12 w-56 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>

                {/* Documents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DocumentsLoading;
