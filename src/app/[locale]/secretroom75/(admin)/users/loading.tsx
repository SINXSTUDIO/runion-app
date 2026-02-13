import { SkeletonTable } from '@/components/ui/skeleton';

export default function UsersLoading() {
    return (
        <div className="space-y-8 container mx-auto px-4 max-w-7xl py-8">
            <div>
                <div className="h-10 w-64 bg-white/10 animate-pulse rounded-md mb-2" />
                <div className="h-5 w-96 bg-white/10 animate-pulse rounded-md" />
            </div>

            <SkeletonTable rows={12} />
        </div>
    );
}
