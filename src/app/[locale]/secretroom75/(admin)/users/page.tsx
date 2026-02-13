import prisma from '@/lib/prisma';
import { Users } from 'lucide-react';
import UserTable from './UserTable';
import { getMembershipTiers } from '@/actions/memberships';

export default async function AdminUsersPage() {
    const [users, membershipTiers] = await Promise.all([
        prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { registrations: true }
                },
                membershipTier: true
            }
        }),
        getMembershipTiers()
    ]);

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500 container mx-auto px-4 max-w-7xl py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black italic uppercase mb-2 flex items-center gap-3 text-white">
                        <Users className="w-8 h-8 text-accent" />
                        Felhasználók ({users.length})
                    </h1>
                    <p className="text-zinc-400">
                        Regisztrált felhasználók kezelése, jogosultságok, tagságok és törlés
                    </p>
                </div>
            </div>

            <UserTable users={users} membershipTiers={membershipTiers} />
        </div>
    );
}
