import { SkeletonStats, SkeletonCard } from '@/components/ui/skeleton';

export default function DashboardLoading() {
    return (
        <div className="space-y-8 container mx-auto px-4 max-w-7xl py-8">
            <div>
                <div className="h-10 w-64 bg-white/10 animate-pulse rounded-md mb-2" />
                <div className="h-5 w-96 bg-white/10 animate-pulse rounded-md" />
            </div>

            <SkeletonStats cols={4} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkeletonCard />
                <SkeletonCard />
            </div>
        </div>
    );
}
