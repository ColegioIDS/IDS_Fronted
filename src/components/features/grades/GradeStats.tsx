// src/components/features/grades/GradeStats.tsx

'use client';

import React from 'react';
import { GraduationCap, CheckCircle2, XCircle, TrendingUp, Target } from 'lucide-react';
import { Grade } from '@/types/grades.types';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface GradeStatsProps {
  grades: Grade[];
}

/**
 * 📊 Tarjetas de estadísticas de grados sin gradientes con tooltips
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
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700',
      iconColor: 'text-blue-700 dark:text-blue-300',
      textColor: 'text-blue-900 dark:text-blue-100',
      labelColor: 'text-blue-600 dark:text-blue-400',
      tooltip: 'Cantidad total de grados registrados en el sistema',
    },
    {
      label: 'Grados Activos',
      value: activeGrades,
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-300 dark:border-emerald-700',
      iconColor: 'text-emerald-700 dark:text-emerald-300',
      textColor: 'text-emerald-900 dark:text-emerald-100',
      labelColor: 'text-emerald-600 dark:text-emerald-400',
      percentage: activePercentage,
      tooltip: 'Grados actualmente disponibles para uso',
    },
    {
      label: 'Grados Inactivos',
      value: inactiveGrades,
      icon: XCircle,
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      borderColor: 'border-gray-200 dark:border-gray-700',
      iconBg: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600',
      iconColor: 'text-gray-700 dark:text-gray-300',
      textColor: 'text-gray-900 dark:text-gray-100',
      labelColor: 'text-gray-600 dark:text-gray-400',
      tooltip: 'Grados desactivados o no disponibles',
    },
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Card
                className={`border-2 ${stat.borderColor} ${stat.bgColor}
                  hover:shadow-xl hover:-translate-y-1
                  transition-all duration-300 ease-out cursor-help
                  group relative overflow-hidden`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {/* Icon con buen contraste y animación */}
                    <div className={`relative flex items-center justify-center w-16 h-16 rounded-xl border-2 ${stat.iconBg}
                      shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
                      <stat.icon className={`h-8 w-8 ${stat.iconColor}`} strokeWidth={2.5} />

                      {/* Decorative ring */}
                      <div className="absolute inset-0 rounded-xl border-2 border-transparent
                        group-hover:border-current opacity-0 group-hover:opacity-20
                        transition-opacity duration-300" />
                    </div>

                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${stat.labelColor} mb-1.5 uppercase tracking-wide`}>
                        {stat.label}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className={`text-4xl font-bold ${stat.textColor} tabular-nums`}>
                          {stat.value}
                        </p>
                        {stat.percentage !== undefined && (
                          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
                            {stat.percentage}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Decorative Target Icon */}
                    <div className="absolute -right-2 -bottom-2 opacity-5">
                      <Target className="w-24 h-24" strokeWidth={1} />
                    </div>
                  </div>

                  {/* Progress bar sin gradientes */}
                  {stat.percentage !== undefined && (
                    <div className="mt-5 space-y-2">
                      <div className="flex justify-between text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          Porcentaje activo
                        </span>
                        <span className="font-bold tabular-nums">{stat.percentage}%</span>
                      </div>
                      <div className="relative h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-emerald-500 dark:bg-emerald-600 rounded-full
                            transition-all duration-700 ease-out
                            shadow-sm"
                          style={{ width: `${stat.percentage}%` }}
                        />
                        {/* Progress indicator dot */}
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-600 dark:bg-emerald-500
                            rounded-full border-2 border-white dark:border-gray-900 shadow-md
                            transition-all duration-700 ease-out"
                          style={{ left: `calc(${stat.percentage}% - 6px)` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Decorative bottom accent */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 ${stat.borderColor}
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

export default GradeStats;
