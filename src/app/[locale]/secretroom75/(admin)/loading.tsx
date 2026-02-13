export default function SecretLoading() {
    return (
        <div className="min-h-[60vh] p-8 flex flex-col gap-8 animate-pulse">
            <div className="h-10 bg-zinc-800 rounded-lg w-1/3"></div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="h-12 bg-zinc-950"></div>
                <div className="p-4 space-y-4">
                    <div className="h-8 bg-zinc-800 rounded w-full"></div>
                    <div className="h-8 bg-zinc-800 rounded w-full opacity-50"></div>
                    <div className="h-8 bg-zinc-800 rounded w-full opacity-30"></div>
                </div>
            </div>
            <div className="font-mono text-xs text-accent/50">
                [SYSTEM]: Loading encrypted data...
            </div>
        </div>
    );
}
