// src/components/features/course-grades/CourseGradeStats.tsx
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BookOpen, GraduationCap, CheckCircle2, Circle, BarChart3 } from 'lucide-react';

interface CourseGradeStatsProps {
  totalAssignments: number;
  totalCourses: number;
  totalGrades: number;
  coreAssignments: number;
  electiveAssignments: number;
}

export default function CourseGradeStats({
  totalAssignments,
  totalCourses,
  totalGrades,
  coreAssignments,
  electiveAssignments,
}: CourseGradeStatsProps) {
  const stats = [
    {
      icon: BarChart3,
      label: 'Total Asignaciones',
      value: totalAssignments,
      iconBg: 'bg-blue-100 dark:bg-blue-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      valueColor: 'text-blue-600 dark:text-blue-400',
      tooltip: 'Número total de cursos asignados a grados',
    },
    {
      icon: BookOpen,
      label: 'Cursos Asignados',
      value: totalCourses,
      iconBg: 'bg-indigo-100 dark:bg-indigo-950/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      valueColor: 'text-indigo-600 dark:text-indigo-400',
      tooltip: 'Cantidad de cursos únicos con asignaciones',
    },
    {
      icon: GraduationCap,
      label: 'Grados con Cursos',
      value: totalGrades,
      iconBg: 'bg-purple-100 dark:bg-purple-950/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      valueColor: 'text-purple-600 dark:text-purple-400',
      tooltip: 'Cantidad de grados con cursos asignados',
    },
    {
      icon: CheckCircle2,
      label: 'Cursos Núcleo',
      value: coreAssignments,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
      tooltip: 'Asignaciones de cursos obligatorios del plan de estudios',
    },
    {
      icon: Circle,
      label: 'Cursos Electivos',
      value: electiveAssignments,
      iconBg: 'bg-amber-100 dark:bg-amber-950/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      valueColor: 'text-amber-600 dark:text-amber-400',
      tooltip: 'Asignaciones de cursos opcionales',
    },
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Card className="border-2 border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-help">
                  <CardContent className="p-6 bg-white dark:bg-gray-900">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-md ${stat.iconBg}`}>
                      <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                    </div>

                    <div className="mt-4">
                      <h4 className={`text-3xl font-bold ${stat.valueColor}`}>
                        {stat.value}
                      </h4>
                      <span className="mt-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0">
                <p className="font-semibold">{stat.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
