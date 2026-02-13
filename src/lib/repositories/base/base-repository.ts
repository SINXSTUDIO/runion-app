import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Base Repository - Common CRUD operations
 * All specific repositories extend this class
 */
export abstract class BaseRepository<
    TModel,
    TCreateInput,
    TUpdateInput,
    TWhereUnique
> {
    protected abstract modelName: Prisma.ModelName;

    /**
     * Get Prisma delegate for the specific model
     */
    protected get model(): any {
        return (prisma as any)[this.modelName.toLowerCase()];
    }

    /**
     * Find by ID
     */
    async findById(
        id: string,
        include?: Record<string, any>
    ): Promise<TModel | null> {
        return this.model.findUnique({
            where: { id },
            include,
        });
    }

    /**
     * Find many with filters
     */
    async findMany(args?: {
        where?: any;
        include?: any;
        orderBy?: any;
        take?: number;
        skip?: number;
    }): Promise<TModel[]> {
        return this.model.findMany(args);
    }

    /**
     * Find one
     */
    async findUnique(where: TWhereUnique, include?: any): Promise<TModel | null> {
        return this.model.findUnique({ where, include });
    }

    /**
     * Create
     */
    async create(data: TCreateInput): Promise<TModel> {
        return this.model.create({ data });
    }

    /**
     * Update
     */
    async update(where: TWhereUnique, data: TUpdateInput): Promise<TModel> {
        return this.model.update({ where, data });
    }

    /**
     * Delete
     */
    async delete(where: TWhereUnique): Promise<TModel> {
        return this.model.delete({ where });
    }

    /**
     * Delete many
     */
    async deleteMany(where?: any): Promise<{ count: number }> {
        return this.model.deleteMany({ where });
    }

    /**
     * Count
     */
    async count(where?: any): Promise<number> {
        return this.model.count({ where });
    }

    /**
     * Exists check
     */
    async exists(where: any): Promise<boolean> {
        const count = await this.model.count({ where });
        return count > 0;
    }

    /**
     * Upsert
     */
    async upsert(
        where: TWhereUnique,
        create: TCreateInput,
        update: TUpdateInput
    ): Promise<TModel> {
        return this.model.upsert({ where, create, update });
    }
}
