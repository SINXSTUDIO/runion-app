import { SkeletonTable } from '@/components/ui/skeleton';

export default function EventsLoading() {
    return (
        <div className="space-y-8 container mx-auto px-4 max-w-7xl py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="h-10 w-64 bg-white/10 animate-pulse rounded-md mb-2" />
                    <div className="h-5 w-96 bg-white/10 animate-pulse rounded-md" />
                </div>
                <div className="h-12 w-32 bg-white/10 animate-pulse rounded-xl" />
            </div>

            <SkeletonTable rows={8} />
        </div>
    );
}
