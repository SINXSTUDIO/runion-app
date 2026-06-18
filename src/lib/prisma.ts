import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prismaClient: PrismaClient };

const prismaClient = globalForPrisma.prismaClient || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaClient = prismaClient;

export const prisma = prismaClient.$extends({
    query: {
        user: {
            async findMany({ args, query }) {
                if (args.where && 'deletedAt' in args.where) {
                    return query(args);
                }
                args.where = { ...args.where, deletedAt: null };
                return query(args);
            },
            async findFirst({ args, query }) {
                if (args.where && 'deletedAt' in args.where) {
                    return query(args);
                }
                args.where = { ...args.where, deletedAt: null };
                return query(args);
            },
            async findUnique({ args, query }) {
                const result = await query(args);
                if (result && (result as any).deletedAt !== null) {
                    if (args.where && 'deletedAt' in args.where) {
                        return result;
                    }
                    return null;
                }
                return result;
            },
            async count({ args, query }) {
                if (args.where && 'deletedAt' in args.where) {
                    return query(args);
                }
                args.where = { ...args.where, deletedAt: null };
                return query(args);
            }
        }
    }
});

export default prisma;
