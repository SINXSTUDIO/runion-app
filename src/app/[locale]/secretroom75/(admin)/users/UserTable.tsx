'use client';

import { useState } from 'react';
import { Mail, Trash2, UserCog, Check, X, Shield, ShieldAlert, ShieldCheck, Crown, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { updateUserRole, deleteUser, updateUserMembership } from '@/actions/admin-users';
import { forceLogoutUser } from '@/actions/user-actions';
import { useRouter } from 'next/navigation';

interface UserTableProps {
    users: any[];
    membershipTiers: any[];
}

export default function UserTable({ users, membershipTiers }: UserTableProps) {
    const router = useRouter();
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editingMembershipId, setEditingMembershipId] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [selectedTierId, setSelectedTierId] = useState<string>('');
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isLoggingOut, setIsLoggingOut] = useState<string | null>(null);

    const handleForceLogout = async (userId: string) => {
        if (!confirm('Biztosan ki szeretnéd léptetni ezt a felhasználót?')) return;

        setIsLoggingOut(userId);
        const result = await forceLogoutUser(userId);
        setIsLoggingOut(null);

        if (result.success) {
            toast.success('Felhasználó sikeresen kijelentkeztetve!');
            router.refresh();
        } else {
            toast.error(result.error || 'Hiba történt a kijelentkeztetés során.');
        }
    };

    const handleRoleUpdate = async (userId: string) => {
        const result = await updateUserRole(userId, selectedRole);
        if (result.success) {
            toast.success('Szerepkör sikeresen frissítve!');
            setEditingUserId(null);
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    const handleMembershipUpdate = async (userId: string) => {
        const result = await updateUserMembership(userId, selectedTierId === 'NONE' ? null : selectedTierId);
        if (result.success) {
            toast.success('Tagság sikeresen frissítve!');
            setEditingMembershipId(null);
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Biztosan törölni szeretnéd ezt a felhasználót? Ez a művelet nem vonható vissza.')) return;

        setIsDeleting(userId);
        const result = await deleteUser(userId);
        setIsDeleting(null);

        if (result.success) {
            toast.success('Felhasználó sikeresen törölve!');
            router.refresh();
        } else {
            toast.error(result.error);
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'ADMIN': return <ShieldAlert className="w-4 h-4 text-red-400" />;
            case 'STAFF': return <ShieldCheck className="w-4 h-4 text-blue-400" />;
            default: return <Shield className="w-4 h-4 text-zinc-400" />;
        }
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-red-500/20 text-red-400 border-red-500/20';
            case 'STAFF': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
            default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/20';
        }
    };

    const getTierRowClass = (tierName: string | undefined) => {
        if (!tierName) return 'hover:bg-white/[0.02] border-l-2 border-l-transparent';
        const lower = tierName.toLowerCase();

        if (lower.includes('gold') || lower.includes('arany')) return 'bg-yellow-500/10 hover:bg-yellow-500/20 border-l-2 border-l-yellow-500';
        if (lower.includes('silver') || lower.includes('ezüst') || lower.includes('silber')) return 'bg-slate-400/10 hover:bg-slate-400/20 border-l-2 border-l-slate-400';
        if (lower.includes('bronze') || lower.includes('bronz')) return 'bg-orange-700/10 hover:bg-orange-700/20 border-l-2 border-l-orange-700';
        if (lower.includes('vip')) return 'bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border-l-2 border-l-fuchsia-500';
        if (lower.includes('standard')) return 'bg-blue-500/5 hover:bg-blue-500/10 border-l-2 border-l-blue-500';

        return 'bg-accent/5 hover:bg-accent/10 border-l-2 border-l-accent';
    };

    return (
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 uppercase text-[10px] tracking-widest text-zinc-500 font-black">
                            <th className="p-6">Felhasználó</th>
                            <th className="p-6">Szerepkör</th>
                            <th className="p-6">Tagság</th>
                            <th className="p-6">Csatlakozott</th>
                            <th className="p-6 text-center">Nevezések</th>
                            <th className="p-6">Klub</th>
                            <th className="p-6 text-right">Műveletek</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                            <tr key={user.id} className={`${getTierRowClass(user.membershipTier?.name)} transition-colors group`}>
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        {user.image ? (
                                            <img src={user.image} alt="" className="w-10 h-10 rounded-full bg-zinc-800 object-cover ring-2 ring-white/5" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-sm font-black text-zinc-500 ring-2 ring-white/5">
                                                {user.firstName?.[0] || '?'}{user.lastName?.[0]}
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-bold text-white group-hover:text-accent transition-colors">
                                                {user.lastName} {user.firstName}
                                            </div>
                                            <div className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                                                <Mail className="w-3 h-3" />
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    {editingUserId === user.id ? (
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={selectedRole}
                                                onChange={(e) => setSelectedRole(e.target.value)}
                                                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-accent"
                                            >
                                                <option value="USER">USER</option>
                                                <option value="STAFF">STAFF</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                            <button onClick={() => handleRoleUpdate(user.id)} className="text-emerald-400 hover:text-emerald-300">
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setEditingUserId(null)} className="text-zinc-500 hover:text-white">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className="flex items-center gap-2 cursor-pointer group/role"
                                            onClick={() => {
                                                setEditingUserId(user.id);
                                                setSelectedRole(user.role);
                                            }}
                                        >
                                            <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase border ${getRoleBadgeClass(user.role)} flex items-center gap-1.5`}>
                                                {getRoleIcon(user.role)}
                                                {user.role}
                                            </span>
                                            <UserCog className="w-3.5 h-3.5 text-zinc-600 opacity-0 group-hover/role:opacity-100 transition-opacity" />
                                        </div>
                                    )}
                                </td>
                                <td className="p-6">
                                    {editingMembershipId === user.id ? (
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={selectedTierId}
                                                onChange={(e) => setSelectedTierId(e.target.value)}
                                                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-accent"
                                            >
                                                <option value="NONE">Alap tagság</option>
                                                {membershipTiers.map(tier => (
                                                    <option key={tier.id} value={tier.id}>{tier.name}</option>
                                                ))}
                                            </select>
                                            <button onClick={() => handleMembershipUpdate(user.id)} className="text-emerald-400 hover:text-emerald-300">
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setEditingMembershipId(null)} className="text-zinc-500 hover:text-white">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className="flex items-center gap-2 cursor-pointer group/tier"
                                            onClick={() => {
                                                setEditingMembershipId(user.id);
                                                setSelectedTierId(user.membershipTierId || 'NONE');
                                            }}
                                        >
                                            <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase border flex items-center gap-1.5 ${user.membershipTier ? 'bg-accent/20 text-accent border-accent/20' : 'bg-zinc-500/20 text-zinc-400 border-zinc-500/20'
                                                }`}>
                                                <Crown className={`w-3.5 h-3.5 ${user.membershipTier ? 'text-accent' : 'text-zinc-500'}`} />
                                                {user.membershipTier?.name || 'Standard'}
                                            </span>
                                            <UserCog className="w-3.5 h-3.5 text-zinc-600 opacity-0 group-hover/tier:opacity-100 transition-opacity" />
                                        </div>
                                    )}
                                </td>
                                <td className="p-6 text-sm text-zinc-400 font-mono">
                                    {new Date(user.createdAt).toLocaleDateString('hu-HU')}
                                </td>
                                <td className="p-6 text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-sm font-bold text-white border border-white/5">
                                        {user._count.registrations}
                                    </span>
                                </td>
                                <td className="p-6 text-sm text-zinc-400">
                                    {user.clubName || <span className="text-zinc-600 italic">nincs</span>}
                                </td>
                                <td className="p-6 text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(user.id)}
                                        disabled={isDeleting === user.id}
                                        className="text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                        title="Törlés"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleForceLogout(user.id)}
                                        disabled={isLoggingOut === user.id}
                                        className="text-zinc-600 hover:text-orange-400 hover:bg-orange-400/10 transition-all ml-1"
                                        title="Kényszerített Kijelentkeztetés"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
