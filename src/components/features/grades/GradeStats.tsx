// src/components/features/grades/GradeStats.tsx

'use client';

import React from 'react';
import { GraduationCap, CheckCircle2, XCircle } from 'lucide-react';
import { Grade } from '@/types/grades.types';
import { Card, CardContent } from '@/components/ui/card';

interface GradeStatsProps {
  grades: Grade[];
}

/**
 * 📊 Tarjetas de estadísticas de grados - Diseño simple y limpio
 */
export function GradeStats({ grades }: GradeStatsProps) {
  const totalGrades = grades.length;
  const activeGrades = grades.filter(g => g.isActive).length;
  const inactiveGrades = grades.filter(g => !g.isActive).length;

  const stats = [
    {
      label: 'Total de Grados',
      value: totalGrades,
      icon: GraduationCap,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-300 dark:border-blue-700',
      iconBg: 'bg-blue-600 dark:bg-blue-500',
      textColor: 'text-blue-900 dark:text-blue-100',
      labelColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Grados Activos',
      value: activeGrades,
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-300 dark:border-emerald-700',
      iconBg: 'bg-emerald-600 dark:bg-emerald-500',
      textColor: 'text-emerald-900 dark:text-emerald-100',
      labelColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Grados Inactivos',
      value: inactiveGrades,
      icon: XCircle,
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      borderColor: 'border-gray-300 dark:border-gray-700',
      iconBg: 'bg-gray-600 dark:bg-gray-500',
      textColor: 'text-gray-900 dark:text-gray-100',
      labelColor: 'text-gray-600 dark:text-gray-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className={`border-2 ${stat.borderColor} ${stat.bgColor}
            hover:shadow-lg transition-shadow duration-200`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {/* Icon */}
              <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${stat.iconBg} shadow-md`}>
                <stat.icon className="h-7 w-7 text-white" strokeWidth={2.5} />
              </div>

              {/* Value */}
              <div className="text-right">
                <p className={`text-5xl font-bold ${stat.textColor} tabular-nums`}>
                  {stat.value}
                </p>
              </div>
            </div>

            {/* Label */}
            <div className="mt-4">
              <p className={`text-sm font-bold uppercase tracking-wide ${stat.labelColor}`}>
                {stat.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default GradeStats;
