/**
 * @fileoverview Reusable Skeleton loading components
 * Provides consistent loading UI across the application
 */

import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

/**
 * Base skeleton component
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn('animate-pulse rounded-md bg-white/10', className)}
            {...props}
        />
    );
}

/**
 * Card skeleton with title and content areas
 */
export function SkeletonCard() {
    return (
        <div className="rounded-lg border border-white/10 bg-white/5 p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex gap-2 mt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
    );
}

/**
 * Table skeleton with rows
 */
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-white/5 rounded-lg">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="grid grid-cols-4 gap-4 p-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            ))}
        </div>
    );
}

/**
 * Form skeleton
 */
export function SkeletonForm({ fields = 4 }: { fields?: number }) {
    return (
        <div className="space-y-6">
            {Array.from({ length: fields }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ))}
            <div className="flex gap-2 pt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
    );
}

/**
 * Event card skeleton
 */
export function SkeletonEventCard() {
    return (
        <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
            {/* Cover Image */}
            <Skeleton className="h-48 w-full rounded-none" />

            {/* Content */}
            <div className="p-6 space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>

                <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                </div>

                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    );
}

/**
 * Profile skeleton
 */
export function SkeletonProfile() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>

            {/* Content sections */}
            <div className="grid gap-6">
                <SkeletonCard />
                <SkeletonCard />
            </div>
        </div>
    );
}

/**
 * List skeleton with items
 */
export function SkeletonList({ items = 5 }: { items?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20 flex-shrink-0" />
                </div>
            ))}
        </div>
    );
}

/**
 * Dashboard stats skeleton
 */
export function SkeletonStats({ cols = 4 }: { cols?: number }) {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-4`}>
            {Array.from({ length: cols }).map((_, i) => (
                <div key={i} className="bg-white/5 rounded-lg border border-white/10 p-6 space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-32" />
                </div>
            ))}
        </div>
    );
}
