import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma module BEFORE imports
vi.mock('@/lib/prisma', () => {
    const mockUser = {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
    };

    return {
        prisma: { user: mockUser },
        default: { user: mockUser },
    };
});

// Import AFTER mock
import { UserRepository } from '@/lib/repositories/user-repository';
import { prisma } from '@/lib/prisma';
import { createMockUser } from '../../setup/factories';

describe('UserRepository', () => {
    let userRepository: UserRepository;

    beforeEach(() => {
        userRepository = new UserRepository();
        vi.clearAllMocks();
    });

    describe('findByEmail', () => {
        it('should return user when email exists', async () => {
            const mockUser = createMockUser({ email: 'test@example.com' });
            (prisma.user.findUnique as any).mockResolvedValue(mockUser);

            const result = await userRepository.findByEmail('test@example.com');

            expect(result).toEqual(mockUser);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
        });

        it('should return null when email does not exist', async () => {
            (prisma.user.findUnique as any).mockResolvedValue(null);

            const result = await userRepository.findByEmail('nonexistent@example.com');

            expect(result).toBeNull();
        });
    });

    describe('getActiveUsers', () => {
        it('should return only non-deleted users', async () => {
            const activeUsers = [
                createMockUser({ deletedAt: null }),
                createMockUser({ deletedAt: null }),
            ];
            (prisma.user.findMany as any).mockResolvedValue(activeUsers);

            const result = await userRepository.getActiveUsers();

            expect(result).toHaveLength(2);
            expect(result).toEqual(activeUsers);
            expect(prisma.user.findMany).toHaveBeenCalledWith({
                where: { deletedAt: null },
                orderBy: { createdAt: 'desc' },
            });
        });

        it('should return empty array when no active users', async () => {
            (prisma.user.findMany as any).mockResolvedValue([]);

            const result = await userRepository.getActiveUsers();

            expect(result).toHaveLength(0);
        });
    });

    describe('softDelete', () => {
        it('should set deletedAt timestamp', async () => {
            const userId = 'test-user-id';
            const mockUser = createMockUser({ id: userId, deletedAt: null });
            const deletedUser = { ...mockUser, deletedAt: new Date() };
            (prisma.user.update as any).mockResolvedValue(deletedUser);

            const result = await userRepository.softDelete(userId);

            expect(result.deletedAt).not.toBeNull();
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: expect.objectContaining({
                    deletedAt: expect.any(Date),
                }),
            });
        });
    });

    describe('emailExists', () => {
        it('should return true when email exists', async () => {
            (prisma.user.count as any).mockResolvedValue(1);

            const result = await userRepository.emailExists('existing@example.com');

            expect(result).toBe(true);
        });

        it('should return false when email does not exist', async () => {
            (prisma.user.count as any).mockResolvedValue(0);

            const result = await userRepository.emailExists('nonexistent@example.com');

            expect(result).toBe(false);
        });
    });

    describe('findWithMembershipTier', () => {
        it('should return user with membership included', async () => {
            const userId = 'test-user-id';
            const mockUser = createMockUser({
                id: userId,
                membershipTier: { id: 'tier-1', name: 'BASIC' },
            });
            (prisma.user.findUnique as any).mockResolvedValue(mockUser);

            const result = await userRepository.findWithMembershipTier(userId);

            expect(result).toEqual(mockUser);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: userId },
                include: { membershipTier: true },
            });
        });
    });
});
