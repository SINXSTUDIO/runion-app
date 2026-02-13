import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { beforeEach } from 'vitest';

// Create a deep mock of Prisma Client
export const prismaMock = mockDeep<PrismaClient>() as DeepMockProxy<PrismaClient>;

// Reset mock before each test
beforeEach(() => {
    mockReset(prismaMock);
});

// Helper to mock Prisma with specific implementation
export function mockPrisma<T extends keyof PrismaClient>(
    model: T,
    method: string,
    implementation: any
) {
    (prismaMock[model] as any)[method].mockImplementation(implementation);
}

// Example usage in tests:
// mockPrisma('user', 'findUnique', () => Promise.resolve(mockUser));
