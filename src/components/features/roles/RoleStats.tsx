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
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Roles Activos',
      value: active,
      icon: CheckCircle2,
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Roles Inactivos',
      value: inactive,
      icon: XCircle,
      gradient: 'from-gray-500 to-gray-600',
      bg: 'bg-gray-50 dark:bg-gray-950/30',
      iconColor: 'text-gray-600 dark:text-gray-400',
    },
    {
      label: 'Roles del Sistema',
      value: system,
      icon: Shield,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card
            key={index}
            className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
            
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                
                <div className={`${stat.bg} p-4 rounded-2xl`}>
                  <Icon className={`w-8 h-8 ${stat.iconColor}`} strokeWidth={2} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}