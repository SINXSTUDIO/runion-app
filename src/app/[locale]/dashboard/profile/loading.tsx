import { SkeletonProfile } from '@/components/ui/skeleton';

export default function ProfileLoading() {
    return (
        <div className="min-h-screen bg-black text-white pt-28 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <SkeletonProfile />
            </div>
        </div>
    );
}
