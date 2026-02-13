import { z } from 'zod';

export const MembershipSchema = z.object({
    name: z.string().min(1, "Név kötelező"),
    nameEn: z.string().optional().nullable(),
    nameDe: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    descriptionEn: z.string().optional().nullable(),
    descriptionDe: z.string().optional().nullable(),
    features: z.string().optional().nullable(),
    featuresEn: z.string().optional().nullable(),
    featuresDe: z.string().optional().nullable(),
    discountPercentage: z.coerce.number().min(0).max(100),
    discountAmount: z.coerce.number().min(0).default(0),
    price: z.coerce.number().min(0),
    durationMonths: z.coerce.number().min(1).default(12),
});
