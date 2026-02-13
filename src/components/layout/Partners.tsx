"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getPartners } from "@/actions/partners";
import { Partner } from "@prisma/client";

import { useTranslations } from "next-intl";

export default function Partners() {
    const t = useTranslations("HomePage");
    const [partners, setPartners] = useState<Partner[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchPartners() {
            try {
                const data = await getPartners();
                setPartners(data.filter((p) => p.active));
            } catch (error) {
                console.error("Failed to fetch partners", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchPartners();
    }, []);

    if (partners.length === 0) return null;

    return (
        <section className="bg-primary pt-16 pb-24 border-t border-white/5 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col items-center">

                    <p className="text-center text-[10px] text-zinc-500 mb-12 uppercase tracking-[0.3em] font-medium font-heading opacity-80">
                        {t('partnersTitle')}
                    </p>

                    {/* Responsive Layout: 2 Columns Mobile, 1 Row Desktop */}
                    <div className="grid grid-cols-2 md:flex md:flex-nowrap justify-center items-center gap-8 md:gap-12 w-full max-w-7xl px-4">
                        {partners.map((partner) => (
                            <div
                                key={partner.id}
                                className="group relative grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500 transform hover:scale-105 flex items-center justify-center p-4 w-full md:w-auto"
                            >
                                <div className="relative h-20 w-36 sm:h-24 sm:w-48 md:h-28 md:w-60 lg:h-32 lg:w-72">
                                    <Image
                                        src={partner.logoUrl}
                                        alt={partner.name}
                                        fill
                                        className="object-contain filter brightness-90 group-hover:brightness-100 transition-all duration-300"
                                        sizes="(max-width: 768px) 50vw, 20vw"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
