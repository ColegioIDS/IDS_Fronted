// src/components/features/roles/RoleStats.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, CheckCircle2, XCircle } from 'lucide-react';

interface RoleStatsProps {
  total: number;
  active: number;
  inactive: number;
  system: number;
}

export function RoleStats({ total, active, inactive, system }: RoleStatsProps) {
  const stats = [
    {
      label: 'Total de Roles',
      value: total,
      icon: Shield,
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      iconBg: 'bg-purple-100 dark:bg-purple-900/50',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Roles Activos',
      value: active,
      icon: CheckCircle2,
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Roles Inactivos',
      value: inactive,
      icon: XCircle,
      bg: 'bg-gray-50 dark:bg-gray-900/20',
      border: 'border-gray-200 dark:border-gray-700',
      iconBg: 'bg-gray-100 dark:bg-gray-800/50',
      iconColor: 'text-gray-600 dark:text-gray-400',
    },
    {
      label: 'Roles del Sistema',
      value: system,
      icon: Shield,
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <Card
            key={index}
            className={`group relative overflow-hidden border-2 ${stat.border} ${stat.bg}
              shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-out
              cursor-pointer`}
          >
            <CardContent className="p-6 relative z-10">
              <div className="flex flex-col gap-4">
                {/* Icon */}
                <div className={`${stat.iconBg} p-5 rounded-2xl border-2 ${stat.border}
                  shadow-md group-hover:shadow-xl group-hover:scale-110
                  transition-all duration-300 ease-out w-fit`}>
                  <Icon className={`w-10 h-10 ${stat.iconColor}`} strokeWidth={2.5} />
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white
                    group-hover:scale-105 transition-transform duration-200">
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>

            {/* Decorative border effect */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-current
              opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg pointer-events-none"
              style={{ color: stat.iconColor.includes('purple') ? '#9333ea' :
                             stat.iconColor.includes('emerald') ? '#10b981' :
                             stat.iconColor.includes('blue') ? '#3b82f6' : '#6b7280' }} />
          </Card>
        );
      })}
    </div>
  );
}