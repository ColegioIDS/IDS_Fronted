// src/components/features/users/UserStats.tsx
'use client';

import { UserStats as UserStatsType } from '@/types/users.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle2, Lock, Mail, Eye, LockKeyhole } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserStatsProps {
  stats: UserStatsType | null;
  isLoading?: boolean;
  permissionError?: string | null;
}

export function UserStats({ stats, isLoading, permissionError }: UserStatsProps) {
  // ✅ Si hay error de permisos, mostrar alerta
  if (permissionError) {
    return (
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <LockKeyhole className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          {permissionError}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader className="pb-3">
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Usuarios',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      title: 'Activos',
      value: stats?.activeUsers ?? 0,
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      title: 'Inactivos',
      value: stats?.inactiveUsers ?? 0,
      icon: Lock,
      color: 'text-slate-600 dark:text-slate-400',
      bgColor: 'bg-slate-50 dark:bg-slate-800/50',
    },
    {
      title: 'Verificados',
      value: stats?.verifiedEmails ?? 0,
      icon: Mail,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      title: 'Con Acceso',
      value: stats?.canAccessPlatform ?? 0,
      icon: Eye,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statsCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className="border-l-4 border-l-transparent hover:border-l-slate-300 dark:hover:border-l-slate-600 transition-colors dark:bg-slate-900 dark:border-slate-800"
          >
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stat.value.toLocaleString('es-GT')}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {statsCards[0].value > 0 ? Math.round((stat.value / statsCards[0].value) * 100) : 0}% del total
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
