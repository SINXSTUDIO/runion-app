'use client';

import { Trophy, Calendar, CheckCircle, DollarSign } from 'lucide-react';

type DashboardStatsProps = {
    stats: {
        totalRegistrations: number;
        activeRegistrations: number;
        completedRaces: number;
        totalPaid: number;
    };
};

export default function DashboardStats({ stats }: DashboardStatsProps) {
    const statCards = [
        {
            label: 'Összes Nevezés',
            value: stats.totalRegistrations,
            icon: Trophy,
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-500/20 to-blue-600/5',
        },
        {
            label: 'Aktív Nevezés',
            value: stats.activeRegistrations,
            icon: Calendar,
            gradient: 'from-emerald-500 to-emerald-600',
            bgGradient: 'from-emerald-500/20 to-emerald-600/5',
        },
        {
            label: 'Teljesített Verseny',
            value: stats.completedRaces,
            icon: CheckCircle,
            gradient: 'from-purple-500 to-purple-600',
            bgGradient: 'from-purple-500/20 to-purple-600/5',
        },
        {
            label: 'Kifizetett Összeg',
            value: `${stats.totalPaid.toLocaleString('hu-HU')} Ft`,
            icon: DollarSign,
            gradient: 'from-amber-500 to-amber-600',
            bgGradient: 'from-amber-500/20 to-amber-600/5',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => {
                const Icon = stat.icon;

                return (
                    <div
                        key={stat.label}
                        className={`
              bg-gradient-to-br ${stat.bgGradient} 
              border border-white/10 rounded-2xl p-6 backdrop-blur-sm
              hover:scale-105 transition-transform duration-300
              animate-in slide-in-from-bottom-4 fade-in
            `}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-white">{stat.value}</p>
                            </div>
                        </div>
                        <p className="text-sm text-zinc-400 font-medium">{stat.label}</p>
                    </div>
                );
            })}
        </div>
    );
}
