// src/components/features/grades/GradeStats.tsx

'use client';

import React from 'react';
import { GraduationCap, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { Grade } from '@/types/grades.types';
import { Card, CardContent } from '@/components/ui/card';

interface GradeStatsProps {
  grades: Grade[];
}

/**
 * 📊 Tarjetas de estadísticas de grados sin gradientes
 */
export function GradeStats({ grades }: GradeStatsProps) {
  const totalGrades = grades.length;
  const activeGrades = grades.filter(g => g.isActive).length;
  const inactiveGrades = grades.filter(g => !g.isActive).length;
  const activePercentage = totalGrades > 0 ? Math.round((activeGrades / totalGrades) * 100) : 0;

  const stats = [
    {
      label: 'Total de Grados',
      value: totalGrades,
      icon: GraduationCap,
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconBg: 'bg-blue-100 dark:bg-blue-950 border-blue-300 dark:border-blue-700',
      iconColor: 'text-blue-700 dark:text-blue-300',
      textColor: 'text-blue-900 dark:text-blue-100',
    },
    {
      label: 'Grados Activos',
      value: activeGrades,
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700',
      iconColor: 'text-emerald-700 dark:text-emerald-300',
      textColor: 'text-emerald-900 dark:text-emerald-100',
      percentage: activePercentage,
    },
    {
      label: 'Grados Inactivos',
      value: inactiveGrades,
      icon: XCircle,
      bgColor: 'bg-gray-50 dark:bg-gray-950',
      borderColor: 'border-gray-200 dark:border-gray-700',
      iconBg: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600',
      iconColor: 'text-gray-700 dark:text-gray-300',
      textColor: 'text-gray-900 dark:text-gray-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card 
          key={index}
          className={`border-2 ${stat.borderColor} ${stat.bgColor} hover:shadow-lg transition-shadow duration-200`}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {/* Icon con buen contraste */}
              <div className={`flex items-center justify-center w-14 h-14 rounded-lg border-2 ${stat.iconBg}`}>
                <stat.icon className={`h-7 w-7 ${stat.iconColor}`} />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-4xl font-bold ${stat.textColor} tabular-nums`}>
                    {stat.value}
                  </p>
                  {stat.percentage !== undefined && (
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {stat.percentage}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Progress bar sin gradientes */}
            {stat.percentage !== undefined && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                  <span>Porcentaje activo</span>
                  <span>{stat.percentage}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 dark:bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default GradeStats;
