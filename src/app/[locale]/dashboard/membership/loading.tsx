import { type FC } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const MembershipLoading: FC = () => {
    return (
        <div className="min-h-screen bg-black text-white pt-28 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Page Header */}
                <div className="text-center mb-12">
                    <Skeleton className="h-12 md:h-16 w-2/3 mx-auto mb-4" />
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                </div>

                {/* Membership Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
                            <div className="text-center mb-6">
                                <Skeleton className="h-8 w-48 mx-auto mb-2" />
                                <Skeleton className="h-10 w-32 mx-auto mb-4" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                            <div className="space-y-3 mb-6">
                                {Array.from({ length: 5 }).map((_, j) => (
                                    <div key={j} className="flex items-center gap-2">
                                        <Skeleton className="h-5 w-5 rounded-full" />
                                        <Skeleton className="h-4 flex-1" />
                                    </div>
                                ))}
                            </div>
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MembershipLoading;
