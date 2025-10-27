// src/components/features/school-cycles/SchoolCycleStats.tsx

'use client';

import { SchoolCycle } from '@/types/school-cycle.types';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, BookOpen, Users, FileText, Lock, Zap } from 'lucide-react';

interface SchoolCycleStatsProps {
  cycles: SchoolCycle[];
  isLoading?: boolean;
}

export function SchoolCycleStats({ cycles, isLoading = false }: SchoolCycleStatsProps) {
  const activeCycle = cycles.find((c) => c.isActive);
  const closedCycles = cycles.filter((c) => c.isClosed);
  const totalEnrollments = cycles.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0);
  const totalGrades = cycles.reduce((sum, c) => sum + (c._count?.grades || 0), 0);

  const stats = [
    {
      label: 'Ciclos Totales',
      value: cycles.length,
      icon: Calendar,
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Ciclo Activo',
      value: activeCycle ? 1 : 0,
      icon: Zap,
      bg: 'bg-green-50 dark:bg-green-950/30',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-300',
      iconColor: 'text-green-600 dark:text-green-400',
      subtitle: activeCycle?.name,
    },
    {
      label: 'Ciclos Cerrados',
      value: closedCycles.length,
      icon: Lock,
      bg: 'bg-gray-50 dark:bg-gray-950/30',
      border: 'border-gray-200 dark:border-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      iconColor: 'text-gray-600 dark:text-gray-400',
    },
    {
      label: 'Grados Totales',
      value: totalGrades,
      icon: BookOpen,
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Matrículas Totales',
      value: totalEnrollments,
      icon: Users,
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className={`relative overflow-hidden border ${stat.border} shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}
          >
            <div className={`absolute inset-0 ${stat.bg} opacity-50`} />
            <CardContent className="relative p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className={`text-3xl font-bold mt-1 ${stat.text}`}>
                    {isLoading ? '...' : stat.value}
                  </p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                      {stat.subtitle}
                    </p>
                  )}
                </div>
                <div className={`${stat.bg} p-3 rounded-xl border ${stat.border}`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} strokeWidth={2.5} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}