import { toast } from 'sonner';

export type ErrorLevel = 'error' | 'warning' | 'info';

export interface AppError {
    message: string;
    code?: string;
    level: ErrorLevel;
    details?: unknown;
}

/**
 * Központi error logging és toast megjelenítés
 * Production-ban integrálható Sentry vagy más APM tool-lal
 */
export function handleError(error: unknown, userMessage?: string): AppError {
    // Type-safe error extraction
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Log to console (production-ban Sentry, stb.)
    console.error('[AppError]', {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
    });

    // Show user-friendly toast
    const displayMessage = userMessage || 'Váratlan hiba történt';
    toast.error(displayMessage);

    return {
        message: errorMessage,
        level: 'error',
        details: error
    };
}

/**
 * Warning level error handler (nem kritikus hibák)
 */
export function handleWarning(message: string, details?: unknown): AppError {
    console.warn('[AppWarning]', {
        message,
        details,
        timestamp: new Date().toISOString()
    });

    toast.warning(message);

    return {
        message,
        level: 'warning',
        details
    };
}

/**
 * Try-catch wrapper server actions-hez
 * Használat: return safeServerAction(() => doSomething(), 'Művelet sikertelen')
 */
export async function safeServerAction<T>(
    action: () => Promise<T>,
    errorMessage: string = 'Művelet sikertelen'
): Promise<{ success: true; data: T } | { success: false; error: string }> {
    try {
        const data = await action();
        return { success: true, data };
    } catch (error) {
        const appError = handleError(error, errorMessage);
        return { success: false, error: appError.message };
    }
}

/**
 * Client-side async action wrapper
 * Toast megjelenítéssel és hibakezeléssel
 */
export async function safeAction<T>(
    action: () => Promise<T>,
    options?: {
        errorMessage?: string;
        successMessage?: string;
    }
): Promise<T | null> {
    try {
        const result = await action();

        if (options?.successMessage) {
            toast.success(options.successMessage);
        }

        return result;
    } catch (error) {
        handleError(error, options?.errorMessage);
        return null;
    }
}

/**
 * Type-safe error response creator
 */
export function createErrorResponse(
    error: unknown,
    fallbackMessage: string = 'Ismeretlen hiba'
): { success: false; error: string } {
    const message = error instanceof Error ? error.message : fallbackMessage;
    return { success: false, error: message };
}

/**
 * Success response creator
 */
export function createSuccessResponse<T>(data: T): { success: true; data: T } {
    return { success: true, data };
}
