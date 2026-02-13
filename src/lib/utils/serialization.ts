// import { Decimal } from "@prisma/client/runtime/library"; // Remove this to avoid dependency issues

/**
 * Recursively converts Prisma Decimal objects to numbers for serialization
 * to Client Components.
 */
export function serializeData<T>(data: T): T {
    if (data === null || data === undefined) return data;

    // Handle Date
    if (data instanceof Date) {
        return data.toISOString() as unknown as T;
    }

    // Handle Array
    if (Array.isArray(data)) {
        return data.map(item => serializeData(item)) as unknown as T;
    }

    // Handle Object (including Decimal)
    if (typeof data === 'object') {
        // Duck typing for Decimal
        // Check for common Decimal signatures: toNumber(), or properties like 'd' array / 'e' exponent
        // Safest is to check if it has toNumber function
        if ('toNumber' in data && typeof (data as any).toNumber === 'function') {
            return (data as any).toNumber() as unknown as T;
        }
        // Fallback for some Decimal implementations that might look different or if instance check failed
        if ((data as any).constructor && (data as any).constructor.name === 'Decimal') {
            if (typeof (data as any).toNumber === 'function') return (data as any).toNumber() as unknown as T;
            return Number(data.toString()) as unknown as T;
        }

        const serialized: any = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                serialized[key] = serializeData((data as any)[key]);
            }
        }
        return serialized as T;
    }

    return data;
}
