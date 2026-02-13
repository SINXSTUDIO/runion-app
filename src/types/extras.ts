/**
 * Event Extra (Dynamic services/products that can be added to registration)
 */
export interface EventExtra {
    name: string;
    price: number;
    priceEur?: number;
    category?: string;
    description?: string;
}

/**
 * Array of event extras
 */
export type EventExtrasArray = EventExtra[];

/**
 * Type guard for EventExtra
 */
export function isEventExtra(obj: unknown): obj is EventExtra {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'name' in obj &&
        typeof (obj as EventExtra).name === 'string' &&
        'price' in obj &&
        typeof (obj as EventExtra).price === 'number'
    );
}

/**
 * Validate array of extras
 */
export function validateExtras(extras: unknown): extras is EventExtrasArray {
    if (!Array.isArray(extras)) return false;
    return extras.every(isEventExtra);
}
