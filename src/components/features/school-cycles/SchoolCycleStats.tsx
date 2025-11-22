// src/components/features/school-cycles/SchoolCycleStats.tsx
'use client';

import { SchoolCycle } from '@/types/school-cycle.types';
import { Card, CardContent } from '@/components/ui/card';
import {
  Calendar,
  BookOpen,
  Users,
  Lock,
  Zap,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';

interface SchoolCycleStatsProps {
  cycles: SchoolCycle[];
  isLoading?: boolean;
}

export function SchoolCycleStats({ cycles, isLoading = false }: SchoolCycleStatsProps) {
  const activeCycle = cycles.find((c) => c.isActive);
  const closedCycles = cycles.filter((c) => c.isArchived);
  const totalEnrollments = cycles.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0);
  const totalGrades = cycles.reduce((sum, c) => sum + (c._count?.grades || 0), 0);
  const totalBimesters = cycles.reduce((sum, c) => sum + (c._count?.bimesters || 0), 0);

  const stats = [
    {
      label: 'Ciclos Totales',
      value: cycles.length,
      icon: Calendar,
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-700 dark:text-blue-300',
    },
    {
      label: 'Ciclo Activo',
      value: activeCycle ? 1 : 0,
      icon: Zap,
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      subtitle: activeCycle?.name,
      hasData: !!activeCycle,
    },
    {
      label: 'Ciclos Cerrados',
      value: closedCycles.length,
      icon: Lock,
      bg: 'bg-gray-50 dark:bg-gray-900/20',
      border: 'border-gray-200 dark:border-gray-700',
      iconBg: 'bg-gray-100 dark:bg-gray-800/50',
      iconColor: 'text-gray-600 dark:text-gray-400',
      textColor: 'text-gray-700 dark:text-gray-300',
    },
    {
      label: 'Bimestres Totales',
      value: totalBimesters,
      icon: BookOpen,
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      iconBg: 'bg-amber-100 dark:bg-amber-900/50',
      iconColor: 'text-amber-600 dark:text-amber-400',
      textColor: 'text-amber-700 dark:text-amber-300',
      hasData: totalBimesters > 0,
    },
    {
      label: 'Grados Totales',
      value: totalGrades,
      icon: GraduationCap,
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      border: 'border-indigo-200 dark:border-indigo-800',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/50',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      textColor: 'text-indigo-700 dark:text-indigo-300',
      hasData: totalGrades > 0,
    },
    {
      label: 'Matrículas Totales',
      value: totalEnrollments,
      icon: Users,
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      iconBg: 'bg-purple-100 dark:bg-purple-900/50',
      iconColor: 'text-purple-600 dark:text-purple-400',
      textColor: 'text-purple-700 dark:text-purple-300',
      hasData: totalEnrollments > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="group relative overflow-hidden border border-gray-200 dark:border-gray-700 
              bg-white dark:bg-gray-800 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600
              transition-all duration-300 cursor-pointer"
          >
            <CardContent className="p-5 relative z-10">
              <div className="flex flex-col gap-3">
                {/* Icon */}
                <div className={`${stat.iconBg} p-2 rounded-lg flex-shrink-0 
                  group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} strokeWidth={2} />
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-2xl font-bold ${stat.textColor}
                      group-hover:scale-105 transition-transform duration-200 tabular-nums`}>
                      {isLoading ? '...' : stat.value}
                    </p>
                    {stat.hasData && stat.value > 0 && (
                      <TrendingUp className={`w-5 h-5 ${stat.iconColor}`} strokeWidth={2.5} />
                    )}
                  </div>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate font-medium">
                      {stat.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>

            {/* Decorative border effect */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-current
              opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg pointer-events-none"
              style={{
                color: stat.iconColor.includes('blue') ? '#3b82f6' :
                       stat.iconColor.includes('emerald') ? '#10b981' :
                       stat.iconColor.includes('gray') ? '#6b7280' :
                       stat.iconColor.includes('amber') ? '#f59e0b' :
                       stat.iconColor.includes('indigo') ? '#6366f1' :
                       stat.iconColor.includes('purple') ? '#9333ea' : '#6b7280'
              }} />

            {/* Bottom indicator bar */}
            <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${stat.iconColor.replace('text-', 'bg-')}
              opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          </Card>
        );
      })}
    </div>
  );
}
