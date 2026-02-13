/**
 * Simple in-memory mutex for preventing race conditions
 * 
 * Use case: Protect critical sections where concurrent access could lead to:
 * - Double booking (registration capacity)
 * - Stock overselling
 * - Duplicate order creation
 * 
 * NOTE: This is in-memory only. For distributed systems with multiple
 * server instances, use Redis-based locking (e.g., Redlock algorithm).
 */
export class Mutex {
    private locks = new Map<string, Promise<void>>();

    /**
     * Acquire a lock for the given key
     * Returns a release function that MUST be called when done
     * 
     * Usage:
     * ```typescript
     * const mutex = new Mutex();
     * const release = await mutex.acquire('resource-id');
     * try {
     *   // Critical section
     *   await doSomething();
     * } finally {
     *   release(); // Always release in finally!
     * }
     * ```
     */
    async acquire(key: string): Promise<() => void> {
        // Wait for existing lock to be released
        while (this.locks.has(key)) {
            await this.locks.get(key);
        }

        // Create new lock
        let release: () => void;
        const promise = new Promise<void>((resolve) => {
            release = resolve;
        });

        this.locks.set(key, promise);

        // Return release function
        return () => {
            this.locks.delete(key);
            release!();
        };
    }

    /**
     * Try to acquire lock without waiting
     * Returns null if lock is already held
     */
    tryAcquire(key: string): (() => void) | null {
        if (this.locks.has(key)) {
            return null;
        }

        let release: () => void;
        const promise = new Promise<void>((resolve) => {
            release = resolve;
        });

        this.locks.set(key, promise);

        return () => {
            this.locks.delete(key);
            release!();
        };
    }

    /**
     * Check if a key is currently locked
     */
    isLocked(key: string): boolean {
        return this.locks.has(key);
    }

    /**
     * Get number of active locks
     */
    getActiveLockCount(): number {
        return this.locks.size;
    }
}

/**
 * Global mutex instance for registration operations
 * Prevents race conditions when multiple users register simultaneously
 */
export const registrationMutex = new Mutex();

/**
 * Global mutex for product stock operations
 */
export const stockMutex = new Mutex();

/**
 * Global mutex for order creation
 */
export const orderMutex = new Mutex();
