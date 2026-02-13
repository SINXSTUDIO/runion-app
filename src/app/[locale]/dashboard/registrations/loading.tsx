import { Skeleton, SkeletonList } from '@/components/ui/skeleton';

export default function RegistrationsLoading() {
    return (
        <div className="min-h-screen bg-black text-white pt-28 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Page Header */}
                <div className="mb-8">
                    <Skeleton className="h-10 md:h-12 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
                            <Skeleton className="h-8 w-16 mx-auto mb-2" />
                            <Skeleton className="h-4 w-32 mx-auto" />
                        </div>
                    ))}
                </div>

                {/* Registrations List */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                    <SkeletonList items={5} />
                </div>
            </div>
        </div>
    );
}
