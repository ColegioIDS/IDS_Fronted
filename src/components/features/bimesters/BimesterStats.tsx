// src/components/features/bimesters/BimesterStats.tsx

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, CheckCircle2, XCircle, Hash } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Bimester } from '@/types/bimester.types';

interface BimesterStatsProps {
  data: Bimester[];
  isLoading: boolean;
}

/**
 * Tarjetas de estadísticas de bimestres
 */
export function BimesterStats({ data, isLoading }: BimesterStatsProps) {
  const stats = React.useMemo(() => {
    const total = data.length;
    const active = data.filter(b => b.isActive).length;
    const inactive = total - active;
    const avgWeeks = total > 0 
      ? Math.round(data.reduce((sum, b) => sum + b.weeksCount, 0) / total)
      : 0;

    return { total, active, inactive, avgWeeks };
  }, [data]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white dark:bg-gray-900">
            <CardContent className="p-6">
              <Skeleton className="h-12 w-12 rounded-full mb-4" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Bimestres',
      value: stats.total,
      icon: Hash,
      color: 'blue',
      bgLight: 'bg-blue-50 dark:bg-blue-950/30',
      textColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    },
    {
      title: 'Activos',
      value: stats.active,
      icon: CheckCircle2,
      color: 'green',
      bgLight: 'bg-green-50 dark:bg-green-950/30',
      textColor: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-100 dark:bg-green-900/50',
    },
    {
      title: 'Inactivos',
      value: stats.inactive,
      icon: XCircle,
      color: 'gray',
      bgLight: 'bg-gray-50 dark:bg-gray-900/30',
      textColor: 'text-gray-600 dark:text-gray-400',
      iconBg: 'bg-gray-100 dark:bg-gray-800/50',
    },
    {
      title: 'Promedio Semanas',
      value: stats.avgWeeks,
      icon: Calendar,
      color: 'purple',
      bgLight: 'bg-purple-50 dark:bg-purple-950/30',
      textColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index} 
            className={`${stat.bgLight} border-${stat.color}-200 dark:border-${stat.color}-800 transition-all hover:shadow-md`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.title}
                  </p>
                  <p className={`text-3xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.iconBg} p-3 rounded-full`}>
                  <Icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default BimesterStats;
