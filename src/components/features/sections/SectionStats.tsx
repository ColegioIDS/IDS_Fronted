// src/components/features/sections/SectionStats.tsx

'use client';

import React from 'react';
import { Users, CheckCircle2, AlertCircle, TrendingUp, Award, UserCheck, UserX, Percent } from 'lucide-react';
import { Section } from '@/types/sections.types';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SectionStatsProps {
  sections: Section[];
}

/**
 * 📊 Tarjetas de estadísticas de secciones mejoradas - Diseño profesional
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

  const teacherPercentage = totalSections > 0
    ? Math.round((sectionsWithTeacher / totalSections) * 100)
    : 0;

  const stats = [
    {
      label: 'Total de Secciones',
      value: totalSections,
      icon: Users,
      secondaryIcon: Award,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-300 dark:border-blue-700',
      iconBg: 'bg-blue-600 dark:bg-blue-500',
      textColor: 'text-blue-900 dark:text-blue-100',
      labelColor: 'text-blue-700 dark:text-blue-400',
      accentColor: 'bg-blue-100 dark:bg-blue-900/40',
      tooltip: 'Número total de secciones registradas en el sistema',
      subInfo: `${totalEnrollments} estudiantes inscritos`,
    },
    {
      label: 'Con Profesor',
      value: sectionsWithTeacher,
      icon: UserCheck,
      secondaryIcon: TrendingUp,
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-300 dark:border-emerald-700',
      iconBg: 'bg-emerald-600 dark:bg-emerald-500',
      textColor: 'text-emerald-900 dark:text-emerald-100',
      labelColor: 'text-emerald-700 dark:text-emerald-400',
      accentColor: 'bg-emerald-100 dark:bg-emerald-900/40',
      percentage: teacherPercentage,
      tooltip: 'Secciones con profesor asignado',
      subInfo: 'Cobertura de profesores',
    },
    {
      label: 'Sin Profesor',
      value: sectionsWithoutTeacher,
      icon: UserX,
      secondaryIcon: AlertCircle,
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-300 dark:border-amber-700',
      iconBg: 'bg-amber-600 dark:bg-amber-500',
      textColor: 'text-amber-900 dark:text-amber-100',
      labelColor: 'text-amber-700 dark:text-amber-400',
      accentColor: 'bg-amber-100 dark:bg-amber-900/40',
      tooltip: 'Secciones que necesitan asignación de profesor',
      subInfo: 'Requieren atención',
      warning: sectionsWithoutTeacher > 0,
    },
    {
      label: 'Utilización Promedio',
      value: averageUtilization,
      icon: Percent,
      secondaryIcon: TrendingUp,
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-300 dark:border-purple-700',
      iconBg: 'bg-purple-600 dark:bg-purple-500',
      textColor: 'text-purple-900 dark:text-purple-100',
      labelColor: 'text-purple-700 dark:text-purple-400',
      accentColor: 'bg-purple-100 dark:bg-purple-900/40',
      suffix: '%',
      tooltip: 'Porcentaje promedio de ocupación de las secciones',
      subInfo: `${totalEnrollments} / ${totalCapacity} plazas`,
      percentage: averageUtilization,
    },
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Card
                className={`group relative border-2 ${stat.borderColor} ${stat.bgColor}
                  hover:shadow-2xl hover:-translate-y-1
                  transition-all duration-300 ease-out cursor-help
                  overflow-hidden`}
              >
                {/* Warning badge */}
                {stat.warning && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 dark:bg-red-600 animate-pulse shadow-lg">
                      <AlertCircle className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                  </div>
                )}

                {/* Background decoration */}
                <div className="absolute -right-8 -bottom-8 w-32 h-32 opacity-10">
                  <stat.secondaryIcon className="w-full h-full" strokeWidth={1} />
                </div>

                <CardContent className="p-6 relative z-10">
                  {/* Icon and Value Row */}
                  <div className="flex items-start justify-between mb-4">
                    {/* Icon */}
                    <div className={`flex items-center justify-center w-16 h-16 rounded-2xl ${stat.iconBg}
                      shadow-lg group-hover:scale-110 group-hover:rotate-3
                      transition-all duration-300`}>
                      <stat.icon className="h-8 w-8 text-white" strokeWidth={2.5} />
                    </div>

                    {/* Value */}
                    <div className="text-right">
                      <p className={`text-5xl font-bold ${stat.textColor} tabular-nums
                        group-hover:scale-105 transition-transform duration-300`}>
                        {stat.value}{stat.suffix || ''}
                      </p>
                    </div>
                  </div>

                  {/* Label */}
                  <div className="mb-3">
                    <p className={`text-sm font-bold uppercase tracking-wide ${stat.labelColor}`}>
                      {stat.label}
                    </p>
                  </div>

                  {/* Sub info */}
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${stat.accentColor}`}>
                    <stat.secondaryIcon className={`w-4 h-4 ${stat.labelColor}`} strokeWidth={2.5} />
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {stat.subInfo}
                    </p>
                  </div>

                  {/* Progress bar for percentage stats */}
                  {stat.percentage !== undefined && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className={stat.labelColor}>{stat.percentage}%</span>
                        <span className="text-gray-500 dark:text-gray-400">100%</span>
                      </div>
                      <div className="relative h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 ${stat.iconBg} rounded-full
                            transition-all duration-700 ease-out shadow-sm`}
                          style={{ width: `${stat.percentage}%` }}
                        />
                        {/* Animated shimmer effect */}
                        <div
                          className="absolute inset-0 bg-white/30 rounded-full
                            translate-x-[-100%] group-hover:translate-x-[200%]
                            transition-transform duration-1000 ease-in-out"
                          style={{ width: '50%' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Bottom accent line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 ${stat.iconBg}
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
              <p className="font-semibold">{stat.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

export default SectionStats;
