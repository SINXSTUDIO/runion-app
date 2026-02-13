export type PriceTier = {
    price: number | string; // Handle Decimal as string from Prisma serialization
    validFrom: Date | string;
    validTo: Date | string;
};

export type DistanceWithTiers = {
    price: number | string;
    priceTiers: PriceTier[];
};

export function calculateEffectivePrice(distance: DistanceWithTiers, date: Date = new Date()): number {
    if (!distance.priceTiers || distance.priceTiers.length === 0) {
        return Number(distance.price);
    }

    // Find applicable tier
    // Logic: Look for a tier where date is between validFrom and validTo
    const activeTier = distance.priceTiers.find(tier => {
        const from = new Date(tier.validFrom);
        const to = new Date(tier.validTo);
        return date >= from && date <= to;
    });

    if (activeTier) {
        return Number(activeTier.price);
    }

    // Fallback: If no tier matches (e.g. before first early bird or after last late entry?),
    // should we return base price?
    // User requirement: "Dátum alapú árazás".
    // Usually base price is the "Standard" if no specific tier fits, or maybe "On Site".
    // For now, return base price.
    return Number(distance.price);
}

// Helper to get active tier name if any
export function getActiveTierName(distance: any, date: Date = new Date()): string | null {
    if (!distance.priceTiers) return null;
    const activeTier = distance.priceTiers.find((tier: any) => {
        const from = new Date(tier.validFrom);
        const to = new Date(tier.validTo);
        return date >= from && date <= to;
    });
    return activeTier ? activeTier.name : null;
}
