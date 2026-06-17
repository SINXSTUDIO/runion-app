"use client";

type Sponsor = {
    id: string;
    name: string;
    logoUrl: string;
    order: number;
    active: boolean;
};

type SponsorSliderProps = {
    sponsors: Sponsor[];
};

export default function SponsorSlider({ sponsors: initialSponsors }: SponsorSliderProps) {
    const validSponsors = initialSponsors.filter(sponsor => 
        sponsor.active && 
        !sponsor.logoUrl.includes('sponser.png') && 
        !sponsor.logoUrl.includes('ilovebalaton.png')
    );

    if (validSponsors.length === 0) return null;

    // Duplicate twice for seamless marquee loop
    const marqueeSponsors = [...validSponsors, ...validSponsors];

    return (
        <div className="w-full overflow-hidden relative py-6">
            {/* Soft fade overlays for seamless scroll boundaries */}
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-zinc-950 via-zinc-950/80 to-transparent z-10 pointer-events-none" />

            <div className="flex w-max overflow-hidden">
                <div className="animate-marquee flex gap-8 items-center py-2">
                    {marqueeSponsors.map((sponsor, idx) => (
                        <div
                            key={`${sponsor.id}-${idx}`}
                            className="w-[180px] md:w-[260px] h-20 md:h-28 bg-white border border-white/5 hover:border-accent/40 rounded-2xl flex items-center justify-center p-3 md:p-6 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,242,254,0.15)] flex-shrink-0"
                        >
                            <img
                                src={sponsor.logoUrl}
                                alt={sponsor.name}
                                className="max-h-full max-w-full object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.opacity = '0.3';
                                    (e.target as HTMLImageElement).title = 'Kép nem található';
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
