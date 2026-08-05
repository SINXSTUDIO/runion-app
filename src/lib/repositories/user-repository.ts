import { BaseRepository } from './base/base-repository';
import { User, Prisma } from '@prisma/client';

export class UserRepository extends BaseRepository<
    User,
    Prisma.UserCreateInput,
    Prisma.UserUpdateInput,
    Prisma.UserWhereUniqueInput
> {
    protected modelName = 'User' as Prisma.ModelName;

    /**
     * Find user by email
     */
    async findByEmail(email: string) {
        return this.findUnique({ email });
    }

    /**
     * Get active users (non-deleted)
     */
    async getActiveUsers() {
        return this.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Soft delete user
     */
    async softDelete(id: string) {
        return this.update(
            { id },
            { deletedAt: new Date() }
        );
    }

    /**
     * Check if email exists
     */
    async emailExists(email: string): Promise<boolean> {
        return this.exists({ email });
    }

    /**
     * Find user with membership tier
     */
    async findWithMembershipTier(id: string) {
        return this.findById(id, {
            membershipTier: true
        });
    }
}
