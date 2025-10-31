// src/components/features/sections/SectionStats.tsx

'use client';

import React from 'react';
import { Users, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { Section } from '@/types/sections.types';
import { Card, CardContent } from '@/components/ui/card';

interface SectionStatsProps {
  sections: Section[];
}

/**
 * 📊 Tarjetas de estadísticas de secciones sin gradientes
 */
export function SectionStats({ sections }: SectionStatsProps) {
  const totalSections = sections.length;
  const sectionsWithTeacher = sections.filter(s => s.teacherId).length;
  const sectionsWithoutTeacher = sections.filter(s => !s.teacherId).length;
  
  // Calcular utilización promedio
  const totalEnrollments = sections.reduce((sum, s) => sum + (s._count?.enrollments || 0), 0);
  const totalCapacity = sections.reduce((sum, s) => sum + s.capacity, 0);
  const averageUtilization = totalCapacity > 0 
    ? Math.round((totalEnrollments / totalCapacity) * 100) 
    : 0;

  const stats = [
    {
      label: 'Total de Secciones',
      value: totalSections,
      icon: Users,
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconBg: 'bg-blue-100 dark:bg-blue-950 border-blue-300 dark:border-blue-700',
      iconColor: 'text-blue-700 dark:text-blue-300',
      textColor: 'text-blue-900 dark:text-blue-100',
    },
    {
      label: 'Con Profesor Asignado',
      value: sectionsWithTeacher,
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700',
      iconColor: 'text-emerald-700 dark:text-emerald-300',
      textColor: 'text-emerald-900 dark:text-emerald-100',
      percentage: totalSections > 0 ? Math.round((sectionsWithTeacher / totalSections) * 100) : 0,
    },
    {
      label: 'Sin Profesor Asignado',
      value: sectionsWithoutTeacher,
      icon: AlertCircle,
      bgColor: 'bg-amber-50 dark:bg-amber-950',
      borderColor: 'border-amber-200 dark:border-amber-800',
      iconBg: 'bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-700',
      iconColor: 'text-amber-700 dark:text-amber-300',
      textColor: 'text-amber-900 dark:text-amber-100',
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

            {/* Progress bar sin gradientes para secciones con profesor */}
            {stat.percentage !== undefined && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                  <span>Cobertura de profesores</span>
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

export default SectionStats;
